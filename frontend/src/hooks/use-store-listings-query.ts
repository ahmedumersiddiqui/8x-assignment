import { queryOptions, useQuery } from '@tanstack/react-query'

import { storeListingsEndpoint } from '@/constants/api-endpoints'
import { QueryKeys } from '@/constants/query-keys'
import { STALE_TIME_MS } from '@/constants/settings'
import { ListingPageSchema } from '@/schemas/store'
import { API } from '@/utils/api'

export const STORE_LISTINGS_PAGE_SIZE = 20

export const storeListingsQuery = (storeId: number, page = 1) =>
  queryOptions({
    queryKey: [QueryKeys.StoreListings, storeId, page],
    queryFn: () =>
      API.get(
        ListingPageSchema,
        `${storeListingsEndpoint(storeId)}?page=${page}&page_size=${STORE_LISTINGS_PAGE_SIZE}`,
      ),
    staleTime: STALE_TIME_MS.session,
  })

export const useStoreListingsQuery = (storeId: number, page = 1) =>
  useQuery(storeListingsQuery(storeId, page))
