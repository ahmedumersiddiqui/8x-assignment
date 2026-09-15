import { Link } from '@tanstack/react-router'

import { CartIcon, IconSize } from '@/components/icons'

import { WORDMARK } from '@/constants/navigation'
import { useCartCount } from '@/hooks/use-cart-query'
import { NavDrawer } from '@/layouts/drawer'

import { AccountMenu } from './components/account-menu'
import { DeliverTo } from './components/deliver-to'
import { SearchForm } from './components/search-form'
import { SubNav } from './components/sub-nav'

export function Header() {
  const itemCount = useCartCount()

  return (
    <header>
      <div className="bg-nav-belt text-white">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-1 gap-y-2 px-2 py-2 sm:gap-2">
          <Link
            to="/"
            className="shrink-0 px-2 py-1 text-xl text-white hover:no-underline sm:text-2xl"
          >
            {WORDMARK}
            <span className="text-cta">.</span>
          </Link>

          <DeliverTo />

          <SearchForm />

          <AccountMenu />

          {/* Reachable from the nav drawer and the account menu on a phone, where the belt
              has room for the wordmark, the account link and the cart and nothing else. */}
          <Link to="/orders" className="hidden px-2 py-1 text-white hover:no-underline sm:block">
            <span className="block text-xs">Returns</span>
            <span className="block">&amp; Orders</span>
          </Link>

          <Link to="/cart" className="flex items-end gap-1 px-2 py-1 text-white hover:no-underline">
            <span className="relative">
              <CartIcon size={IconSize.lg} aria-hidden="true" />
              <span
                className="absolute -top-1 left-1/2 -translate-x-1/2 text-cta"
                aria-hidden="true"
              >
                {itemCount}
              </span>
            </span>
            <span>Cart</span>
            <span className="sr-only">{itemCount} items in cart</span>
          </Link>
        </div>
      </div>

      <SubNav />
      <NavDrawer />
    </header>
  )
}
