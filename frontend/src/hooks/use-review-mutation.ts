import { useMutation, useQueryClient } from '@tanstack/react-query'

import { reviewsEndpoint } from '@/constants/api-endpoints'
import { MutationKeys } from '@/constants/mutation-keys'
import { QueryKeys } from '@/constants/query-keys'
import type { ReviewPayload } from '@/schemas/review'
import { ReviewSchema } from '@/schemas/review'
import { API } from '@/utils/api'

export const useWriteReviewMutation = (slug: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [MutationKeys.WriteReview, slug],
    mutationFn: (payload: ReviewPayload) =>
      API.post(ReviewSchema, reviewsEndpoint(slug), payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Reviews, slug] }),
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Product, slug] }),
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Products] }),
      ])
    },
  })
}
