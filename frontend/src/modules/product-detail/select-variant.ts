import type { Variant } from '@/schemas/product'

/**
 * Which variant the buy box opens on: the cheapest one that can actually be bought, and
 * only if every variant is out of stock does it fall back to the cheapest overall.
 * Opening on an out-of-stock variant of an otherwise buyable product reads as broken.
 */
export function defaultVariant(variants: Variant[]): Variant {
  const available = variants.filter((variant) => variant.stock > 0)
  return (available.length ? available : variants).reduce((cheapest, variant) =>
    variant.price_cents < cheapest.price_cents ? variant : cheapest,
  )
}
