import { Link } from '@tanstack/react-router'

import { ExpandIcon, IconSize, SignOutIcon } from '@/components/icons'
import { Menu, MenuItem } from '@/components/ui/menu'
import { Text } from '@/components/ui/text'
import { Tooltip } from '@/components/ui/tooltip'
import { ACCOUNT_PATH, LOGIN_PATH, ORDERS_PATH, REGISTER_PATH, SELL_PATH } from '@/constants/routes'
import { useAccountQuery } from '@/hooks/use-account-query'
import { useLogoutMutation } from '@/hooks/use-authentication-mutation'

const itemClass = 'text-ink hover:text-teal hover:no-underline'

export function AccountMenu() {
  const { data: user } = useAccountQuery()
  const logout = useLogoutMutation()

  return (
    <div className="ml-auto flex items-center gap-1 sm:ml-0">
      <Menu
        label="Account and lists"
        trigger={
          <span className="px-2 py-1 text-sm text-white sm:text-base">
            <span className="block text-xs">
              Hello, {user ? user.name.split(' ')[0] : 'sign in'}
            </span>
            <span className="flex items-center gap-1">
              Account &amp; Lists
              <ExpandIcon size={IconSize.sm} aria-hidden="true" />
            </span>
          </span>
        }
      >
        {user ? (
          <>
            <MenuItem>
              <Link to={ACCOUNT_PATH} className={itemClass}>
                Account settings
              </Link>
            </MenuItem>
            <MenuItem>
              <Link to={ORDERS_PATH} className={itemClass}>
                Your orders
              </Link>
            </MenuItem>
            <MenuItem>
              <Link to="/cart" className={itemClass}>
                Your cart
              </Link>
            </MenuItem>
            <MenuItem>
              <Link to={SELL_PATH} className={itemClass}>
                Your stores
              </Link>
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem>
              <Link to={LOGIN_PATH} className={itemClass}>
                Sign in
              </Link>
            </MenuItem>
            <MenuItem>
              <Link to={REGISTER_PATH} className={itemClass}>
                Create an account
              </Link>
            </MenuItem>
            <div className="mt-1 border-t border-line px-4 pt-2">
              <Text size="xs" tone="muted">
                Sign in to see your orders and keep your cart.
              </Text>
            </div>
          </>
        )}
      </Menu>

      {user && (
        <Tooltip label="Sign out">
          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            aria-label="Sign out"
            className="hidden p-2 text-white hover:text-cta disabled:opacity-60 sm:block"
          >
            <SignOutIcon size={IconSize.md} aria-hidden="true" />
          </button>
        </Tooltip>
      )}
    </div>
  )
}
