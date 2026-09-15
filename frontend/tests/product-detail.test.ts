import { describe, expect, it } from 'vitest'

import { RECOMMENDED_COUNT, recommendedSearch } from '@/modules/product-detail/constants'
import { defaultVariant } from '@/modules/product-detail/select-variant'
import type { Variant } from '@/schemas/product'

const variant = (id: number, priceCents: number, stock: number): Variant => ({
  id,
  sku: `SKU-${id}`,
  attrs: { Color: `Colour ${id}` },
  price_cents: priceCents,
  list_price_cents: null,
  stock,
})

describe('defaultVariant', () => {
  it('opens on the cheapest variant that is actually in stock', () => {
    const chosen = defaultVariant([variant(1, 500, 0), variant(2, 1999, 4), variant(3, 2999, 9)])

    expect(chosen.id).toBe(2)
  })

  it('falls back to the cheapest overall when nothing is in stock', () => {
    const chosen = defaultVariant([variant(1, 2999, 0), variant(2, 999, 0)])

    expect(chosen.id).toBe(2)
  })

  it('handles a single-variant product', () => {
    expect(defaultVariant([variant(7, 100, 0)]).id).toBe(7)
  })
})

describe('recommendedSearch', () => {
  it('asks for the same category, best rated, and never pins a page', () => {
    expect(recommendedSearch('headphones')).toEqual({ category: 'headphones', sort: 'rating' })
    expect(RECOMMENDED_COUNT).toBeGreaterThan(0)
  })
})
