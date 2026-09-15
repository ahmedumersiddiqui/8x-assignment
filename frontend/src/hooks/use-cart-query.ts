import { queryOptions, useQuery } from '@tanstack/react-query'

import { APIEndpoints } from '@/constants/api-endpoints'
import { QueryKeys } from '@/constants/query-keys'
import { STALE_TIME_MS } from '@/constants/settings'
import { CartSchema } from '@/schemas/cart'
import { useCartStore } from '@/stores/cart-store'
import { API } from '@/utils/api'

export const cartQuery = () =>
  queryOptions({
    queryKey: [QueryKeys.Cart],
    queryFn: () => API.get(CartSchema, APIEndpoints.Cart),
    staleTime: STALE_TIME_MS.session,
  })

/** Not suspense: the header's badge should never block a page from painting. */
export const useCartQuery = () => useQuery(cartQuery())

export const useCart = () => {
  const stored = useCartStore((state) => state.cart)
  const query = useCartQuery()
  return { ...query, data: stored ?? query.data }
}

export const useCartCount = () => useCart().data?.item_count ?? 0
