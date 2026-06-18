'use client'

import { useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useCategories } from '@/lib/hooks'
import { useStore } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { useAuthStore } from '@/lib/auth-store'
import { HomeView } from '@/components/views/home-view'
import { BrowseView } from '@/components/views/browse-view'
import { ProductView } from '@/components/views/product-view'
import { CartView } from '@/components/views/cart-view'
import { CheckoutView } from '@/components/views/checkout-view'
import { ConfirmationView } from '@/components/views/confirmation-view'
import { OrdersView } from '@/components/views/orders-view'
import { LoginView } from '@/components/views/login-view'
import { RegisterView } from '@/components/views/register-view'
import { ForgotPasswordView } from '@/components/views/forgot-password-view'
import { ResetPasswordView } from '@/components/views/reset-password-view'
import { AccountView } from '@/components/views/account-view'

function AppShell() {
  const view = useStore((s) => s.view)
  const { data: catData } = useCategories()
  const categories = catData?.categories ?? []
  const hydrated = useHydrated()
  const fetchUser = useAuthStore((s) => s.fetchUser)

  // Bootstrap the session once on mount.
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header categories={categories} />
      <main className="flex-1">
        {hydrated ? (
          <>
            {view === 'home' && <HomeView categories={categories} />}
            {view === 'browse' && <BrowseView categories={categories} />}
            {view === 'product' && <ProductView />}
            {view === 'cart' && <CartView />}
            {view === 'checkout' && <CheckoutView />}
            {view === 'confirmation' && <ConfirmationView />}
            {view === 'orders' && <OrdersView />}
            {view === 'login' && <LoginView />}
            {view === 'register' && <RegisterView />}
            {view === 'forgot' && <ForgotPasswordView />}
            {view === 'reset' && <ResetPasswordView />}
            {view === 'account' && <AccountView />}
          </>
        ) : (
          <div className="mx-auto flex h-[60vh] max-w-7xl items-center justify-center px-6">
            <div className="flex flex-col items-center gap-3">
              <span className="text-2xl font-extrabold tracking-tight">
                <span className="text-brand">leni</span>dor
              </span>
              <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-1/2 animate-[shimmer_1.2s_infinite] rounded-full bg-brand" />
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default function Home() {
  return <AppShell />
}
