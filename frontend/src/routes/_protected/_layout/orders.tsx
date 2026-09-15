import { createFileRoute } from '@tanstack/react-router'

import { ordersQuery } from '@/hooks/use-orders-query'
import { Orders } from '@/modules/orders'
import { OrdersSearchSchema } from '@/schemas/order'

export const Route = createFileRoute('/_protected/_layout/orders')({
  validateSearch: OrdersSearchSchema,
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: ({ context: { queryClient }, deps: { page } }) =>
    queryClient.ensureQueryData(ordersQuery(page ?? 1)),
  component: Orders,
})
