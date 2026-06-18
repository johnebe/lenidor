import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface ResetBody {
  token?: string
  password?: string
}

export async function POST(req: NextRequest) {
  let body: ResetBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const token = (body.token || '').trim()
  const password = body.password || ''

  if (!token)
    return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
  if (password.length < 8)
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

  const record = await db.passwordReset.findUnique({ where: { token } })
  if (!record || record.used || record.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { email: record.email } })
  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
  }

  const passwordHash = await hashPassword(password)
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { passwordHash } }),
    db.passwordReset.update({ where: { token }, data: { used: true } }),
  ])

  return NextResponse.json({ ok: true })
}
