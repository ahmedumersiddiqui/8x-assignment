import { useMutation, useQueryClient } from '@tanstack/react-query'

import { APIEndpoints } from '@/constants/api-endpoints'
import { MutationKeys } from '@/constants/mutation-keys'
import { QueryKeys } from '@/constants/query-keys'
import type { CheckoutPayload } from '@/schemas/order'
import { OrderSchema } from '@/schemas/order'
import { API } from '@/utils/api'

export const useCheckoutMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [MutationKeys.Checkout],
    mutationFn: (payload: CheckoutPayload) => API.post(OrderSchema, APIEndpoints.Checkout, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Cart] }),
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Orders] }),
      ])
    },
  })
}
