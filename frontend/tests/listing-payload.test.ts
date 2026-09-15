import { describe, expect, it } from 'vitest'

import { buildListingPayload } from '@/modules/sell/payload'
import type { ListingFormValues } from '@/schemas/store'
import { centsToMoneyInput, parseMoneyToCents } from '@/utils/money'

const form = (overrides: Partial<ListingFormValues> = {}): ListingFormValues => ({
  title: '  Handmade Walnut Desk Tray  ',
  brand: ' Fern and Oak ',
  category_slug: 'home-kitchen',
  description: ' Turned from a single offcut. ',
  bullets: [{ text: ' Solid walnut ' }, { text: '   ' }, { text: 'Oiled finish' }],
  option_name: ' Size ',
  variants: [{ option_value: ' Small ', price: '24.99', list_price: '', stock: 4 }],
  images: [{ key: 'stores/1/a.jpg', url: 'https://media.test/stores/1/a.jpg' }],
  ...overrides,
})

describe('parseMoneyToCents', () => {
  it('converts dollars to integer cents without going through a float', () => {
    expect(parseMoneyToCents('24.99')).toBe(2499)
    expect(parseMoneyToCents('0.07')).toBe(7)
    expect(parseMoneyToCents('1000')).toBe(100_000)
    expect(parseMoneyToCents('19.9')).toBe(1990)
  })

  it('is exact where a float multiply would not be', () => {
    // 24.99 * 100 is 2498.9999999999995, and 0.29 * 100 is 28.999999999999996.
    expect(parseMoneyToCents('24.99')).toBe(2499)
    expect(parseMoneyToCents('0.29')).toBe(29)
    expect(Number.isInteger(parseMoneyToCents('8.15'))).toBe(true)
  })

  it('accepts what people actually type', () => {
    expect(parseMoneyToCents('$24.99')).toBe(2499)
    expect(parseMoneyToCents('  24.99  ')).toBe(2499)
    expect(parseMoneyToCents('24,99')).toBe(2499)
  })

  it('rejects anything it cannot represent exactly', () => {
    expect(parseMoneyToCents('')).toBeNull()
    expect(parseMoneyToCents('abc')).toBeNull()
    expect(parseMoneyToCents('24.999')).toBeNull()
    expect(parseMoneyToCents('-5.00')).toBeNull()
    expect(parseMoneyToCents('1e3')).toBeNull()
  })

  it('round-trips through the edit form', () => {
    for (const cents of [1, 7, 99, 100, 2499, 100_000]) {
      expect(parseMoneyToCents(centsToMoneyInput(cents))).toBe(cents)
    }
  })
})

describe('buildListingPayload', () => {
  it('sends integer cents, never a typed decimal', () => {
    const payload = buildListingPayload(
      form({
        variants: [{ option_value: 'Small', price: '24.99', list_price: '34.50', stock: 4 }],
      }),
    )

    expect(payload.variants[0].price_cents).toBe(2499)
    expect(payload.variants[0].list_price_cents).toBe(3450)
    expect(Number.isInteger(payload.variants[0].price_cents)).toBe(true)
  })

  it('leaves the was-price null when it was left blank', () => {
    expect(buildListingPayload(form()).variants[0].list_price_cents).toBeNull()
  })

  it('trims text and drops blank bullets', () => {
    const payload = buildListingPayload(form())

    expect(payload.title).toBe('Handmade Walnut Desk Tray')
    expect(payload.brand).toBe('Fern and Oak')
    expect(payload.description).toBe('Turned from a single offcut.')
    expect(payload.bullets).toEqual(['Solid walnut', 'Oiled finish'])
  })

  it('names the option axis once and applies it to every row', () => {
    const payload = buildListingPayload(
      form({
        option_name: 'Size',
        variants: [
          { option_value: 'Small', price: '24.99', list_price: '', stock: 4 },
          { option_value: 'Large', price: '39.99', list_price: '', stock: 0 },
        ],
      }),
    )

    expect(payload.variants.map((variant) => variant.attrs)).toEqual([
      { Size: 'Small' },
      { Size: 'Large' },
    ])
  })

  it('sends no attributes at all when there is nothing to choose between', () => {
    const payload = buildListingPayload(form({ option_name: '', variants: form().variants }))

    expect(payload.variants[0].attrs).toEqual({})
  })

  it('sends image keys, not the public URLs', () => {
    // The server re-derives the URL itself; a client-supplied URL would be a way to
    // point a listing at someone else's bucket.
    expect(buildListingPayload(form()).image_keys).toEqual(['stores/1/a.jpg'])
  })

  it('carries no price field the server would have to trust', () => {
    const payload = buildListingPayload(form())

    expect(Object.keys(payload)).not.toContain('total')
    expect(Object.keys(payload)).not.toContain('subtotal_cents')
  })
})
