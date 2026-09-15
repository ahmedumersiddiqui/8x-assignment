import { create } from 'zustand'

type UIStore = {
  isNavDrawerOpen: boolean
  isFilterDrawerOpen: boolean
  isSearchFocused: boolean
  setNavDrawerOpen: (isNavDrawerOpen: boolean) => void
  setFilterDrawerOpen: (isFilterDrawerOpen: boolean) => void
  setSearchFocused: (isSearchFocused: boolean) => void
  closeOverlays: () => void
}

export const useUIStore = create<UIStore>()((set) => ({
  isNavDrawerOpen: false,
  isFilterDrawerOpen: false,
  isSearchFocused: false,
  setNavDrawerOpen: (isNavDrawerOpen) => set({ isNavDrawerOpen }),
  setFilterDrawerOpen: (isFilterDrawerOpen) => set({ isFilterDrawerOpen }),
  setSearchFocused: (isSearchFocused) => set({ isSearchFocused }),
  closeOverlays: () => set({ isNavDrawerOpen: false, isFilterDrawerOpen: false }),
}))
