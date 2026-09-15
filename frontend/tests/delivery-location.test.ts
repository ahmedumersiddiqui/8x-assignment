import { describe, expect, it } from 'vitest'

import { isPostalCode } from '@/utils/delivery-location'

describe('isPostalCode', () => {
  it('accepts a five digit US ZIP', () => {
    expect(isPostalCode('98101')).toBe(true)
    expect(isPostalCode('00501')).toBe(true)
  })

  it('rejects anything the API would ignore', () => {
    for (const value of ['', '9810', '981011', 'SW1A', '9810a', ' 98101']) {
      expect(isPostalCode(value)).toBe(false)
    }
  })
})
