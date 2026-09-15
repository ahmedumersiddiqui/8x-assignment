import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

import { APIEndpoints, orderEndpoint } from '@/constants/api-endpoints'
import { QueryKeys } from '@/constants/query-keys'
import { ORDERS_PAGE_SIZE, STALE_TIME_MS } from '@/constants/settings'
import { OrderSchema } from '@/schemas/order'
import { createPageSchema } from '@/schemas/page'
import { API } from '@/utils/api'

const OrderPageSchema = createPageSchema(OrderSchema)

export const ordersQuery = (page = 1) =>
  queryOptions({
    queryKey: [QueryKeys.Orders, page],
    queryFn: () => API.get(OrderPageSchema, `${APIEndpoints.Orders}?page=${page}&page_size=${ORDERS_PAGE_SIZE}`),
    staleTime: STALE_TIME_MS.session,
  })

export const useOrdersQuery = (page = 1) => useSuspenseQuery(ordersQuery(page))

export const orderQuery = (orderId: number) =>
  queryOptions({
    queryKey: [QueryKeys.Order, orderId],
    queryFn: () => API.get(OrderSchema, orderEndpoint(orderId)),
    staleTime: STALE_TIME_MS.session,
  })
