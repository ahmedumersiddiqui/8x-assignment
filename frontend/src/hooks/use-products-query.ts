import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

import { APIEndpoints } from '@/constants/api-endpoints'
import { QueryKeys } from '@/constants/query-keys'
import { STALE_TIME_MS } from '@/constants/settings'
import type { ProductSearch } from '@/schemas/product'
import { SearchResponseSchema, withSearchDefaults } from '@/schemas/product'
import { API } from '@/utils/api'

function toQueryString(search: ProductSearch & { page_size: number }) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(search)) {
    if (value === undefined || value === '' || value === false) continue
    for (const item of Array.isArray(value) ? value : [value]) params.append(key, String(item))
  }
  return params.toString()
}

export const productsQuery = (search: ProductSearch) => {
  const params = withSearchDefaults(search)
  return queryOptions({
    queryKey: [QueryKeys.Products, params],
    queryFn: () => API.get(SearchResponseSchema, `${APIEndpoints.Products}?${toQueryString(params)}`),
    staleTime: STALE_TIME_MS.catalog,
  })
}

export const useProductsQuery = (search: ProductSearch) => useSuspenseQuery(productsQuery(search))
