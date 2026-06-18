'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useStore } from '@/lib/store'
import { usePreferences } from '@/lib/preferences'
import { useProduct } from '@/lib/hooks'
import { ProductCard } from '@/components/product-card'
import { StarRating } from '@/components/star-rating'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Minus,
  Plus,
  ShoppingCart,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  ChevronRight,
} from 'lucide-react'
import { formatPrice, discountPercent, formatNumber } from '@/lib/utils'
import { toast } from 'sonner'

// Deterministic pseudo-reviews so a product always shows the same set.
const REVIEW_SAMPLES = [
  { name: 'Sarah M.', rating: 5, dateEn: '2 days ago', dateFr: 'il y a 2 jours', textEn: 'Exceeded my expectations! Quality is outstanding and delivery was lightning fast. Would absolutely buy again.', textFr: "A largement dépassé mes attentes ! La qualité est exceptionnelle et la livraison ultra rapide. J'achèterai à nouveau sans hésiter." },
  { name: 'James L.', rating: 4, dateEn: '1 week ago', dateFr: 'il y a 1 semaine', textEn: 'Really solid product for the price. Took off one star because the instructions could be clearer, but otherwise fantastic.', textFr: 'Produit vraiment solide pour le prix. Jai retiré une étoile car les instructions pourraient être plus claires, mais sinon fantastique.' },
  { name: 'Priya K.', rating: 5, dateEn: '3 weeks ago', dateFr: 'il y a 3 semaines', textEn: 'I was hesitant at first but this turned out to be one of my best purchases this year. Highly recommend to anyone on the fence.', textFr: "J'hésitais au début mais cest lun de mes meilleurs achats de lannée. Je le recommande vivement à ceux qui hésitent." },
  { name: 'Marcus T.', rating: 5, dateEn: '1 month ago', dateFr: 'il y a 1 mois', textEn: 'Perfect. Exactly as described, well-packaged, and works flawlessly. Lenidor never disappoints.', textFr: 'Parfait. Conforme à la description, bien emballé et fonctionne parfaitement. Lenidor ne déçoit jamais.' },
  { name: 'Elena R.', rating: 4, dateEn: '1 month ago', dateFr: 'il y a 1 mois', textEn: 'Great value. Does everything I needed it to. Build quality feels premium. Shipping took a couple extra days but worth the wait.', textFr: 'Excellent rapport qualité-prix. Fait tout ce dont javais besoin. La qualité de fabrication semble premium. La livraison a pris quelques jours de plus mais ça vaut lattente.' },
  { name: 'David C.', rating: 3, dateEn: '2 months ago', dateFr: 'il y a 2 mois', textEn: 'It is okay. Does the job but nothing mind-blowing. For the price point I expected a little more, but it is functional.', textFr: 'Correct. Fait le travail mais rien dexceptionnel. Pour ce prix, je mattendais à un peu plus, mais cest fonctionnel.' },
]

