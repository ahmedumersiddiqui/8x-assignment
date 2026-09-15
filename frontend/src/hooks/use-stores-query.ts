import { queryOptions, useQuery } from '@tanstack/react-query'

import { APIEndpoints } from '@/constants/api-endpoints'
import { QueryKeys } from '@/constants/query-keys'
import { STALE_TIME_MS } from '@/constants/settings'
import { StoresSchema, UploadPolicySchema } from '@/schemas/store'
import { API } from '@/utils/api'

export const storesQuery = () =>
  queryOptions({
    queryKey: [QueryKeys.Stores],
    queryFn: () => API.get(StoresSchema, APIEndpoints.Stores),
    staleTime: STALE_TIME_MS.session,
  })

export const useStoresQuery = () => useQuery(storesQuery())

export const uploadPolicyQuery = () =>
  queryOptions({
    queryKey: [QueryKeys.UploadPolicy],
    queryFn: () => API.get(UploadPolicySchema, APIEndpoints.UploadPolicy),
    // Whether the server has R2 credentials does not change between page views.
    staleTime: Infinity,
  })

export const useUploadPolicyQuery = () => useQuery(uploadPolicyQuery())
