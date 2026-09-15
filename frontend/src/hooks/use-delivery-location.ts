import { useQueryClient } from '@tanstack/react-query'

import { QueryKeys } from '@/constants/query-keys'
import { useDeliveryStore } from '@/stores/delivery-store'
import { readDeliveryLocation, writeDeliveryLocation } from '@/utils/delivery-location'

export function useDeliveryLocation() {
  const queryClient = useQueryClient()
  const stored = useDeliveryStore((state) => state.postalCode)
  const setPostalCode = useDeliveryStore((state) => state.setPostalCode)

  const setLocation = (postalCode: string | null) => {
    writeDeliveryLocation(postalCode)
    setPostalCode(postalCode)
    // The promise is computed from the cookie server-side, so every cached estimate is stale.
    void queryClient.invalidateQueries({ queryKey: [QueryKeys.Products] })
    void queryClient.invalidateQueries({ queryKey: [QueryKeys.Product] })
    void queryClient.invalidateQueries({ queryKey: [QueryKeys.CheckoutPreview] })
  }

  return { postalCode: stored ?? readDeliveryLocation(), setLocation }
}
