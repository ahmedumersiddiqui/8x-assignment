import type { ProductSearch } from '@/schemas/product'

/** The featured strip is just a pinned search, so it shares the products cache. */
export const HOME_SEARCH: ProductSearch = { sort: 'rating' }

export const HOME_FEATURED_COUNT = 12
/** Every department is reachable from the home grid; the drawer is the shortcut, not the only way. */
export const HOME_CATEGORY_COUNT = 8
export const HOME_CHILDREN_PER_CATEGORY = 4
