import { createFileRoute } from '@tanstack/react-router'

import { Cart } from '@/modules/cart'
import { syncCart } from '@/utils/sync-cart'

export const Route = createFileRoute('/_shop/cart')({
  loader: ({ context: { queryClient } }) => syncCart(queryClient),
  component: Cart,
})
