'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useStore } from '@/lib/store'
import { usePreferences } from '@/lib/preferences'
import { useAuthStore } from '@/lib/auth-store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CreditCard,
  Lock,
  Truck,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import type { SerializedOrder } from '@/lib/serialize'

const SHIPPING_FLAT = 9.99
const FREE_SHIPPING_THRESHOLD = 75
const TAX_RATE = 0.08
const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France']

function formatCardNumber(v: string) {
  const digits = v.replace(/\D/g, '').slice(0, 19)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}
function formatExpiry(v: string) {
  const digits = v.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`
}

export function CheckoutView() {
  const t = useTranslations('checkout')
  const tCommon = useTranslations('common')
  const tCart = useTranslations('cart')
  const cart = useStore((s) => s.cart)
  const clearCart = useStore((s) => s.clearCart)
  const goConfirmation = useStore((s) => s.goConfirmation)
  const goCart = useStore((s) => s.goCart)
  const { locale, currency } = usePreferences()
  const user = useAuthStore((s) => s.user)

  const subtotal = cart.reduce((s, l) => s + l.price * l.quantity, 0)
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100
  const total = Math.round((subtotal + shipping + tax) * 100) / 100

  const [form, setForm] = useState({
    email: '',
    fullName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    phone: '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Pre-fill from the logged-in user (client-side; runs once user is known).
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        email: f.email || user.email,
        fullName: f.fullName || user.name,
      }))
    }
  }, [user])

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('invalidEmail')
    if (!form.fullName.trim()) e.fullName = tCommon('required')
    if (!form.address.trim()) e.address = tCommon('required')
    if (!form.city.trim()) e.city = tCommon('required')
    if (!form.state.trim()) e.state = tCommon('required')
    if (!form.zip.trim()) e.zip = tCommon('required')
    const cardDigits = form.cardNumber.replace(/\D/g, '')
    if (cardDigits.length < 13) e.cardNumber = t('invalidCard')
    if (!/^\d{2}\s*\/\s*\d{2}$/.test(form.cardExpiry)) e.cardExpiry = t('invalidExpiry')
    if (!/^\d{3,4}$/.test(form.cardCvc)) e.cardCvc = t('invalidCvc')
    if (!form.cardName.trim()) e.cardName = tCommon('required')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const placeOrder = async () => {
    if (!validate()) {
      toast.error(t('fixErrors'))
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          fullName: form.fullName,
          address: form.address,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country,
          phone: form.phone,
          paymentMethod: 'Card',
          cardNumber: form.cardNumber,
          cardName: form.cardName,
          cardExpiry: form.cardExpiry,
          cardCvc: form.cardCvc,
          items: cart.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || t('orderFailed'))
      }
      const order = data.order as SerializedOrder
      clearCart()
      toast.success(t('paymentSuccessful'), { description: order.orderNumber })
      goConfirmation(order.orderNumber)
    } catch (err) {
      toast.error(t('orderFailed'), {
        description: err instanceof Error ? err.message : '',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">{t('cartEmpty')}</h1>
        <p className="mt-2 text-muted-foreground">{t('cartEmptyDesc')}</p>
        <Button onClick={goCart} className="mt-6">
          <ArrowLeft size={16} className="mr-1" /> {t('backToCart')}
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <button
        onClick={goCart}
        className="mb-4 flex items-center gap-1 text-sm font-semibold text-brand-strong hover:underline"
      >
        <ArrowLeft size={15} /> {t('backToCart')}
      </button>

      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">{t('title')}</h1>

      <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
        <Lock size={16} />
        {t('secureNote')}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Forms */}
        <div className="flex flex-col gap-6">
          {/* Contact */}
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-sm font-bold text-brand-foreground">
                1
              </span>
              <h2 className="text-lg font-bold">{t('contactShipping')}</h2>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="email">{t('email')} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="you@example.com"
                  className={errors.email ? 'border-sale' : ''}
                />
                {errors.email && <p className="mt-1 text-xs text-sale">{errors.email}</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('emailHint')}
                </p>
              </div>

              <div>
                <Label htmlFor="fullName">{t('fullName')} *</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => set('fullName', e.target.value)}
                  className={errors.fullName ? 'border-sale' : ''}
                />
                {errors.fullName && <p className="mt-1 text-xs text-sale">{errors.fullName}</p>}
              </div>

              <div>
                <Label htmlFor="address">{t('address')} *</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder={t('addressPlaceholder')}
                  className={errors.address ? 'border-sale' : ''}
                />
                {errors.address && <p className="mt-1 text-xs text-sale">{errors.address}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="city">{t('city')} *</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => set('city', e.target.value)}
                    className={errors.city ? 'border-sale' : ''}
                  />
                  {errors.city && <p className="mt-1 text-xs text-sale">{errors.city}</p>}
                </div>
                <div>
                  <Label htmlFor="state">{t('state')} *</Label>
                  <Input
                    id="state"
                    value={form.state}
                    onChange={(e) => set('state', e.target.value)}
                    className={errors.state ? 'border-sale' : ''}
                  />
                  {errors.state && <p className="mt-1 text-xs text-sale">{errors.state}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="zip">{t('zip')} *</Label>
                  <Input
                    id="zip"
                    value={form.zip}
                    onChange={(e) => set('zip', e.target.value)}
                    className={errors.zip ? 'border-sale' : ''}
                  />
                  {errors.zip && <p className="mt-1 text-xs text-sale">{errors.zip}</p>}
                </div>
                <div>
                  <Label htmlFor="country">{t('country')} *</Label>
                  <Select
                    value={form.country}
                    onValueChange={(v) => set('country', v)}
                  >
                    <SelectTrigger id="country">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="phone">{t('phone')}</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder={t('phonePlaceholder')}
                />
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm">
                <Truck size={16} className="shrink-0 text-brand-strong" />
                <span>
                  <strong>{t('standardShipping')}</strong> — {t('standardShippingDesc')}{' '}
                  {shipping === 0 ? (
                    <span className="font-semibold text-green-600">({tCommon('free')})</span>
                  ) : (
                    `(${formatPrice(shipping, currency, locale)})`
                  )}
                </span>
              </div>
            </div>
          </Card>

          {/* Payment */}
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-sm font-bold text-brand-foreground">
                2
              </span>
              <h2 className="text-lg font-bold">{t('payment')}</h2>
              <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                <Lock size={12} /> {t('secured')}
              </span>
            </div>

            <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
              <CreditCard size={18} className="text-brand-strong" />
              <span className="text-sm font-medium">{t('creditDebit')}</span>
              <div className="ml-auto flex gap-1">
                {['VISA', 'MC', 'AMEX', 'DISC'].map((b) => (
                  <span
                    key={b}
                    className="rounded border border-border bg-white px-1.5 py-0.5 text-[9px] font-bold text-zinc-600"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="cardName">{t('nameOnCard')} *</Label>
                <Input
                  id="cardName"
                  value={form.cardName}
                  onChange={(e) => set('cardName', e.target.value)}
                  className={errors.cardName ? 'border-sale' : ''}
                />
                {errors.cardName && <p className="mt-1 text-xs text-sale">{errors.cardName}</p>}
              </div>
              <div>
                <Label htmlFor="cardNumber">{t('cardNumber')} *</Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    value={form.cardNumber}
                    onChange={(e) => set('cardNumber', formatCardNumber(e.target.value))}
                    placeholder={t('cardNumberPlaceholder')}
                    inputMode="numeric"
                    className={`pr-10 ${errors.cardNumber ? 'border-sale' : ''}`}
                  />
                  <CreditCard
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
                {errors.cardNumber && <p className="mt-1 text-xs text-sale">{errors.cardNumber}</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('testCard')}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cardExpiry">{t('expiry')} *</Label>
                  <Input
                    id="cardExpiry"
                    value={form.cardExpiry}
                    onChange={(e) => set('cardExpiry', formatExpiry(e.target.value))}
                    placeholder={t('expiryPlaceholder')}
                    inputMode="numeric"
                    className={errors.cardExpiry ? 'border-sale' : ''}
                  />
                  {errors.cardExpiry && <p className="mt-1 text-xs text-sale">{errors.cardExpiry}</p>}
                </div>
                <div>
                  <Label htmlFor="cardCvc">{t('cvc')} *</Label>
                  <Input
                    id="cardCvc"
                    value={form.cardCvc}
                    onChange={(e) => set('cardCvc', e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder={t('cvcPlaceholder')}
                    inputMode="numeric"
                    className={errors.cardCvc ? 'border-sale' : ''}
                  />
                  {errors.cardCvc && <p className="mt-1 text-xs text-sale">{errors.cardCvc}</p>}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-32 lg:h-fit">
          <Card className="p-5">
            <h2 className="mb-3 text-lg font-bold">{t('orderSummary')}</h2>

            <div className="mb-3 max-h-64 space-y-3 overflow-y-auto scroll-area-fancy pr-1">
              {cart.map((line) => (
                <div key={line.productId} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-white">
                    <Image
                      src={line.image || '/logo.svg'}
                      alt={line.name}
                      fill
                      sizes="56px"
                      className="object-contain p-1"
                    />
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-zinc-800 px-1 text-[10px] font-bold text-white">
                      {line.quantity}
                    </span>
                  </div>
                  <p className="line-clamp-2 flex-1 text-xs font-medium">{line.name}</p>
                  <span className="text-sm font-semibold">
                    {formatPrice(line.price * line.quantity, currency, locale)}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="my-3" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tCommon('subtotal')}</span>
                <span className="font-medium">{formatPrice(subtotal, currency, locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tCart('shipping')}</span>
                <span className="font-medium">
                  {shipping === 0 ? <span className="text-green-600">{tCommon('free')}</span> : formatPrice(shipping, currency, locale)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('taxLabel')}</span>
                <span className="font-medium">{formatPrice(tax, currency, locale)}</span>
              </div>
            </div>

            <Separator className="my-3" />
            <div className="flex items-center justify-between">
              <span className="text-base font-bold">{tCommon('items')}</span>
              <span className="text-2xl font-bold text-sale">{formatPrice(total, currency, locale)}</span>
            </div>

            <Button
              onClick={placeOrder}
              disabled={submitting}
              className="mt-4 w-full gap-2 bg-brand-strong text-brand-strong-foreground hover:bg-brand-strong/90 disabled:opacity-60"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> {t('processing')}
                </>
              ) : (
                <>
                  <Lock size={16} /> {t('pay', { amount: formatPrice(total, currency, locale) })}
                </>
              )}
            </Button>

            <div className="mt-3 space-y-1.5 text-center text-xs text-muted-foreground">
              <div className="flex items-center justify-center gap-1.5">
                <ShieldCheck size={13} /> {t('sslEncrypted')}
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle2 size={13} /> {t('moneyBack')}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
