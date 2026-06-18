'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useStore } from '@/lib/store'
import { usePreferences } from '@/lib/preferences'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle2,
  Package,
  Truck,
  Copy,
  ArrowRight,
  Home,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { formatPrice, formatDate, formatDateShort } from '@/lib/utils'
import { toast } from 'sonner'
import type { SerializedOrder } from '@/lib/serialize'

export function ConfirmationView() {
  const t = useTranslations('confirmation')
  const tCommon = useTranslations('common')
  const tCart = useTranslations('cart')
  const orderNumber = useStore((s) => s.lastOrderNumber)
  const goHome = useStore((s) => s.goHome)
  const goBrowse = useStore((s) => s.goBrowse)
  const goOrders = useStore((s) => s.goOrders)
  const { locale, currency } = usePreferences()

  const { data, isLoading } = useQuery<{ order: SerializedOrder }>({
    queryKey: ['order', orderNumber],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderNumber}`)
      if (!res.ok) throw new Error('Failed to load order')
      return res.json()
    },
    enabled: !!orderNumber,
  })

  const order = data?.order

  const eta = order ? formatDateShort(new Date(new Date(order.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(), locale) : ''

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      {/* Success header */}
      <div className="flex flex-col items-center text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-green-100 dark:bg-green-950/40">
          <CheckCircle2 size={48} className="text-green-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('subtitle')}
        </p>
        {order && (
          <div className="mt-3 flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-1.5">
            <span className="text-sm text-muted-foreground">{t('order')}</span>
            <span className="font-mono text-sm font-bold">{order.orderNumber}</span>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(order.orderNumber)
                toast.success(t('copied'))
              }}
              className="text-muted-foreground hover:text-foreground"
              aria-label={t('copyOrder')}
            >
              <Copy size={13} />
            </button>
          </div>
        )}
      </div>

      {isLoading || !order ? (
        <Card className="mt-8 p-6">
          <div className="h-40 animate-pulse rounded bg-muted" />
        </Card>
      ) : (
        <>
          {/* Delivery tracker */}
          <Card className="mt-8 p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-brand/15 text-brand-strong">
                <Truck size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold">{t('estimatedDelivery')}</p>
                <p className="text-lg font-bold">{eta}</p>
              </div>
              <span className="ml-auto rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400">
                {order.status}
              </span>
            </div>

            {/* Steps */}
            <div className="mt-5 flex items-center">
              {[
                { icon: CheckCircle2, label: t('ordered'), done: true },
                { icon: Package, label: t('packed'), done: false },
                { icon: Truck, label: t('shipped'), done: false },
                { icon: Home, label: t('delivered'), done: false },
              ].map((s, i, arr) => (
                <div key={s.label} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`grid h-9 w-9 place-items-center rounded-full border-2 ${
                        s.done
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-border bg-background text-muted-foreground'
                      }`}
                    >
                      <s.icon size={16} />
                    </div>
                    <span className="mt-1.5 text-[11px] font-medium text-muted-foreground">
                      {s.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="mx-2 h-0.5 flex-1 bg-border" />
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Order details */}
          <Card className="mt-6 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold">{t('orderDetails')}</h2>
              <span className="text-sm text-muted-foreground">
                {t('placed', { date: formatDate(order.createdAt, locale) })}
              </span>
            </div>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-white">
                    <Image
                      src={item.productImage || '/logo.svg'}
                      alt={item.productName}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{t('qty', { count: item.quantity })}</p>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatPrice(item.price * item.quantity, currency, locale)}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tCommon('subtotal')}</span>
                <span>{formatPrice(order.subtotal, currency, locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tCart('shipping')}</span>
                <span>{order.shipping === 0 ? tCommon('free') : formatPrice(order.shipping, currency, locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tCommon('tax')}</span>
                <span>{formatPrice(order.tax, currency, locale)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-bold">
                <span>{tCommon('total')}</span>
                <span className="text-sale">{formatPrice(order.total, currency, locale)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('shippingTo')}
                </p>
                <p className="font-medium">{order.fullName}</p>
                <p className="text-muted-foreground">{order.address}</p>
                <p className="text-muted-foreground">
                  {order.city}, {order.state} {order.zip}
                </p>
                <p className="text-muted-foreground">{order.country}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('paymentTitle')}
                </p>
                <p className="font-medium">{order.paymentMethod}</p>
                <p className="text-muted-foreground">{order.email}</p>
                {order.phone && <p className="text-muted-foreground">{order.phone}</p>}
              </div>
            </div>
          </Card>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button onClick={goHome} variant="outline" className="flex-1">
              {tCommon('continueShopping')}
            </Button>
            <Button
              onClick={goOrders}
              className="flex-1 gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {t('viewOrderHistory')} <ArrowRight size={16} />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
