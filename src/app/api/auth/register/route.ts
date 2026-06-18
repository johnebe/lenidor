import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, createSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface RegisterBody {
  name?: string
  email?: string
  password?: string
}

export async function POST(req: NextRequest) {
  let body: RegisterBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const name = (body.name || '').trim()
  const email = (body.email || '').trim().toLowerCase()
  const password = body.password || ''

  if (!name) return NextResponse.json({ error: 'Please enter your name' }, { status: 400 })
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: 'Please enter a valid email' }, { status: 400 })
  if (password.length < 8)
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

  const existing = await db.user.findUnique({ where: { email } })
  if (existing)
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })

  const passwordHash = await hashPassword(password)
  const user = await db.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true, createdAt: true },
  })

  await createSession({ sub: user.id, email: user.email, name: user.name })

  return NextResponse.json({ user }, { status: 201 })
}
