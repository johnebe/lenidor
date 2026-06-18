import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { serializeOrder } from '@/lib/serialize'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const SHIPPING_FLAT = 9.99
const FREE_SHIPPING_THRESHOLD = 75
const TAX_RATE = 0.08

interface CartItemInput {
  productId: string
  quantity: number
}

interface CheckoutBody {
  email: string
  fullName: string
  address: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string
  paymentMethod: string
  cardNumber?: string
  cardName?: string
  cardExpiry?: string
  cardCvc?: string
  items: CartItemInput[]
}

function isValidCardNumber(num?: string): boolean {
  if (!num) return false
  const cleaned = num.replace(/\D/g, '')
  if (cleaned.length < 13 || cleaned.length > 19) return false
  // Luhn check
  let sum = 0
  let alt = false
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let n = parseInt(cleaned[i], 10)
    if (alt) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}

function detectCardBrand(num: string): string {
  const n = num.replace(/\D/g, '')
  if (/^4/.test(n)) return 'Visa'
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard'
  if (/^3[47]/.test(n)) return 'American Express'
  if (/^6(?:011|5)/.test(n)) return 'Discover'
  return 'Card'
}

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase().slice(-6)
  const rnd = Math.random().toString(36).toUpperCase().slice(2, 6)
  return `LEN-${ts}${rnd}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = (searchParams.get('email') || '').trim().toLowerCase()
  const byUser = searchParams.get('user') === '1'

  // When requested by an authenticated user, fetch their orders directly.
  if (byUser) {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const orders = await db.order.findMany({
      where: { OR: [{ userId: session.sub }, { email: session.email }] },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ orders: orders.map(serializeOrder) })
  }

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }
  const orders = await db.order.findMany({
    where: { email },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ orders: orders.map(serializeOrder) })
}

export async function POST(req: NextRequest) {
  let body: CheckoutBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Basic validation
  const required = ['email', 'fullName', 'address', 'city', 'state', 'zip', 'country']
  for (const f of required) {
    if (!String((body as Record<string, unknown>)[f] || '').trim()) {
      return NextResponse.json({ error: `Missing field: ${f}` }, { status: 400 })
    }
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 })
  }

  // Payment validation
  if (body.paymentMethod === 'Card') {
    if (!isValidCardNumber(body.cardNumber)) {
      return NextResponse.json({ error: 'Invalid card number' }, { status: 400 })
    }
    if (!/^\d{2}\s*\/\s*\d{2}$/.test(body.cardExpiry || '')) {
      return NextResponse.json({ error: 'Invalid expiry date (MM/YY)' }, { status: 400 })
    }
    if (!/^\d{3,4}$/.test(body.cardCvc || '')) {
      return NextResponse.json({ error: 'Invalid CVC' }, { status: 400 })
    }
  } else {
    // For non-card methods, still require a card-like placeholder (we only support card in UI)
    return NextResponse.json({ error: 'Unsupported payment method' }, { status: 400 })
  }

  // Resolve products & validate stock
  const productIds = body.items.map((i) => i.productId)
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
  })
  if (products.length !== body.items.length) {
    return NextResponse.json({ error: 'One or more products are unavailable' }, { status: 400 })
  }

  let subtotal = 0
  const lineItems = body.items.map((item) => {
    const p = products.find((pr) => pr.id === item.productId)!
    const qty = Math.max(1, Math.min(99, Math.floor(item.quantity)))
    if (qty > p.stock) {
      throw new Error(`Only ${p.stock} units of "${p.name}" are available`)
    }
    const images: string[] = JSON.parse(p.images || '[]')
    subtotal += p.price * qty
    return {
      productId: p.id,
      productName: p.name,
      productImage: images[0] || '',
      price: p.price,
      quantity: qty,
    }
  })

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100
  const total = Math.round((subtotal + shipping + tax) * 100) / 100

  const orderNumber = generateOrderNumber()
  const cardLast4 = (body.cardNumber || '').replace(/\D/g, '').slice(-4)
  const cardBrand = detectCardBrand(body.cardNumber || '')

  // Simulate payment processing delay
  await new Promise((r) => setTimeout(r, 1400))

  // Attach to the logged-in user if a session exists
  const session = await getSession()

  const order = await db.order.create({
    data: {
      orderNumber,
      email: body.email.trim().toLowerCase(),
      fullName: body.fullName.trim(),
      address: body.address.trim(),
      city: body.city.trim(),
      state: body.state.trim(),
      zip: body.zip.trim(),
      country: body.country.trim(),
      phone: body.phone?.trim() || null,
      subtotal,
      shipping,
      tax,
      total,
      status: 'Processing',
      paymentMethod: `${cardBrand} ending in ${cardLast4}`,
      cardLast4,
      userId: session?.sub ?? null,
      items: {
        create: lineItems,
      },
    },
    include: { items: true },
  })

  // Decrement stock
  await Promise.all(
    lineItems.map((li) =>
      db.product.update({
        where: { id: li.productId },
        data: { stock: { decrement: li.quantity } },
      })
    )
  )

  return NextResponse.json({ order: serializeOrder(order) }, { status: 201 })
}
