import { describe, expect, it } from 'vitest'

import { optimisticQty, optimisticRemove } from '@/hooks/use-cart-mutations'
import type { Cart } from '@/schemas/cart'

const line = (id: number, unitPriceCents: number, qty: number) => ({
  id,
  variant_id: id * 10,
  qty,
  title: `Item ${id}`,
  slug: `item-${id}`,
  image: null,
  attrs: {},
  unit_price_cents: unitPriceCents,
  line_total_cents: unitPriceCents * qty,
  stock: 9,
})

const cart: Cart = {
  items: [line(1, 1999, 2), line(2, 500, 1)],
  saved_items: [line(9, 2500, 1)],
  subtotal_cents: 4498,
  item_count: 3,
}

describe('optimisticQty', () => {
  it('recomputes the line, the subtotal and the badge count in integer cents', () => {
    const next = optimisticQty(cart, 1, 3)

    expect(next.items[0].line_total_cents).toBe(5997)
    expect(next.subtotal_cents).toBe(6497)
    expect(next.item_count).toBe(4)
    expect(Number.isInteger(next.subtotal_cents)).toBe(true)
  })

  it('leaves untouched lines and the original object alone', () => {
    const next = optimisticQty(cart, 1, 3)

    expect(next.items[1]).toEqual(cart.items[1])
    expect(cart.subtotal_cents).toBe(4498)
  })
})

describe('saved items', () => {
  it('survive an optimistic quantity change', () => {
    expect(optimisticQty(cart, 1, 3).saved_items).toEqual(cart.saved_items)
  })

  it('survive an optimistic removal, and never count toward the subtotal', () => {
    const next = optimisticRemove(cart, 1)

    expect(next.saved_items).toEqual(cart.saved_items)
    expect(next.subtotal_cents).toBe(500)
  })
})

describe('optimisticRemove', () => {
  it('drops the line and re-derives the subtotal and badge count', () => {
    const next = optimisticRemove(cart, 1)

    expect(next.items).toHaveLength(1)
    expect(next.subtotal_cents).toBe(500)
    expect(next.item_count).toBe(1)
  })

  it('is a no-op for an id that is not in the cart', () => {
    expect(optimisticRemove(cart, 999)).toEqual(cart)
  })

  it('empties to a zeroed cart rather than leaving a stale subtotal behind', () => {
    const empty = optimisticRemove(optimisticRemove(cart, 1), 2)

    expect(empty.items).toEqual([])
    expect(empty.subtotal_cents).toBe(0)
    expect(empty.item_count).toBe(0)
  })
})