function hashStr(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function ProductView() {
  const t = useTranslations('product')
  const tBrowse = useTranslations('browse')
  const tCommon = useTranslations('common')
  const productId = useStore((s) => s.selectedProductId)
  const addToCart = useStore((s) => s.addToCart)
  const goCart = useStore((s) => s.goCart)
  const goCheckout = useStore((s) => s.goCheckout)
  const goBrowse = useStore((s) => s.goBrowse)
  const { locale, currency } = usePreferences()
  const { data, isLoading } = useProduct(productId)

  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState(0)

  if (isLoading || !data) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr_320px]">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  const product = data.product
  const related = data.related
  const discount = discountPercent(product.price, product.compareAtPrice)
  const images = product.images.length ? product.images : ['/logo.svg']
  const seed = hashStr(product.id)
  const reviews = REVIEW_SAMPLES.map((r, i) => ({
    name: r.name,
    rating: r.rating,
    date: locale === 'fr' ? r.dateFr : r.dateEn,
    text: locale === 'fr' ? r.textFr : r.textEn,
    _seed: seed + i,
  }))

  const handleAdd = () => {
    addToCart(product, qty)
    toast.success(tCommon('addedToCart', { count: qty }), { description: product.name })
  }
  const handleBuyNow = () => {
    addToCart(product, qty)
    goCheckout()
  }

  const features = [
    { icon: Truck, label: t('freeShip') },
    { icon: ShieldCheck, label: t('warranty') },
    { icon: RotateCcw, label: t('returns30') },
    { icon: Check, label: t('inStockReady') },
  ]

  const specs: [string, string][] = [
    [t('brand'), product.brand],
    [locale === 'fr' ? 'Catégorie' : 'Category', product.category.name],
    [t('sku'), product.slug.toUpperCase().slice(0, 16)],
    [t('availability'), product.stock > 0 ? tCommon('inStock') : tCommon('outOfStock')],
    [t('stock'), `${formatNumber(product.stock, locale)}`],
    [t('rating'), `${product.rating.toFixed(1)} / 5`],
    [t('reviews'), formatNumber(product.reviewCount, locale)],
    [t('manufacturerWarranty'), locale === 'fr' ? '2 ans constructeur' : '2 years manufacturer'],
    [t('shipsFrom'), t('lenidorFulfillment')],
  ]

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <button onClick={() => goBrowse({ category: 'all', q: '' })} className="hover:underline">
          {tBrowse('home')}
        </button>
        <ChevronRight size={12} />
        <button
          onClick={() => goBrowse({ category: product.category.slug, q: '' })}
          className="hover:underline"
        >
          {product.category.name}
        </button>
        <ChevronRight size={12} />
        <span className="line-clamp-1 text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr_320px]">
        {/* Gallery */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-white">
            <Image
              src={images[activeImage]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-contain p-8"
            />
            {discount > 0 && (
              <span className="absolute left-4 top-4 rounded-full bg-sale px-3 py-1 text-sm font-bold text-white shadow">
                -{discount}%
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 bg-white ${
                    activeImage === i ? 'border-brand-strong' : 'border-border'
                  }`}
                >
                  <Image src={img} alt="" fill sizes="64px" className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-1 text-sm font-medium uppercase tracking-wide text-brand-strong">
              {product.brand}
            </p>
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{product.name}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <StarRating rating={product.rating} size={16} />
              <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatNumber(product.reviewCount, locale)} {t('ratings')}
            </span>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tg) => (
                <Badge key={tg} variant="secondary" className="font-normal">
                  {tg}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap items-end gap-3">
            <span className="text-3xl font-bold text-sale">{formatPrice(product.price, currency, locale)}</span>
            {product.compareAtPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice, currency, locale)}
                </span>
                <span className="rounded bg-sale/10 px-2 py-0.5 text-sm font-bold text-sale">
                  {tCommon('saveAmount', { amount: formatPrice(product.compareAtPrice - product.price, currency, locale) })}
                </span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('freeDeliveryNote')}
          </p>

          <div>
            <h3 className="mb-2 text-sm font-bold">{t('aboutThisItem')}</h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 gap-2 rounded-lg bg-muted/40 p-4 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.label} className="flex items-center gap-2 text-sm">
                <f.icon size={16} className="text-brand-strong" />
                {f.label}
              </div>
            ))}
          </div>
        </div>

        {/* Buy box */}
        <div className="lg:sticky lg:top-32 lg:h-fit">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-3xl font-bold text-sale">{formatPrice(product.price, currency, locale)}</p>
            <p className="mt-1 text-sm">
              {product.stock > 0 ? (
                <span className="font-semibold text-green-600">{tCommon('inStock')}</span>
              ) : (
                <span className="font-semibold text-sale">{tCommon('outOfStock')}</span>
              )}
            </p>

            {product.stock > 0 && product.stock <= 10 && (
              <p className="mt-1 text-sm font-medium text-sale">
                {tCommon('onlyLeft', { count: product.stock })}
              </p>
            )}

            <div className="mt-4">
              <Label className="mb-2 block text-sm font-semibold">{tCommon('quantity')}</Label>
              <div className="inline-flex items-center rounded-lg border border-border">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-10 w-10 place-items-center hover:bg-muted"
                  aria-label={tCommon('quantity')}
                  disabled={qty <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="grid h-10 w-10 place-items-center hover:bg-muted"
                  aria-label={tCommon('quantity')}
                  disabled={qty >= product.stock}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button
                onClick={handleAdd}
                disabled={product.stock <= 0}
                className="w-full gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
              >
                <ShoppingCart size={16} /> {tCommon('addToCart')}
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="w-full gap-2 bg-brand-strong text-brand-strong-foreground hover:bg-brand-strong/90"
              >
                <Zap size={16} /> {tCommon('buyNow')}
              </Button>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>{t('shipsFrom')}</span>
                <span className="font-medium text-foreground">Lenidor.com</span>
              </div>
              <div className="flex justify-between">
                <span>{t('soldBy')}</span>
                <span className="font-medium text-foreground">{t('official', { brand: product.brand })}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('payment')}</span>
                <span className="font-medium text-foreground">{t('secureTransaction')}</span>
              </div>
            </div>

            <button
              onClick={goCart}
              className="mt-4 w-full text-center text-sm font-semibold text-brand-strong hover:underline"
            >
              {t('goToCart')}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs: Description / Specs / Reviews */}
      <div className="mt-10">
        <Tabs defaultValue="reviews">
          <TabsList className="w-full justify-start gap-2 overflow-x-auto">
            <TabsTrigger value="reviews">{t('customerReviews')}</TabsTrigger>
            <TabsTrigger value="specs">{t('specifications')}</TabsTrigger>
            <TabsTrigger value="description">{t('fullDescription')}</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="mt-6">
            <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
              {/* Rating summary */}
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-4xl font-bold">{product.rating.toFixed(1)}</p>
                <StarRating rating={product.rating} size={18} className="mt-1" />
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('globalRatings', { count: formatNumber(product.reviewCount, locale) })}
                </p>
                <div className="mt-4 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct =
                      star === 5 ? 68 : star === 4 ? 19 : star === 3 ? 8 : star === 2 ? 3 : 2
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-14 text-muted-foreground">{star} {t('star')}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-amber-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-muted-foreground">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Review list */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold">{t('topReviews')}</h3>
                {reviews.map((r, i) => (
                  <div key={i} className="border-b border-border pb-4">
                    <div className="flex items-center gap-2">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-brand/20 text-xs font-bold text-brand-strong">
                        {r.name[0]}
                      </div>
                      <span className="text-sm font-semibold">{r.name}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <StarRating rating={r.rating} size={13} />
                      <span className="text-xs text-muted-foreground">{r.date}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specs" className="mt-6">
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <tbody>
                  {specs.map(([k, v], i) => (
                    <tr key={k} className={i % 2 ? 'bg-muted/30' : ''}>
                      <td className="w-1/3 px-4 py-2.5 font-medium">{k}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="description" className="mt-6">
            <div className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-xl font-bold">{t('alsoViewed')}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
