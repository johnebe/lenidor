'use client'

import { Search, ShoppingCart, MapPin, Menu, Heart, Package, ChevronDown, User, Globe, LogOut, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useStore } from '@/lib/store'
import { usePreferences } from '@/lib/preferences'
import { useHydrated } from '@/lib/use-hydrated'
import { useAuthStore } from '@/lib/auth-store'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import type { SerializedCategory } from '@/lib/serialize'

interface HeaderProps {
  categories: SerializedCategory[]
}

function SearchBar({
  query,
  category,
  categories,
  onCategoryChange,
  onSearch,
  placeholder,
  allCategoriesLabel,
}: {
  query: string
  category: string
  categories: SerializedCategory[]
  onCategoryChange: (v: string) => void
  onSearch: (q: string) => void
  placeholder: string
  allCategoriesLabel: string
}) {
  const [value, setValue] = useState(query)
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSearch(value)
      }}
      className="flex flex-1 items-stretch overflow-hidden rounded-md bg-white shadow-sm"
    >
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="hidden h-10 w-36 shrink-0 rounded-r-none border-0 border-r border-zinc-200 bg-zinc-100 text-sm text-zinc-700 sm:flex">
          <SelectValue placeholder={allCategoriesLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{allCategoriesLabel}</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.slug}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-10 flex-1 rounded-none border-0 text-zinc-900 focus-visible:ring-0"
      />
      <button
        type="submit"
        className="grid w-11 place-items-center bg-brand text-brand-foreground hover:bg-brand/90"
        aria-label="Search"
      >
        <Search size={20} />
      </button>
    </form>
  )
}

