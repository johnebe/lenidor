import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { serializeCategory } from '@/lib/serialize'

export const dynamic = 'force-dynamic'

export async function GET() {
  const categories = await db.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json({ categories: categories.map(serializeCategory) })
}
