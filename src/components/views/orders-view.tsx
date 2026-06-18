'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useStore } from '@/lib/store'
import { usePreferences } from '@/lib/preferences'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Package,
  ChevronDown,
  ChevronUp,
  PackageX,
  ArrowRight,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { formatPrice, formatDate } from '@/lib/utils'
import type { SerializedOrder } from '@/lib/serialize'

const STATUS_STYLES: Record<string, string> = {
  Processing: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  Shipped: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  Delivered: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
}

export function OrdersView() {
  const t = useTranslations('orders')
  const tCommon = useTranslations('common')
  const tCart = useTranslations('cart')
  const goBrowse = useStore((s) => s.goBrowse)
  const goProduct = useStore((s) => s.goProduct)
  const { locale, currency } = usePreferences()
  const [email, setEmail] = useState('')
  const [searchedEmail, setSearchedEmail] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const { data, isFetching, error } = useQuery<{ orders: SerializedOrder[] }>({
    queryKey: ['orders', searchedEmail],
    queryFn: async () => {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(searchedEmail)}`)
      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.error || t('title'))
      }
      return res.json()
    },
    enabled: !!searchedEmail,
  })

  const orders = data?.orders ?? []

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    setSearchedEmail(email.trim().toLowerCase())
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">{t('title')}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('desc')}
      </p>

      {/* Search */}
      <Card className="mt-4 p-4">
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Label htmlFor="ord-email" className="sr-only">
              {t('email')}
            </Label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="ord-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-9"
              />
            </div>
          </div>
          <Button type="submit" disabled={!email} className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90">
            <Search size={16} /> {t('findOrders')}
          </Button>
        </form>
      </Card>

      {/* Results */}
      {isFetching && (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      )}

      {!isFetching && searchedEmail && !error && orders.length === 0 && (
        <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <PackageX size={48} className="mb-3 text-muted-foreground" />
          <h3 className="text-lg font-semibold">{t('noOrders')}</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {t('noOrdersDesc', { email: searchedEmail })}
          </p>
          <Button onClick={() => goBrowse({ q: '', category: 'all' })} className="gap-2">
            {t('browseProducts')} <ArrowRight size={15} />
          </Button>
        </div>
      )}

      {!isFetching && error && (
        <div className="mt-6 rounded-xl border border-sale/30 bg-sale/5 p-4 text-sm text-sale">
          {error instanceof Error ? error.message : t('title')}
        </div>
      )}

      {!isFetching && orders.length > 0 && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('ordersFor', { count: orders.length, s: orders.length !== 1 ? 's' : '', email: searchedEmail })}
          </p>

          {orders.map((order) => {
            const isOpen = expanded === order.id
            return (
              <Card key={order.id} className="overflow-hidden">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border bg-muted/30 px-4 py-3 text-sm sm:px-5">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t('orderPlaced')}
                    </p>
                    <p className="font-medium">{formatDate(order.createdAt, locale)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('total')}</p>
                    <p className="font-medium">{formatPrice(order.total, currency, locale)}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t('orderNumber')}
                    </p>
                    <p className="font-mono font-medium">{order.orderNumber}</p>
                  </div>
                  <Badge className={`ml-auto ${STATUS_STYLES[order.status] || ''}`}>
                    {order.status}
                  </Badge>
                </div>

                {/* Items preview */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    {order.items.slice(0, 4).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => goProduct(item.productId)}
                        className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-white"
                        title={item.productName}
                      >
                        <Image
                          src={item.productImage || '/logo.svg'}
                          alt={item.productName}
                          fill
                          sizes="64px"
                          className="object-contain p-1"
                        />
                        <span className="absolute bottom-0 right-0 rounded-tl bg-zinc-800/80 px-1 text-[10px] font-bold text-white">
                          ×{item.quantity}
                        </span>
                      </button>
                    ))}
                    {order.items.length > 4 && (
                      <span className="text-sm text-muted-foreground">
                        {t('more', { count: order.items.length - 4 })}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    className="mt-3 flex items-center gap-1 text-sm font-semibold text-brand-strong hover:underline"
                  >
                    {isOpen ? (
                      <>
                        <ChevronUp size={15} /> {t('hideDetails')}
                      </>
                    ) : (
                      <>
                        <ChevronDown size={15} /> {t('viewDetails')}
                      </>
                    )}
                  </button>

                  {isOpen && (
                    <div className="mt-4 space-y-3 border-t border-border pt-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <button
                            onClick={() => goProduct(item.productId)}
                            className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-white"
                          >
                            <Image
                              src={item.productImage || '/logo.svg'}
                              alt={item.productName}
                              fill
                              sizes="56px"
                              className="object-contain p-1"
                            />
                          </button>
                          <div className="min-w-0 flex-1">
                            <button
                              onClick={() => goProduct(item.productId)}
                              className="line-clamp-2 text-left text-sm font-medium hover:text-brand-strong"
                            >
                              {item.productName}
                            </button>
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(item.price, currency, locale)} × {item.quantity}
                            </p>
                          </div>
                          <span className="text-sm font-semibold">
                            {formatPrice(item.price * item.quantity, currency, locale)}
                          </span>
                        </div>
                      ))}

                      <div className="rounded-lg bg-muted/40 p-3 text-sm">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              <Package size={12} /> {t('shippingAddress')}
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
                              {t('paymentSummary')}
                            </p>
                            <div className="space-y-0.5">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">{tCommon('subtotal')}</span>
                                <span>{formatPrice(order.subtotal, currency, locale)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">{tCart('shipping')}</span>
                                <span>
                                  {order.shipping === 0 ? tCommon('free') : formatPrice(order.shipping, currency, locale)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">{tCommon('tax')}</span>
                                <span>{formatPrice(order.tax, currency, locale)}</span>
                              </div>
                              <div className="flex justify-between font-bold">
                                <span>{tCommon('total')}</span>
                                <span className="text-sale">{formatPrice(order.total, currency, locale)}</span>
                              </div>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {t('paidVia', { method: order.paymentMethod })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {!searchedEmail && (
        <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Package size={48} className="mb-3 text-muted-foreground" />
          <h3 className="text-lg font-semibold">{t('trackPurchases')}</h3>
          <p className="mb-4 max-w-sm text-sm text-muted-foreground">
            {t('trackDesc')}
          </p>
          <Button onClick={() => goBrowse({ q: '', category: 'all' })} variant="outline" className="gap-2">
            {t('browseProducts')} <ArrowRight size={15} />
          </Button>
        </div>
      )}
    </div>
  )
}
