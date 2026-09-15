import type { ListingFormValues } from '@/schemas/store'
import { parseMoneyToCents } from '@/utils/money'

export type VariantPayload = {
  attrs: Record<string, string>
  price_cents: number
  list_price_cents: number | null
  stock: number
}

export type ListingPayload = {
  title: string
  brand: string
  category_slug: string
  description: string
  bullets: string[]
  image_keys: string[]
  variants: VariantPayload[]
}

export const buildListingPayload = (values: ListingFormValues): ListingPayload => {
  const optionName = values.option_name.trim()

  return {
    title: values.title.trim(),
    brand: values.brand.trim(),
    category_slug: values.category_slug,
    description: values.description.trim(),
    bullets: values.bullets.map((bullet) => bullet.text.trim()).filter(Boolean),
    image_keys: values.images.map((image) => image.key),
    variants: values.variants.map((variant) => {
      const value = variant.option_value.trim()
      return {
        attrs: optionName && value ? { [optionName]: value } : {},
        price_cents: parseMoneyToCents(variant.price) ?? 0,
        list_price_cents: variant.list_price ? parseMoneyToCents(variant.list_price) : null,
        stock: Number(variant.stock),
      }
    }),
  }
}
