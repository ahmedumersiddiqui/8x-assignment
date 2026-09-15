import { queryOptions, useQuery } from '@tanstack/react-query'

import { APIEndpoints } from '@/constants/api-endpoints'
import { QueryKeys } from '@/constants/query-keys'
import { STALE_TIME_MS } from '@/constants/settings'
import { UserSchema } from '@/schemas/user'
import { API } from '@/utils/api'

export const accountQuery = () =>
  queryOptions({
    queryKey: [QueryKeys.AccountDetails],
    queryFn: () => API.get(UserSchema, APIEndpoints.Me).catch(() => null),
    staleTime: STALE_TIME_MS.session,
  })

export const useAccountQuery = () => useQuery(accountQuery())
