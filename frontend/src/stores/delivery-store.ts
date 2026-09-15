import { create } from 'zustand'

type DeliveryStore = {
  postalCode: string | null
  setPostalCode: (postalCode: string | null) => void
}

export const useDeliveryStore = create<DeliveryStore>()((set) => ({
  postalCode: null,
  setPostalCode: (postalCode) => set({ postalCode }),
}))
