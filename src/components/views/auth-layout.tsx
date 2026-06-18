'use client'

import Image from 'next/image'
import type { ReactNode } from 'react'
import { useStore } from '@/lib/store'
import { ShieldCheck, Truck, RotateCcw } from 'lucide-react'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const goHome = useStore((s) => s.goHome)
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-stretch gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:py-12">
      {/* Left: brand / value props */}
      <div className="relative hidden flex-1 overflow-hidden rounded-2xl bg-gradient-to-br from-header-2 via-header to-zinc-900 p-8 text-white lg:flex lg:flex-col lg:justify-between lg:min-h-[560px]">
        <div>
          <button onClick={goHome} className="text-2xl font-extrabold">
            <span className="text-brand">leni</span>dor
          </button>
          <h2 className="mt-8 text-3xl font-bold leading-tight">
            Shop millions of products,
            <br />
            <span className="text-brand">delivered to your door.</span>
          </h2>
          <p className="mt-4 max-w-md text-white/70">
            Join Lenidor for faster checkout, order tracking, member-only deals,
            and a seamless shopping experience across all your devices.
          </p>
        </div>
        <div className="mt-8 space-y-3">
          {[
            { icon: Truck, text: 'Free shipping on orders over $75' },
            { icon: ShieldCheck, text: 'Secure checkout with 256-bit SSL' },
            { icon: RotateCcw, text: '30-day easy returns' },
          ].map((f) => (
            <div key={f.text} className="flex items-center gap-3 text-sm text-white/80">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
                <f.icon size={16} />
              </div>
              {f.text}
            </div>
          ))}
        </div>
        <Image
          src="https://sfile.chatglm.cn/images-ppt/501e47f7effe.jpg"
          alt=""
          fill
          sizes="(max-width: 1024px) 0px, 40vw"
          className="object-cover opacity-10"
        />
      </div>

      {/* Right: form card */}
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-6 text-center">
              <button
                onClick={goHome}
                className="mx-auto mb-4 text-2xl font-extrabold lg:hidden"
              >
                <span className="text-brand">leni</span>dor
              </button>
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </div>
          {footer && <div className="mt-4 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
