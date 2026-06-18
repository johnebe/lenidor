import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ user: null })
  }
  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: { id: true, name: true, email: true, createdAt: true },
  })
  if (!user) {
    return NextResponse.json({ user: null })
  }
  return NextResponse.json({ user })
}