export function Header({ categories }: HeaderProps) {
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')
  const view = useStore((s) => s.view)
  const cartCount = useStore((s) => s.cartCount())
  const goHome = useStore((s) => s.goHome)
  const goBrowse = useStore((s) => s.goBrowse)
  const goCart = useStore((s) => s.goCart)
  const goOrders = useStore((s) => s.goOrders)
  const goLogin = useStore((s) => s.goLogin)
  const goAccount = useStore((s) => s.goAccount)
  const filters = useStore((s) => s.filters)
  const setFilters = useStore((s) => s.setFilters)
  const hydrated = useHydrated()

  const locale = usePreferences((s) => s.locale)
  const currency = usePreferences((s) => s.currency)
  const setLocale = usePreferences((s) => s.setLocale)
  const setCurrency = usePreferences((s) => s.setCurrency)

  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const count = hydrated ? cartCount : 0

  const handleLogout = async () => {
    await logout()
    toast.success(t('signOut'))
    goHome()
  }

  return (
    <header className="sticky top-0 z-50 text-white shadow-md">
      {/* Top bar */}
      <div className="bg-header">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:gap-4 sm:px-6">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="grid h-10 w-10 place-items-center rounded-md hover:bg-white/10 sm:hidden"
                aria-label={t('menu')}
              >
                <Menu size={22} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-header-2 text-white">
              <SheetHeader>
                <SheetTitle className="text-white">Lenidor</SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex flex-col gap-1">
                <button
                  onClick={() => useStore.getState().goHome()}
                  className="rounded-md px-3 py-2 text-left text-sm hover:bg-white/10"
                >
                  {t('all')}
                </button>
                <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-white/50">
                  {t('shopByCategory')}
                </p>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => useStore.getState().goBrowse({ category: c.slug, q: '' })}
                    className="rounded-md px-3 py-2 text-left text-sm hover:bg-white/10"
                  >
                    {c.name}
                  </button>
                ))}
                <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-white/50">
                  {t('account')}
                </p>
                <button
                  onClick={() => useStore.getState().goAccount()}
                  className="rounded-md px-3 py-2 text-left text-sm hover:bg-white/10"
                >
                  {t('userSpace')}
                </button>
                <button
                  onClick={() => useStore.getState().goOrders()}
                  className="rounded-md px-3 py-2 text-left text-sm hover:bg-white/10"
                >
                  {t('yourOrders')}
                </button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <button
            onClick={goHome}
            className="flex shrink-0 items-center gap-1 rounded-md border border-transparent px-2 py-1 hover:border-white/20"
          >
            <span className="text-xl font-extrabold tracking-tight">
              <span className="text-brand">leni</span>dor
            </span>
          </button>

          {/* Deliver to */}
          <button className="hidden items-center gap-1 rounded-md px-2 py-1 text-left hover:border hover:border-white/20 lg:flex">
            <MapPin size={18} className="text-white/70" />
            <div className="leading-tight">
              <p className="text-[11px] text-white/60">{t('deliverTo')}</p>
              <p className="text-sm font-semibold">{t('country')}</p>
            </div>
          </button>

          {/* Search */}
          <SearchBar
            key={filters.q + '|' + view}
            query={filters.q}
            category={filters.category}
            categories={categories}
            onCategoryChange={(v) => setFilters({ category: v })}
            onSearch={(q) => goBrowse({ q })}
            placeholder={tCommon('searchPlaceholder')}
            allCategoriesLabel={tCommon('allCategories')}
          />

          {/* Language + Currency switchers (desktop) */}
          <div className="hidden items-center gap-1 md:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold hover:border hover:border-white/20">
                  <Globe size={15} />
                  <span className="uppercase">{locale}</span>
                  <ChevronDown size={12} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('language')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocale('en')}>
                  <span className={cn('mr-2', locale === 'en' && 'font-bold')}>English</span>
                  {locale === 'en' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale('fr')}>
                  <span className={cn('mr-2', locale === 'fr' && 'font-bold')}>Français</span>
                  {locale === 'fr' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{t('currency')}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setCurrency('USD')}>
                  <span className={cn('mr-2', currency === 'USD' && 'font-bold')}>$ USD</span>
                  {currency === 'USD' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrency('XAF')}>
                  <span className={cn('mr-2', currency === 'XAF' && 'font-bold')}>FCFA XAF</span>
                  {currency === 'XAF' && '✓'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Account / Sign in */}
          {hydrated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden shrink-0 items-center gap-1 rounded-md px-2 py-1 text-left hover:border hover:border-white/20 md:flex">
                  <User size={20} />
                  <div className="leading-tight">
                    <p className="text-[11px] text-white/60">{t('hello')}</p>
                    <p className="max-w-[100px] truncate text-sm font-semibold">{user.name}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={goAccount}>
                  <LayoutDashboard size={15} className="mr-2" /> {t('userSpace')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={goOrders}>
                  <Package size={15} className="mr-2" /> {t('yourOrders')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-sale">
                  <LogOut size={15} className="mr-2" /> {t('signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={goLogin}
              className="hidden shrink-0 items-center gap-1 rounded-md px-2 py-1 text-left hover:border hover:border-white/20 md:flex"
            >
              <User size={20} />
              <div className="leading-tight">
                <p className="text-[11px] text-white/60">{t('hello')}</p>
                <p className="text-sm font-semibold">{t('signIn')}</p>
              </div>
            </button>
          )}

          {/* Orders (desktop) */}
          <button
            onClick={goOrders}
            className="hidden shrink-0 items-center gap-1 rounded-md px-2 py-1 text-left hover:border hover:border-white/20 lg:flex"
          >
            <Package size={20} />
            <div className="leading-tight">
              <p className="text-[11px] text-white/60">{t('returns')}</p>
              <p className="text-sm font-semibold">{t('yourOrders')}</p>
            </div>
          </button>

          {/* Cart */}
          <button
            onClick={goCart}
            className="relative flex shrink-0 items-center gap-2 rounded-md px-2 py-1 hover:border hover:border-white/20"
          >
            <div className="relative">
              <ShoppingCart size={26} />
              <span
                className={cn(
                  'absolute -right-2 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-xs font-bold text-brand-foreground',
                  count === 0 && 'hidden'
                )}
              >
                {count}
              </span>
            </div>
            <span className="hidden text-sm font-semibold sm:inline">{t('cart')}</span>
          </button>
        </div>

        {/* Mobile: language + currency + account row */}
        <div className="flex items-center justify-center gap-2 border-t border-white/10 px-3 py-1.5 md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold hover:bg-white/10">
                <Globe size={13} />
                <span className="uppercase">{locale}</span>
                <span className="text-white/40">/</span>
                <span>{currency}</span>
                <ChevronDown size={11} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuLabel>{t('language')}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setLocale('en')}>
                English {locale === 'en' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale('fr')}>
                Français {locale === 'fr' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{t('currency')}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setCurrency('USD')}>$ USD {currency === 'USD' && '✓'}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrency('XAF')}>FCFA XAF {currency === 'XAF' && '✓'}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-white/20">|</span>
          {user ? (
            <button onClick={goAccount} className="flex items-center gap-1 text-xs font-semibold hover:bg-white/10 rounded-md px-2 py-1">
              <User size={13} /> {user.name.split(' ')[0]}
            </button>
          ) : (
            <button onClick={goLogin} className="flex items-center gap-1 text-xs font-semibold hover:bg-white/10 rounded-md px-2 py-1">
              <User size={13} /> {t('signIn')}
            </button>
          )}
        </div>
      </div>

      {/* Secondary nav */}
      <div className="bg-header-2">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-3 py-1.5 text-sm sm:px-6 hide-scrollbar">
          <button
            onClick={() => goBrowse({ q: '', category: 'all' })}
            className="flex shrink-0 items-center gap-1 rounded px-2 py-1 font-semibold hover:bg-white/10"
          >
            <Menu size={16} /> {t('all')}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => goBrowse({ category: c.slug, q: '' })}
              className={cn(
                'shrink-0 rounded px-2 py-1 hover:bg-white/10',
                filters.category === c.slug && 'font-semibold text-brand'
              )}
            >
              {c.name}
            </button>
          ))}
          <button
            onClick={() => goBrowse({ sort: 'newest', q: '', category: 'all' })}
            className="shrink-0 rounded px-2 py-1 font-semibold text-brand hover:bg-white/10"
          >
            {t('todaysDeals')}
          </button>
          <button
            onClick={goOrders}
            className="ml-auto hidden shrink-0 items-center gap-1 rounded px-2 py-1 hover:bg-white/10 sm:flex"
          >
            <Heart size={14} /> {t('wishlist')} <ChevronDown size={12} />
          </button>
        </div>
      </div>
    </header>
  )
}
