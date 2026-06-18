import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { serializeOrder } from '@/lib/serialize'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const { orderNumber } = await params
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  })
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  return NextResponse.json({ order: serializeOrder(order) })
}
