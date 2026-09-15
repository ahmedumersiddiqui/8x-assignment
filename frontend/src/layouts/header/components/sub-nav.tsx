import { Link } from '@tanstack/react-router'

import { IconSize, MenuIcon, StoreIcon } from '@/components/icons'
import { SubNavLinks, WORDMARK } from '@/constants/navigation'
import { SELL_PATH } from '@/constants/routes'
import { useUIStore } from '@/stores/ui-store'

export function SubNav() {
  const isOpen = useUIStore((state) => state.isNavDrawerOpen)
  const setNavDrawerOpen = useUIStore((state) => state.setNavDrawerOpen)

  return (
    <nav aria-label="Categories" className="bg-nav-sub text-white">
      <ul className="mx-auto flex max-w-[1500px] items-center gap-1 overflow-x-auto px-2 py-1">
        <li>
          <button
            type="button"
            onClick={() => setNavDrawerOpen(true)}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            className="flex items-center gap-2 whitespace-nowrap px-2 py-1 text-white hover:underline"
          >
            <MenuIcon size={IconSize.md} aria-hidden="true" />
            All
          </button>
        </li>
        {SubNavLinks.map((item) => (
          <li key={item.label}>
            <Link
              to="/s"
              search={item.search}
              className="block whitespace-nowrap px-2 py-1 text-white hover:no-underline hover:underline"
            >
              {item.label}
            </Link>
          </li>
        ))}
        {/* Pinned right, the way Amazon uses the far end of the sub-nav for a promo
            slot. The route is protected, so signing in happens on the way through. */}
        <li className="ml-auto">
          <Link
            to={SELL_PATH}
            className="flex items-center gap-1.5 whitespace-nowrap px-2 py-1 text-white hover:no-underline hover:underline"
          >
            <StoreIcon size={IconSize.sm} aria-hidden="true" />
            Sell on {WORDMARK}
          </Link>
        </li>
      </ul>
    </nav>
  )
}
