import { WORDMARK } from '@/constants/navigation'
import type { ProductSearch } from '@/schemas/product'

export const RECOMMENDED_COUNT = 6
export const LOW_STOCK_THRESHOLD = 10

/** "Sold by" is the storefront when a seller listed it, and the house otherwise --
 *  which is the same distinction Amazon draws between its own stock and a marketplace
 *  offer. */
export const metaRows = (soldBy: string | null, storeSlug: string | null) =>
  [
    { label: 'Ships from', value: WORDMARK, storeSlug: null },
    { label: 'Sold by', value: soldBy ?? WORDMARK, storeSlug },
    { label: 'Returns', value: '30-day refund or replacement', storeSlug: null },
    { label: 'Payment', value: 'Secure transaction', storeSlug: null },
  ] as const

export const recommendedSearch = (categorySlug: string): ProductSearch => ({
  category: categorySlug,
  sort: 'rating',
})
