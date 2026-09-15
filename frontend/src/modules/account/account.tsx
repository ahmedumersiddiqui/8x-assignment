import { Link } from '@tanstack/react-router'

import { IconSize, OrdersIcon, SignOutIcon } from '@/components/icons'
import { Button, buttonClass } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Text } from '@/components/ui/text'
import { ORDERS_PATH } from '@/constants/routes'
import { useAccountQuery } from '@/hooks/use-account-query'
import { useLogoutMutation } from '@/hooks/use-authentication-mutation'

export function Account() {
  const { data: user } = useAccountQuery()
  const logout = useLogoutMutation()

  if (!user) return null

  return (
    <Container className="py-6">
      <Text as="h1" size="2xl" className="mb-4">
        Your Account
      </Text>

      <div className="max-w-[640px] border border-line bg-white">
        <dl className="divide-y divide-line">
          <Row label="Name">{user.name}</Row>
          <Row label="Email">{user.email}</Row>
          <Row label="Membership">{user.is_prime ? 'Prime member' : 'Standard'}</Row>
        </dl>

        <div className="flex flex-wrap gap-3 border-t border-line px-4 py-4">
          <Link
            to={ORDERS_PATH}
            className={buttonClass('primary', 'hover:no-underline')}
          >
            <OrdersIcon size={IconSize.sm} aria-hidden="true" />
            Your orders
          </Link>
          <Button
            variant="secondary"
            onClick={() => logout.mutate()}
            isPending={logout.isPending}
            pendingLabel="Signing out..."
          >
            <SignOutIcon size={IconSize.sm} aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </div>

      <Text size="sm" tone="muted" className="mt-3 max-w-[640px]">
        Editing these details, saved addresses and payment methods are not part of this build.
      </Text>
    </Container>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 px-4 py-3">
      <Text as="dt" tone="muted" className="w-[140px] shrink-0">
        {label}
      </Text>
      <dd>{children}</dd>
    </div>
  )
}
