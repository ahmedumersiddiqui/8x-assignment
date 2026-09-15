import { create } from 'zustand'

import type { Cart } from '@/schemas/cart'

type CartStore = {
  cart: Cart | null
  busyLineIds: number[]
  setCart: (cart: Cart | null) => void
  setLineBusy: (itemId: number, isBusy: boolean) => void
  reset: () => void
}

export const useCartStore = create<CartStore>()((set) => ({
  cart: null,
  busyLineIds: [],
  setCart: (cart) => set({ cart }),
  setLineBusy: (itemId, isBusy) =>
    set((state) => ({
      busyLineIds: isBusy
        ? [...state.busyLineIds, itemId]
        : state.busyLineIds.filter((id) => id !== itemId),
    })),
  reset: () => set({ cart: null, busyLineIds: [] }),
}))
