'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useStore } from '@/lib/store'
import { useProducts } from '@/lib/hooks'
import { usePreferences } from '@/lib/preferences'
import { ProductCard } from '@/components/product-card'
import { ProductCardSkeleton } from '@/components/product-card-skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SlidersHorizontal, PackageSearch } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { formatPrice } from '@/lib/utils'
import type { SerializedCategory } from '@/lib/serialize'

interface BrowseViewProps {
  categories: SerializedCategory[]
}

const SORT_VALUES = ['featured', 'price-asc', 'price-desc', 'rating', 'newest'] as const

function PriceFilter({
  appliedMin,
  appliedMax,
  onApply,
  currency,
  locale,
  labels,
}: {
  appliedMin: string
  appliedMax: string
  onApply: (min: string, max: string) => void
  currency: 'USD' | 'XAF'
  locale: 'en' | 'fr'
  labels: { title: string; min: string; max: string; apply: string }
}) {
  const initLo = appliedMin ? Number(appliedMin) : 0
  const initHi = appliedMax ? Number(appliedMax) : 1000
  const [range, setRange] = useState<[number, number]>([initLo, initHi])

  const commit = () => onApply(String(range[0]), String(range[1]))

  return (
    <div>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
        {labels.title}
      </h3>
      <div className="mb-3 flex items-center gap-2">
        <Input
          type="number"
          value={range[0]}
          min={0}
          onChange={(e) => setRange([Number(e.target.value), range[1]])}
          className="h-8 text-xs"
          placeholder={labels.min}
        />
        <span className="text-muted-foreground">–</span>
        <Input
          type="number"
          value={range[1]}
          min={0}
          onChange={(e) => setRange([range[0], Number(e.target.value)])}
          className="h-8 text-xs"
          placeholder={labels.max}
        />
      </div>
      <Slider
        value={range}
        min={0}
        max={1000}
        step={10}
        onValueChange={(v) => setRange([v[0], v[1]] as [number, number])}
        onValueCommit={commit}
        className="mb-3"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatPrice(range[0], currency, locale)}</span>
        <span>{formatPrice(range[1], currency, locale)}</span>
      </div>
      <Button size="sm" className="mt-3 w-full" onClick={commit}>
        {labels.apply}
      </Button>
    </div>
  )
}

export function BrowseView({ categories }: BrowseViewProps) {
  const t = useTranslations('browse')
  const tCommon = useTranslations('common')
  const filters = useStore((s) => s.filters)
  const setFilters = useStore((s) => s.setFilters)
  const resetFilters = useStore((s) => s.resetFilters)
  const goBrowse = useStore((s) => s.goBrowse)
  const { locale, currency } = usePreferences()

  const { data, isLoading } = useProducts({
    q: filters.q,
    category: filters.category,
    sort: filters.sort,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  })

  const products = data?.products ?? []
  const activeCategory = categories.find((c) => c.slug === filters.category)

  const sortLabels: Record<string, string> = {
    featured: t('sortFeatured'),
    'price-asc': t('sortPriceAsc'),
    'price-desc': t('sortPriceDesc'),
    rating: t('sortRating'),
    newest: t('sortNewest'),
  }

  const resultText = (() => {
    if (filters.q || filters.category !== 'all') {
      const s = products.length !== 1 ? 's' : ''
      const queryPart = filters.q ? ` « ${filters.q} »` : ''
      const categoryPart = activeCategory ? ` — ${activeCategory.name}` : ''
      return t('showingResults', {
        count: products.length,
        s,
        queryPart,
        categoryPart,
      })
    }
    return t('productsCount', { count: products.length })
  })()

  const priceFilterKey = `${filters.minPrice}|${filters.maxPrice}`

  const FilterPanel = (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          {t('category')}
        </h3>
        <RadioGroup
          value={filters.category || 'all'}
          onValueChange={(v) => setFilters({ category: v })}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem id="cat-all" value="all" />
            <Label htmlFor="cat-all" className="cursor-pointer text-sm">
              {tCommon('allCategories')}
            </Label>
          </div>
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <RadioGroupItem id={`cat-${c.id}`} value={c.slug} />
              <Label htmlFor={`cat-${c.id}`} className="cursor-pointer text-sm">
                {c.name} <span className="text-muted-foreground">({c.productCount})</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <PriceFilter
        key={priceFilterKey}
        appliedMin={filters.minPrice}
        appliedMax={filters.maxPrice}
        onApply={(min, max) => setFilters({ minPrice: min, maxPrice: max })}
        currency={currency}
        locale={locale}
        labels={{ title: t('priceRange'), min: t('min'), max: t('max'), apply: t('applyPrice') }}
      />

      <Button variant="outline" size="sm" onClick={resetFilters} className="w-full">
        {t('clearAll')}
      </Button>
    </div>
  )

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      {/* Breadcrumb / heading */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <nav className="mb-1 text-xs text-muted-foreground">
            <button onClick={() => goBrowse({ category: 'all', q: '' })} className="hover:underline">
              {t('home')}
            </button>
            {' / '}
            <span className="font-medium text-foreground">
              {activeCategory ? activeCategory.name : filters.q ? t('searchResults') : t('allProducts')}
            </span>
          </nav>
          <h1 className="text-xl font-bold sm:text-2xl">
            {activeCategory ? activeCategory.name : filters.q ? t('resultsFor', { query: filters.q }) : t('allProducts')}
          </h1>
          <p className="text-sm text-muted-foreground">{resultText}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal size={15} className="mr-1" /> {t('filters')}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{t('filters')}</SheetTitle>
              </SheetHeader>
              <div className="mt-4">{FilterPanel}</div>
            </SheetContent>
          </Sheet>

          <Select value={filters.sort} onValueChange={(v) => setFilters({ sort: v })}>
            <SelectTrigger className="h-9 w-[170px] text-sm sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_VALUES.map((v) => (
                <SelectItem key={v} value={v}>
                  {t('sort')}: {sortLabels[v]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-32 rounded-xl border border-border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">{t('filters')}</h2>
              <button
                onClick={resetFilters}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {tCommon('reset')}
              </button>
            </div>
            {FilterPanel}
          </div>
        </aside>

        {/* Grid */}
        <div className="min-w-0 flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
              <PackageSearch size={48} className="mb-3 text-muted-foreground" />
              <h3 className="text-lg font-semibold">{t('noProducts')}</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {t('noProductsDesc')}
              </p>
              <Button onClick={resetFilters}>{t('clearAll')}</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
