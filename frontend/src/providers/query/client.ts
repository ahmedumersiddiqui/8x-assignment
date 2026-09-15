import { QueryClient } from '@tanstack/react-query'

import { STALE_TIME_MS } from '@/constants/settings'
import { APIError } from '@/utils/api'

const shouldRetry = (failureCount: number, error: Error) => {
  if (error instanceof APIError && error.status >= 400 && error.status < 500) return false
  return failureCount < 1
}

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS.catalog,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
    },
  })
