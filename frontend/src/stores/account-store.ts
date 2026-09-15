import { create } from 'zustand'

import type { User } from '@/schemas/user'

type AccountStore = {
  accountDetails: User | null
  setAccountDetails: (accountDetails: User | null) => void
  reset: () => void
}

export const useAccountStore = create<AccountStore>()((set) => ({
  accountDetails: null,
  setAccountDetails: (accountDetails) => set({ accountDetails }),
  reset: () => set({ accountDetails: null }),
}))
