import { describe, expect, it } from 'vitest'

import { PAGE_GAP, pageWindow } from '@/components/ui/constants'

describe('pageWindow', () => {
  it('lists every page when they all fit without a gap', () => {
    expect(pageWindow(1, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('keeps the last page reachable however far away it is', () => {
    const window = pageWindow(1, 40)
    expect(window.at(-1)).toBe(40)
    expect(window).toEqual([1, 2, PAGE_GAP, 40])
  })

  it('shows a neighbour either side of the current page', () => {
    expect(pageWindow(20, 40)).toEqual([1, PAGE_GAP, 19, 20, 21, PAGE_GAP, 40])
  })

  it('prints a single skipped page instead of an ellipsis for one number', () => {
    expect(pageWindow(4, 6)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('never repeats a page or emits one out of range', () => {
    for (let pages = 1; pages <= 30; pages += 1) {
      for (let page = 1; page <= pages; page += 1) {
        const numbers = pageWindow(page, pages).filter(
          (entry): entry is number => entry !== PAGE_GAP,
        )
        expect(new Set(numbers).size).toBe(numbers.length)
        expect(numbers).toEqual([...numbers].sort((a, b) => a - b))
        expect(numbers.every((n) => n >= 1 && n <= pages)).toBe(true)
        expect(numbers).toContain(page)
      }
    }
  })
})
