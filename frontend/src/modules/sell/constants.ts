import type { ListingFormValues } from '@/schemas/store'

export const MAX_BULLETS = 6
export const MAX_VARIANTS = 8

export const EMPTY_VARIANT = {
  option_value: '',
  price: '',
  list_price: '',
  stock: 0,
} as const

export const EMPTY_LISTING: ListingFormValues = {
  title: '',
  brand: '',
  category_slug: '',
  description: '',
  bullets: [{ text: '' }],
  option_name: '',
  variants: [{ ...EMPTY_VARIANT }],
  images: [],
}

export const LISTING_HELP = {
  title: 'Shoppers search on this, so lead with what the thing is.',
  bullets: 'The short list under the buy box. Up to 6.',
  option: 'Leave blank if there is nothing to choose between, like a single-size item.',
} as const
