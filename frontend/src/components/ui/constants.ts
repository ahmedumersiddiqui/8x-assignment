export const PAGE_GAP = 'gap' as const

/** Pages either side of the current one before the range collapses to an ellipsis. */
const PAGE_NEIGHBOURS = 1

/** At or below this many pages, every page is listed and no ellipsis appears. */
const MAX_INLINE_PAGES = 7

const BASE_ITEM =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-[8px] border px-3 text-sm'

export const PaginationClass = {
  item: `${BASE_ITEM} border-line bg-white text-ink transition-colors hover:bg-field`,
  current: `${BASE_ITEM} border-nav-sub bg-nav-sub font-bold text-white`,
  disabled: `${BASE_ITEM} border-line bg-white text-line`,
} as const

/**
 * The page numbers to show, with PAGE_GAP where the range skips. First and last are always
 * present so every page stays reachable -- the old fixed list of the first eight made pages
 * nine and up unreachable entirely.
 */
export function pageWindow(page: number, pages: number): (number | typeof PAGE_GAP)[] {
  // Below this an ellipsis would hide fewer pages than it costs to render, so show them all.
  if (pages <= MAX_INLINE_PAGES) {
    return Array.from({ length: pages }, (_, index) => index + 1)
  }

  const wanted = new Set<number>([1, pages])
  for (let n = page - PAGE_NEIGHBOURS; n <= page + PAGE_NEIGHBOURS; n += 1) {
    if (n >= 1 && n <= pages) wanted.add(n)
  }

  const sorted = [...wanted].sort((a, b) => a - b)
  const out: (number | typeof PAGE_GAP)[] = []
  for (const [index, n] of sorted.entries()) {
    // A gap of exactly one page is worth printing rather than hiding behind an ellipsis.
    const previous = sorted[index - 1]
    if (previous !== undefined && n - previous === 2) out.push(previous + 1)
    else if (previous !== undefined && n - previous > 2) out.push(PAGE_GAP)
    out.push(n)
  }
  return out
}

export const ModalPlacement = {
  side: 'm-0 h-full max-h-full w-[80vw] max-w-[365px]',
  center: 'm-auto w-[92vw] max-w-[420px]',
} as const

export const TooltipPlacement = {
  bottom: 'left-1/2 top-full mt-1 -translate-x-1/2',
  /** For anything pinned to the right edge, where a centred tooltip would overflow. */
  left: 'right-full top-1/2 mr-2 -translate-y-1/2',
} as const

export const TextSize = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
} as const

export const TextTone = {
  default: 'text-ink',
  muted: 'text-muted',
  danger: 'text-deal',
  success: 'text-success',
  link: 'text-link',
  inverse: 'text-white',
} as const

export const ButtonVariant = {
  primary: 'rounded-[100vw] bg-cta px-5 py-1.5 text-ink hover:bg-cta-hover',
  buy: 'rounded-[100vw] bg-buy px-5 py-1.5 text-ink hover:brightness-95',
  secondary: 'rounded-[100vw] border border-line bg-white px-5 py-1.5 text-ink hover:bg-field',
  outline: 'border border-line bg-white px-3 py-1 text-ink hover:bg-field',
  link: 'text-link underline hover:text-deal',
} as const

export const PENDING_LABEL = 'One moment...'
