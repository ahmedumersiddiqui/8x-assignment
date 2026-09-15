import { describe, expect, it } from 'vitest'

import { IconSize } from '@/components/icons'

const STAR_COUNT = 5
const rowWidth = STAR_COUNT * IconSize.sm
const filledPx = (rating: number) => (rating / STAR_COUNT) * rowWidth

describe('star clipping', () => {
  it('lands a whole rating exactly on a star boundary', () => {
    for (const rating of [1, 2, 3, 4, 5]) {
      expect(filledPx(rating) % IconSize.sm).toBe(0)
      expect(filledPx(rating) / IconSize.sm).toBe(rating)
    }
  })

  it('puts a half rating halfway through the right star', () => {
    expect(filledPx(4.5)).toBe(4.5 * IconSize.sm)
  })
})
