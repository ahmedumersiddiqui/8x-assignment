export const SortOptions = {
  Featured: 'featured',
  Newest: 'newest',
  PriceAsc: 'price_asc',
  PriceDesc: 'price_desc',
  Rating: 'rating',
} as const

export type Sort = (typeof SortOptions)[keyof typeof SortOptions]

export const SortLabels: Record<Sort, string> = {
  [SortOptions.Featured]: 'Featured',
  [SortOptions.PriceAsc]: 'Price: Low to High',
  [SortOptions.PriceDesc]: 'Price: High to Low',
  [SortOptions.Rating]: 'Avg. Customer Review',
  [SortOptions.Newest]: 'Newest Arrivals',
}
