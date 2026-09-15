import { useNavigate, useSearch } from '@tanstack/react-router'

import type { Sort } from '@/constants/sort'

import { SEARCH_PATH, SEARCH_ROUTE_ID } from '../constants'

export const useSearchFilters = () => {
  const search = useSearch({ from: SEARCH_ROUTE_ID })
  const navigate = useNavigate({ from: SEARCH_PATH })

  const setSort = (sort: Sort) =>
    void navigate({ search: (old) => ({ ...old, sort, page: 1 }) })

  const toggleBrand = (brand: string) => {
    const current = search.brand ?? []
    const next = current.includes(brand)
      ? current.filter((value) => value !== brand)
      : [...current, brand]
    void navigate({
      search: (old) => ({ ...old, brand: next.length ? next : undefined, page: 1 }),
    })
  }

  const toggleRating = (rating: number) =>
    void navigate({
      search: (old) => ({
        ...old,
        min_rating: old.min_rating === rating ? undefined : rating,
        page: 1,
      }),
    })

  const setInStock = (inStock: boolean) =>
    void navigate({ search: (old) => ({ ...old, in_stock: inStock || undefined, page: 1 }) })

  const setPriceRange = (minCents: number | undefined, maxCents: number | undefined) =>
    void navigate({
      search: (old) => ({ ...old, min_price: minCents, max_price: maxCents, page: 1 }),
    })

  return { search, setSort, toggleBrand, toggleRating, setInStock, setPriceRange }
}
