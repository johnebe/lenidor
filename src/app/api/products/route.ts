import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { serializeProduct, serializeCategory } from '@/lib/serialize'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()
  const category = searchParams.get('category') || '' // slug
  const sort = searchParams.get('sort') || 'featured'
  const minPrice = parseFloat(searchParams.get('minPrice') || '')
  const maxPrice = parseFloat(searchParams.get('maxPrice') || '')
  const featuredOnly = searchParams.get('featured') === '1'
  const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200)

  const where: Record<string, unknown> = {}
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { brand: { contains: q } },
    ]
  }
  if (category && category !== 'all') {
    where.category = { slug: category }
  }
  if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
    where.price = {}
    if (!Number.isNaN(minPrice)) (where.price as Record<string, unknown>).gte = minPrice
    if (!Number.isNaN(maxPrice)) (where.price as Record<string, unknown>).lte = maxPrice
  }
  if (featuredOnly) where.featured = true

  let orderBy: Record<string, string> = { createdAt: 'desc' }
  switch (sort) {
    case 'price-asc':
      orderBy = { price: 'asc' }
      break
    case 'price-desc':
      orderBy = { price: 'desc' }
      break
    case 'rating':
      orderBy = { rating: 'desc' }
      break
    case 'newest':
      orderBy = { createdAt: 'desc' }
      break
    default:
      orderBy = { reviewCount: 'desc' }
  }

  const products = await db.product.findMany({
    where,
    include: { category: true },
    orderBy,
    take: limit,
  })

  const categories = await db.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({
    products: products.map(serializeProduct),
    categories: categories.map(serializeCategory),
  })
}
