import type { QueryClient } from '@tanstack/react-query'

import { QueryKeys } from '@/constants/query-keys'
import { cartQuery } from '@/hooks/use-cart-query'
import type { Cart } from '@/schemas/cart'
import { useCartStore } from '@/stores/cart-store'

export function writeCart(queryClient: QueryClient, cart: Cart): Cart {
  queryClient.setQueryData([QueryKeys.Cart], cart)
  if (!import.meta.env.SSR) useCartStore.getState().setCart(cart)
  return cart
}

export async function syncCart(queryClient: QueryClient): Promise<Cart> {
  return writeCart(queryClient, await queryClient.ensureQueryData(cartQuery()))
}
