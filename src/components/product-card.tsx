'use client'

import Image from 'next/image'
import { Heart, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn, formatPrice, discountPercent, formatNumber } from '@/lib/utils'
import { StarRating } from '@/components/star-rating'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { usePreferences } from '@/lib/preferences'
import type { SerializedProduct } from '@/lib/serialize'
import { toast } from 'sonner'

interface ProductCardProps {
  product: SerializedProduct
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const t = useTranslations('common')
  const goProduct = useStore((s) => s.goProduct)
  const addToCart = useStore((s) => s.addToCart)
  const { locale, currency } = usePreferences()
  const [liked, setLiked] = useState(false)
  const discount = discountPercent(product.price, product.compareAtPrice)

  const open = () => goProduct(product.id)

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (product.stock <= 0) return
    addToCart(product, 1)
    toast.success(t('added'), {
      description: product.name,
    })
  }

  return (
    <div
      onClick={open}
      className={cn(
        'group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg hover:-translate-y-0.5',
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        {discount > 0 && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-sale px-2.5 py-1 text-xs font-bold text-white shadow">
            -{discount}%
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setLiked((v) => !v)
          }}
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/80 text-muted-foreground backdrop-blur transition hover:text-sale"
          aria-label="Add to wishlist"
        >
          <Heart size={16} className={cn(liked && 'fill-sale text-sale')} />
        </button>
        <Image
          src={product.images[0] || '/logo.svg'}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </span>
          {product.tags.includes('Best Seller') && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              BEST SELLER
            </span>
          )}
        </div>
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-tight text-foreground group-hover:text-brand-strong">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5">
          <StarRating rating={product.rating} size={13} />
          <span className="text-xs text-muted-foreground">
            ({formatNumber(product.reviewCount, locale)})
          </span>
        </div>
        <div className="mt-auto flex items-end gap-2 pt-1">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(product.price, currency, locale)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice, currency, locale)}
            </span>
          )}
        </div>
        {product.stock <= 5 && product.stock > 0 && (
          <p className="text-xs font-medium text-sale">
            {t('onlyLeft', { count: product.stock })}
          </p>
        )}
        {product.stock <= 0 && (
          <p className="text-xs font-medium text-muted-foreground">{t('outOfStock')}</p>
        )}
        <Button
          onClick={handleAdd}
          disabled={product.stock <= 0}
          size="sm"
          className="mt-2 w-full gap-1.5 bg-brand text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
        >
          <ShoppingBag size={15} />
          {t('addToCart')}
        </Button>
      </div>
    </div>
  )
}
