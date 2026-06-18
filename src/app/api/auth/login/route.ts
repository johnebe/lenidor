import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface LoginBody {
  email?: string
  password?: string
}

export async function POST(req: NextRequest) {
  let body: LoginBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const email = (body.email || '').trim().toLowerCase()
  const password = body.password || ''

  if (!email) return NextResponse.json({ error: 'Please enter your email' }, { status: 400 })
  if (!password) return NextResponse.json({ error: 'Please enter your password' }, { status: 400 })

  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }
  const ok = await verifyPassword(password, user.passwordHash)
  if (!ok) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  await createSession({ sub: user.id, email: user.email, name: user.name })

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
  })
}
