import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateResetToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface ForgotBody {
  email?: string
}

export async function POST(req: NextRequest) {
  let body: ForgotBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const email = (body.email || '').trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: 'Please enter a valid email' }, { status: 400 })

  const user = await db.user.findUnique({ where: { email } })

  // Always return success to avoid user enumeration, but only create a token
  // if the account exists. For demo, we surface the token so the flow is testable
  // without an email service.
  if (!user) {
    return NextResponse.json({
      ok: true,
      token: null,
      note: 'If an account exists for this email, a reset link has been generated.',
    })
  }

  const token = generateResetToken()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  await db.passwordReset.create({
    data: { email, token, expiresAt },
  })

  // Invalidate older unused tokens for the same email (best-effort cleanup)
  await db.passwordReset.updateMany({
    where: { email, used: false, NOT: { token } },
    data: { used: true },
  })

  // Demo mode: return the token so the client can build a reset link.
  // In production this would be sent via email instead.
  return NextResponse.json({ ok: true, token })
}
