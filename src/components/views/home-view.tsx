'use client'

import Image from 'next/image'
import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useStore } from '@/lib/store'
import { useProducts } from '@/lib/hooks'
import { ProductCard } from '@/components/product-card'
import { ProductCardSkeleton } from '@/components/product-card-skeleton'
import { BANNERS } from '@/lib/banners'
import { Sparkles, Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react'
import type { SerializedCategory } from '@/lib/serialize'

interface HomeViewProps {
  categories: SerializedCategory[]
}

export function HomeView({ categories }: HomeViewProps) {
  const t = useTranslations('home')
  const tNav = useTranslations('nav')
  const tCommon = useTranslations('common')
  const goBrowse = useStore((s) => s.goBrowse)
  const goProduct = useStore((s) => s.goProduct)

  const featuredQuery = useProducts({ featured: true, limit: 10 })
  const dealsQuery = useProducts({ sort: 'featured', limit: 24 })

  const featured = featuredQuery.data?.products ?? []
  const all = dealsQuery.data?.products ?? []
  const deals = useMemo(
    () =>
      all
        .filter((p) => p.compareAtPrice && p.compareAtPrice > p.price)
        .slice(0, 5),
    [all]
  )
  const topRated = useMemo(
    () => [...all].sort((a, b) => b.rating - a.rating).slice(0, 5),
    [all]
  )

  const trustBadges = [
    { icon: Truck, title: t('freeShipping'), desc: t('freeShippingDesc') },
    { icon: ShieldCheck, title: t('secureCheckout'), desc: t('secureCheckoutDesc') },
    { icon: RotateCcw, title: t('easyReturns'), desc: t('easyReturnsDesc') },
    { icon: Headphones, title: t('support'), desc: t('supportDesc') },
  ]

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-header-2 via-header to-zinc-900 text-white">
        <div className="absolute inset-0">
          <Image
            src={BANNERS.hero}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-header via-header/80 to-transparent" />
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-4 px-6 py-16 sm:py-24 lg:py-28">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-bold text-brand-foreground">
            <Sparkles size={13} /> {t('megaSale')}
          </span>
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {t('heroTitlePre')}{' '}
            <span className="text-brand">{t('heroTitleAccent')}.</span>
          </h1>
          <p className="max-w-xl text-base text-white/80 sm:text-lg">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => goBrowse({ q: '', category: 'all' })}
              className="rounded-lg bg-brand px-6 py-3 text-sm font-bold text-brand-foreground shadow-lg transition hover:bg-brand/90"
            >
              {t('shopNow')}
            </button>
            <button
              onClick={() => goBrowse({ sort: 'newest', q: '', category: 'all' })}
              className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold backdrop-blur transition hover:bg-white/20"
            >
              {tNav('todaysDeals')}
            </button>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {trustBadges.map((b) => (
            <div
              key={b.title}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/15 text-brand-strong">
                <b.icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category cards */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.slice(0, 4).map((c) => {
            const img = BANNERS.categories[c.slug]
            return (
              <button
                key={c.id}
                onClick={() => goBrowse({ category: c.slug, q: '' })}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-4 text-left transition hover:shadow-lg"
              >
                <h3 className="mb-3 text-base font-bold sm:text-lg">{c.name}</h3>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
                  {img ? (
                    <Image
                      src={img}
                      alt={c.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <span className="mt-3 text-sm font-semibold text-brand-strong">
                  {t('shopCategory', { name: c.name })}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">{t('featured')}</h2>
            <p className="text-sm text-muted-foreground">{t('featuredDesc')}</p>
          </div>
          <button
            onClick={() => goBrowse({ q: '', category: 'all' })}
            className="shrink-0 text-sm font-semibold text-brand-strong hover:underline"
          >
            {tCommon('seeAll')} →
          </button>
        </div>
        {featuredQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {featured.slice(0, 5).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Deals row */}
      {deals.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="rounded-2xl bg-gradient-to-br from-sale/10 to-amber-50 p-5 dark:to-amber-950/20">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-xl font-bold text-sale sm:text-2xl">⚡ {t('dealsOfDay')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {deals.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top rated */}
      {topRated.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-bold sm:text-2xl">{t('topRated')}</h2>
            <button
              onClick={() => goBrowse({ sort: 'rating', q: '', category: 'all' })}
              className="shrink-0 text-sm font-semibold text-brand-strong hover:underline"
            >
              {tCommon('seeAll')} →
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {topRated.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-header px-6 py-10 text-center text-white sm:py-12">
          <h2 className="text-2xl font-bold sm:text-3xl">{t('joinPrime')}</h2>
          <p className="max-w-xl text-white/70">
            {t('primeDesc')}
          </p>
          <button
            onClick={() => goProduct(all[0]?.id ?? '')}
            className="rounded-lg bg-brand px-6 py-3 text-sm font-bold text-brand-foreground hover:bg-brand/90"
          >
            {t('startFreeTrial')}
          </button>
        </div>
      </section>
    </div>
  )
}
