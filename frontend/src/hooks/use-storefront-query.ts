import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

import { storefrontEndpoint } from '@/constants/api-endpoints'
import { QueryKeys } from '@/constants/query-keys'
import { STALE_TIME_MS } from '@/constants/settings'
import { StorefrontSchema } from '@/schemas/store'
import { API } from '@/utils/api'

export const storefrontQuery = (slug: string) =>
  queryOptions({
    queryKey: [QueryKeys.Storefront, slug],
    queryFn: () => API.get(StorefrontSchema, storefrontEndpoint(slug)),
    staleTime: STALE_TIME_MS.product,
  })

export const useStorefrontQuery = (slug: string) => useSuspenseQuery(storefrontQuery(slug))
