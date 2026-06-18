'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useStore } from '@/lib/store'
import { useAuthStore } from '@/lib/auth-store'
import { AuthLayout } from '@/components/views/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'

export function LoginView() {
  const t = useTranslations('auth')
  const login = useAuthStore((s) => s.login)
  const goRegister = useStore((s) => s.goRegister)
  const goForgot = useStore((s) => s.goForgot)
  const goHome = useStore((s) => s.goHome)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError(t('invalidCredentials'))
      return
    }
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success(t('signedIn', { name: user.name }))
      goHome()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title={t('signIn')}
      subtitle={t('signInDesc')}
      footer={
        <>
          {t('noAccount')}{' '}
          <button onClick={goRegister} className="font-semibold text-brand-strong hover:underline">
            {t('signUpHere')}
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="login-email">{t('email')}</Label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="pl-9"
              autoComplete="email"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">{t('password')}</Label>
            <button
              type="button"
              onClick={goForgot}
              className="text-xs font-medium text-brand-strong hover:underline"
            >
              {t('forgotPassword')}
            </button>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-9"
              autoComplete="current-password"
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
            t('signInBtn')
          )}
        </Button>
      </form>
    </AuthLayout>
  )
}
