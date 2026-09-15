import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

import { APIEndpoints } from '@/constants/api-endpoints'
import { QueryKeys } from '@/constants/query-keys'
import { STALE_TIME_MS } from '@/constants/settings'
import { CategoryListSchema } from '@/schemas/category'
import { API } from '@/utils/api'

export const categoriesQuery = () =>
  queryOptions({
    queryKey: [QueryKeys.Categories],
    queryFn: () => API.get(CategoryListSchema, APIEndpoints.Categories),
    staleTime: STALE_TIME_MS.product,
  })

export const useCategoriesQuery = () => useSuspenseQuery(categoriesQuery())
