import { Link, getRouteApi } from '@tanstack/react-router'

import { buttonClass } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Text } from '@/components/ui/text'
import { NoData } from '@/components/ui/no-data'
import { ORDERS_PATH } from '@/constants/routes'
import { ORDERS_PAGE_SIZE } from '@/constants/settings'
import { useOrdersQuery } from '@/hooks/use-orders-query'
import { plural } from '@/utils/format'

import { OrderCard } from './components/order-card'

const route = getRouteApi('/_protected/_layout/orders')

export function Orders() {
  const { page = 1 } = route.useSearch()
  const { data } = useOrdersQuery(page)

  const pages = Math.ceil(data.total / ORDERS_PAGE_SIZE)

  return (
    <Container className="py-4">
      <Text as="h1" size="2xl" className="mb-1">
        Your Orders
      </Text>
      <Text size="sm" tone="muted" className="mb-4">
        {data.total} {plural(data.total, 'order')} placed
      </Text>

      {data.items.length === 0 ? (
        <NoData title="You have not placed an order yet">
          When you do, it will show up here. <Link to="/">Start shopping</Link>.
        </NoData>
      ) : (
        data.items.map((order) => <OrderCard key={order.id} order={order} />)
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="my-4 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, index) => index + 1).map((n) => (
            <Link
              key={n}
              to={ORDERS_PATH}
              search={{ page: n }}
              aria-current={n === page ? 'page' : undefined}
              className={buttonClass('outline', n === page ? 'bg-cta hover:bg-cta-hover' : '')}
            >
              {n}
            </Link>
          ))}
        </nav>
      )}
    </Container>
  )
}
