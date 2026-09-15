import { describe, expect, it } from 'vitest'

import { OrdersSearchSchema, readAddress } from '@/schemas/order'

const ADDRESS = {
  name: 'Ada Lovelace',
  line1: '1 Analytical Way',
  city: 'Seattle',
  state: 'WA',
  postal_code: '98101',
  country: 'US',
  phone: '5550001111',
}

describe('OrdersSearchSchema', () => {
  it('coerces a page from the URL and rejects a hand-edited one', () => {
    expect(OrdersSearchSchema.parse({ page: '3' }).page).toBe(3)
    expect(OrdersSearchSchema.parse({ page: '0' }).page).toBeUndefined()
    expect(OrdersSearchSchema.parse({ page: 'abc' }).page).toBeUndefined()
    expect(OrdersSearchSchema.parse({}).page).toBeUndefined()
  })
})

describe('readAddress', () => {
  it('returns the address when the snapshot is complete', () => {
    expect(readAddress(ADDRESS)?.name).toBe('Ada Lovelace')
  })

  it('returns null rather than throwing on an older, incomplete snapshot', () => {
    expect(readAddress({ name: 'Ada' })).toBeNull()
    expect(readAddress({})).toBeNull()
  })
})
