import type { ProductSearch } from '@/schemas/product'

/** An empty cart still merchandises on Amazon; same key as the home strip, so it is cached. */
export const CART_RAIL_SEARCH: ProductSearch = { sort: 'rating' }
export const CART_RAIL_COUNT = 3
