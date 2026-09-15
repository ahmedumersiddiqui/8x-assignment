import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import {
  AccountIcon,
  ForwardIcon,
  IconSize,
  OrdersIcon,
  SignOutIcon,
  StoreIcon,
} from '@/components/icons'
import { Modal } from '@/components/ui/modal'
import { ACCOUNT_PATH, LOGIN_PATH, ORDERS_PATH, SELL_PATH } from '@/constants/routes'
import { useAccountQuery } from '@/hooks/use-account-query'
import { useLogoutMutation } from '@/hooks/use-authentication-mutation'
import { WORDMARK } from '@/constants/navigation'
import { categoriesQuery } from '@/hooks/use-categories-query'
import { useUIStore } from '@/stores/ui-store'

import { DrawerSection } from './components/drawer-section'
import { DRAWER_CATEGORY_COUNT } from './constants'

const linkClass = 'flex w-full items-center gap-2 py-1 text-left text-ink hover:text-teal'

export function NavDrawer() {
  const isOpen = useUIStore((state) => state.isNavDrawerOpen)
  const close = useUIStore((state) => state.closeOverlays)
  // Plain useQuery: the drawer is on every screen, and it must never suspend one.
  const { data: categories } = useQuery(categoriesQuery())
  const { data: user } = useAccountQuery()
  const logout = useLogoutMutation()

  return (
    <Modal isOpen={isOpen} onClose={close} title={user ? `Hello, ${user.name}` : 'Hello, sign in'}>
      <DrawerSection title="Shop by Department">
        {(categories ?? []).slice(0, DRAWER_CATEGORY_COUNT).map((category) => (
          <li key={category.id}>
            <Link
              to="/s"
              search={{ category: category.slug, page: 1 }}
              onClick={close}
              className={`${linkClass} justify-between`}
            >
              {category.name}
              <ForwardIcon size={IconSize.sm} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </DrawerSection>

      <DrawerSection title="Make Money with Us">
        <li>
          <Link to={SELL_PATH} onClick={close} className={linkClass}>
            <StoreIcon size={IconSize.sm} aria-hidden="true" />
            Sell on {WORDMARK}
          </Link>
        </li>
      </DrawerSection>

      <DrawerSection title="Your Account">
        {user ? (
          <>
            <li>
              <Link to={ACCOUNT_PATH} onClick={close} className={linkClass}>
                <AccountIcon size={IconSize.sm} aria-hidden="true" />
                Account settings
              </Link>
            </li>
            <li>
              <Link to={ORDERS_PATH} onClick={close} className={linkClass}>
                <OrdersIcon size={IconSize.sm} aria-hidden="true" />
                Your orders
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  close()
                  logout.mutate()
                }}
                disabled={logout.isPending}
                className={`${linkClass} disabled:opacity-60`}
              >
                <SignOutIcon size={IconSize.sm} aria-hidden="true" />
                Sign out
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link to={LOGIN_PATH} onClick={close} className={linkClass}>
              <AccountIcon size={IconSize.sm} aria-hidden="true" />
              Sign in
            </Link>
          </li>
        )}
      </DrawerSection>
    </Modal>
  )
}
