'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useStore } from '@/lib/store'
import { useAuthStore } from '@/lib/auth-store'
import { AuthLayout } from '@/components/views/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, Lock, User } from 'lucide-react'
import { toast } from 'sonner'

export function RegisterView() {
  const t = useTranslations('auth')
  const register = useAuthStore((s) => s.register)
  const goLogin = useStore((s) => s.goLogin)
  const goHome = useStore((s) => s.goHome)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError(t('nameRequired'))
      return
    }
    if (!email.trim()) {
      setError(t('emailRequired'))
      return
    }
    if (password.length < 8) {
      setError(t('passwordTooShort'))
      return
    }
    if (password !== confirm) {
      setError(t('passwordsDontMatch'))
      return
    }
    setLoading(true)
    try {
      const user = await register(name, email, password)
      toast.success(t('accountCreated'), { description: user.email })
      goHome()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('emailExists'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title={t('createAccount')}
      subtitle={t('createAccountDesc')}
      footer={
        <>
          {t('haveAccount')}{' '}
          <button onClick={goLogin} className="font-semibold text-brand-strong hover:underline">
            {t('signInHere')}
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="reg-name">{t('name')}</Label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="reg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="pl-9"
              autoComplete="name"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="reg-email">{t('email')}</Label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="reg-email"
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
          <Label htmlFor="reg-password">{t('password')}</Label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="reg-password"
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
          <Label htmlFor="reg-confirm">{t('confirmPassword')}</Label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="reg-confirm"
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
            t('createAccountBtn')
          )}
        </Button>
      </form>
    </AuthLayout>
  )
}
