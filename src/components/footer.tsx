'use client'

import { useStore } from '@/lib/store'
import { useTranslations } from 'next-intl'
import { Twitter, Instagram, Facebook, Youtube } from 'lucide-react'

export function Footer() {
  const t = useTranslations('footer')
  const tCommon = useTranslations('common')
  const goHome = useStore((s) => s.goHome)
  const goBrowse = useStore((s) => s.goBrowse)
  const goOrders = useStore((s) => s.goOrders)

  return (
    <footer className="mt-auto bg-header text-white">
      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="block w-full bg-header-2 py-3 text-center text-sm font-semibold hover:bg-header-2/80"
      >
        {tCommon('backToTop')}
      </button>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-3 lg:grid-cols-4">
        <div>
          <h4 className="mb-3 text-base font-bold">{t('getToKnowUs')}</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><button onClick={goHome} className="hover:text-brand hover:underline">{t('aboutLenidor')}</button></li>
            <li><button onClick={() => goBrowse({ category: 'all' })} className="hover:text-brand hover:underline">{t('careers')}</button></li>
            <li><button className="hover:text-brand hover:underline">{t('pressReleases')}</button></li>
            <li><button className="hover:text-brand hover:underline">{t('sustainability')}</button></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-base font-bold">{t('makeMoney')}</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><button className="hover:text-brand hover:underline">{t('sellOnLenidor')}</button></li>
            <li><button className="hover:text-brand hover:underline">{t('becomeAffiliate')}</button></li>
            <li><button className="hover:text-brand hover:underline">{t('advertise')}</button></li>
            <li><button className="hover:text-brand hover:underline">{t('selfPublish')}</button></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-base font-bold">{t('letUsHelp')}</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><button onClick={goOrders} className="hover:text-brand hover:underline">{t('yourOrders')}</button></li>
            <li><button className="hover:text-brand hover:underline">{t('shippingRates')}</button></li>
            <li><button className="hover:text-brand hover:underline">{t('returnsReplacements')}</button></li>
            <li><button className="hover:text-brand hover:underline">{t('helpCenter')}</button></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-base font-bold">{t('connect')}</h4>
          <div className="flex gap-3">
            <button className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-brand hover:text-brand-foreground" aria-label="Twitter">
              <Twitter size={16} />
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-brand hover:text-brand-foreground" aria-label="Instagram">
              <Instagram size={16} />
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-brand hover:text-brand-foreground" aria-label="Facebook">
              <Facebook size={16} />
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-brand hover:text-brand-foreground" aria-label="Youtube">
              <Youtube size={16} />
            </button>
          </div>
          <p className="mt-4 text-xs text-white/50">
            {t('securePay')}
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center">
        <button onClick={goHome} className="text-lg font-extrabold">
          <span className="text-brand">leni</span>dor
        </button>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 text-xs text-white/50">
          <span>{t('conditions')}</span>
          <span>{t('privacy')}</span>
          <span>{t('cookies')}</span>
          <span>{t('rights', { year: new Date().getFullYear() })}</span>
        </div>
      </div>
    </footer>
  )
}
