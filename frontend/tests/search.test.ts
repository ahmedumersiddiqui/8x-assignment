import { describe, expect, it } from 'vitest'

import { RedirectSearchSchema } from '@/schemas/navigation'
import { ProductSearchSchema } from '@/schemas/product'

describe('ProductSearchSchema', () => {
  it('coerces the strings a URL actually carries', () => {
    const parsed = ProductSearchSchema.parse({
      q: 'kettle',
      brand: 'Acme',
      min_rating: '4',
      in_stock: 'true',
      sort: 'price_asc',
      page: '2',
    })

    expect(parsed).toMatchObject({
      q: 'kettle',
      brand: ['Acme'],
      min_rating: 4,
      in_stock: true,
      sort: 'price_asc',
      page: 2,
    })
  })

  it('degrades a hand-edited URL to defaults instead of throwing', () => {
    const parsed = ProductSearchSchema.parse({
      sort: 'nonsense',
      page: 'abc',
      min_rating: 'four',
      in_stock: 'false',
    })

    expect(parsed.sort).toBeUndefined()
    expect(parsed.page).toBeUndefined()
    expect(parsed.min_rating).toBeUndefined()
    // "false" must not read as opted-in.
    expect(parsed.in_stock).toBeUndefined()
  })
})

describe('RedirectSearchSchema', () => {
  it('keeps a same-site path', () => {
    expect(RedirectSearchSchema.parse({ redirect: '/orders' }).redirect).toBe('/orders')
    expect(RedirectSearchSchema.parse({ redirect: '/s?q=laptop' }).redirect).toBe('/s?q=laptop')
  })

  it('drops anything that could leave the site', () => {
    for (const hostile of [
      'https://evil.example.com',
      '//evil.example.com',
      'javascript:alert(1)',
      'orders',
    ]) {
      expect(RedirectSearchSchema.parse({ redirect: hostile }).redirect).toBeUndefined()
    }
  })
})
