'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useStore } from '@/lib/store'
import { AuthLayout } from '@/components/views/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'

export function ResetPasswordView() {
  const t = useTranslations('auth')
  const token = useStore((s) => s.resetToken)
  const goLogin = useStore((s) => s.goLogin)

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError(t('passwordTooShort'))
      return
    }
    if (password !== confirm) {
      setError(t('passwordsDontMatch'))
      return
    }
    if (!token) {
      setError(t('invalidToken'))
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || t('invalidToken'))
      }
      toast.success(t('resetSuccess'))
      goLogin()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('invalidToken'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title={t('resetPassword')}
      subtitle={t('resetPasswordDesc')}
      footer={
        <>
          {t('rememberPassword')}{' '}
          <button onClick={goLogin} className="font-semibold text-brand-strong hover:underline">
            {t('signInHere')}
          </button>
        </>
      }
    >
      {!token ? (
        <div className="rounded-lg border border-sale/30 bg-sale/5 p-4 text-sm text-sale">
          {t('invalidToken')}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="reset-password">{t('newPassword')}</Label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="reset-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9"
                autoComplete="new-password"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t('passwordTooShort')}</p>
          </div>
          <div>
            <Label htmlFor="reset-confirm">{t('confirmPassword')}</Label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="reset-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="pl-9"
                autoComplete="new-password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-sale/30 bg-sale/5 p-3 text-sm text-sale">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full gap-2 bg-brand-strong text-brand-strong-foreground hover:bg-brand-strong/90"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> {t('loading')}
              </>
            ) : (
              t('resetPasswordBtn')
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
