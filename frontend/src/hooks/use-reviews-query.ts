import { queryOptions, useQuery } from '@tanstack/react-query'

import { reviewsEndpoint } from '@/constants/api-endpoints'
import { QueryKeys } from '@/constants/query-keys'
import { STALE_TIME_MS } from '@/constants/settings'
import { ReviewPageSchema } from '@/schemas/review'
import { API } from '@/utils/api'

export const reviewsQuery = (slug: string, rating?: number, page = 1) => {
  const params = new URLSearchParams({ page: String(page) })
  if (rating) params.set('rating', String(rating))

  return queryOptions({
    queryKey: [QueryKeys.Reviews, slug, rating ?? null, page],
    queryFn: () => API.get(ReviewPageSchema, `${reviewsEndpoint(slug)}?${params}`),
    staleTime: STALE_TIME_MS.session,
    // Paging a list should not blank it out; hold the previous page until the next lands.
    placeholderData: (previous) => previous,
  })
}

export const useReviewsQuery = (slug: string, rating?: number, page = 1) =>
  useQuery(reviewsQuery(slug, rating, page))
