import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  APIEndpoints,
  cartItemEndpoint,
  moveToCartEndpoint,
  saveForLaterEndpoint,
} from '@/constants/api-endpoints'
import { MutationKeys } from '@/constants/mutation-keys'
import { QueryKeys } from '@/constants/query-keys'
import type { Cart, CartItemPayload } from '@/schemas/cart'
import { CartSchema } from '@/schemas/cart'
import { useCartStore } from '@/stores/cart-store'
import { API } from '@/utils/api'
import { writeCart } from '@/utils/sync-cart'

const useCartWrite = (mutationKey: string) => {
  const queryClient = useQueryClient()
  return {
    mutationKey: [mutationKey],
    onSuccess: (cart: Cart) => writeCart(queryClient, cart),
  }
}

export const useAddToCartMutation = () =>
  useMutation({
    ...useCartWrite(MutationKeys.AddToCart),
    mutationFn: (payload: CartItemPayload) =>
      API.post(CartSchema, APIEndpoints.CartItems, payload),
  })

export const useUpdateCartItemMutation = () => {
  const queryClient = useQueryClient()
  const setLineBusy = useCartStore((state) => state.setLineBusy)

  return useMutation({
    mutationKey: [MutationKeys.UpdateCartItem],
    mutationFn: ({ itemId, qty }: { itemId: number; qty: number }) =>
      API.patch(CartSchema, cartItemEndpoint(itemId), { qty }),
    onMutate: async ({ itemId, qty }) => {
      setLineBusy(itemId, true)
      await queryClient.cancelQueries({ queryKey: [QueryKeys.Cart] })
      const previous = queryClient.getQueryData<Cart>([QueryKeys.Cart])
      if (previous) writeCart(queryClient, optimisticQty(previous, itemId, qty))
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) writeCart(queryClient, context.previous)
    },
    onSuccess: (cart) => writeCart(queryClient, cart),
    onSettled: (_data, _error, { itemId }) => setLineBusy(itemId, false),
  })
}

export const useRemoveCartItemMutation = () => {
  const queryClient = useQueryClient()
  const setLineBusy = useCartStore((state) => state.setLineBusy)

  return useMutation({
    mutationKey: [MutationKeys.RemoveCartItem],
    mutationFn: (itemId: number) => API.delete(CartSchema, cartItemEndpoint(itemId)),
    onMutate: async (itemId) => {
      setLineBusy(itemId, true)
      await queryClient.cancelQueries({ queryKey: [QueryKeys.Cart] })
      const previous = queryClient.getQueryData<Cart>([QueryKeys.Cart])
      if (previous) writeCart(queryClient, optimisticRemove(previous, itemId))
      return { previous }
    },
    onError: (_error, _itemId, context) => {
      if (context?.previous) writeCart(queryClient, context.previous)
    },
    onSuccess: (cart) => writeCart(queryClient, cart),
    onSettled: (_data, _error, itemId) => setLineBusy(itemId, false),
  })
}

const totals = (cart: Cart, items: Cart['items']): Cart => ({
  ...cart,
  items,
  subtotal_cents: items.reduce((sum, line) => sum + line.line_total_cents, 0),
  item_count: items.reduce((sum, line) => sum + line.qty, 0),
})

export function optimisticQty(cart: Cart, itemId: number, qty: number): Cart {
  return totals(
    cart,
    cart.items.map((line) =>
      line.id === itemId ? { ...line, qty, line_total_cents: line.unit_price_cents * qty } : line,
    ),
  )
}

export function optimisticRemove(cart: Cart, itemId: number): Cart {
  return totals(
    cart,
    cart.items.filter((line) => line.id !== itemId),
  )
}

export const useSaveForLaterMutation = () =>
  useMutation({
    ...useCartWrite(MutationKeys.SaveForLater),
    mutationFn: (itemId: number) => API.post(CartSchema, saveForLaterEndpoint(itemId)),
  })

export const useMoveToCartMutation = () =>
  useMutation({
    ...useCartWrite(MutationKeys.MoveToCart),
    mutationFn: (itemId: number) => API.post(CartSchema, moveToCartEndpoint(itemId)),
  })
