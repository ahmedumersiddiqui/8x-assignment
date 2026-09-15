import { queryOptions, useQuery } from '@tanstack/react-query'

import { APIEndpoints } from '@/constants/api-endpoints'
import { QueryKeys } from '@/constants/query-keys'
import type { DeliveryOption } from '@/schemas/order'
import { TotalsSchema } from '@/schemas/order'
import { API } from '@/utils/api'

export const checkoutPreviewQuery = (deliveryOption: DeliveryOption) =>
  queryOptions({
    queryKey: [QueryKeys.CheckoutPreview, deliveryOption],
    queryFn: () =>
      API.get(TotalsSchema, `${APIEndpoints.CheckoutPreview}?delivery_option=${deliveryOption}`),
    // Stock and prices can move under a sitting checkout; never quote a stale total.
    staleTime: 0,
  })

export const useCheckoutPreview = (deliveryOption: DeliveryOption) =>
  useQuery(checkoutPreviewQuery(deliveryOption))
