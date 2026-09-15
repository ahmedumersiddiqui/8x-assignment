import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  APIEndpoints,
  storeListingEndpoint,
  storeListingsEndpoint,
} from '@/constants/api-endpoints'
import { MutationKeys } from '@/constants/mutation-keys'
import { QueryKeys } from '@/constants/query-keys'
import type { ListingPayload } from '@/modules/sell/payload'
import type { StoreFormValues } from '@/schemas/store'
import { ListingSchema, StoreSchema } from '@/schemas/store'
import { API } from '@/utils/api'

export const useCreateStoreMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [MutationKeys.CreateStore],
    mutationFn: (payload: StoreFormValues) =>
      API.post(StoreSchema, APIEndpoints.Stores, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QueryKeys.Stores] })
    },
  })
}

export const useCreateListingMutation = (storeId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [MutationKeys.CreateListing, storeId],
    mutationFn: (payload: ListingPayload) =>
      API.post(ListingSchema, storeListingsEndpoint(storeId), payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [QueryKeys.StoreListings, storeId] }),
        // The listing joins the public catalogue immediately, so the grid and the store
        // counts on the sell screen are both stale the moment this returns.
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Products] }),
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Stores] }),
      ])
    },
  })
}

export const useDeleteListingMutation = (storeId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [MutationKeys.DeleteListing, storeId],
    mutationFn: (productId: number) => API.send(storeListingEndpoint(storeId, productId), 'DELETE'),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [QueryKeys.StoreListings, storeId] }),
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Products] }),
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Stores] }),
      ])
    },
  })
}
