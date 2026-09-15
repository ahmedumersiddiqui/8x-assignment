import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

import { productEndpoint } from '@/constants/api-endpoints'
import { QueryKeys } from '@/constants/query-keys'
import { STALE_TIME_MS } from '@/constants/settings'
import { ProductDetailSchema } from '@/schemas/product'
import { API } from '@/utils/api'

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: [QueryKeys.Product, slug],
    queryFn: () => API.get(ProductDetailSchema, productEndpoint(slug)),
    staleTime: STALE_TIME_MS.product,
  })

export const useProductQuery = (slug: string) => useSuspenseQuery(productQuery(slug))
