import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import type { Facets } from '@/schemas/product'
import { formatPrice } from '@/utils/format'

const toCents = (dollars: string): number | undefined => {
  const trimmed = dollars.trim()
  if (!trimmed) return undefined
  const parsed = Number.parseInt(trimmed, 10)
  return Number.isNaN(parsed) || parsed < 0 ? undefined : parsed * 100
}

const toDollars = (cents: number | undefined) =>
  cents === undefined ? '' : String(Math.round(cents / 100))

export function PriceFilter({
  facets,
  minCents,
  maxCents,
  onApply,
}: {
  facets: Facets
  minCents: number | undefined
  maxCents: number | undefined
  onApply: (min: number | undefined, max: number | undefined) => void
}) {
  const [low, setLow] = useState(toDollars(minCents))
  const [high, setHigh] = useState(toDollars(maxCents))
  const isFiltered = minCents !== undefined || maxCents !== undefined

  const field =
    'w-full min-w-0 rounded-[3px] border border-field-line px-2 py-1 text-sm tabular-nums'

  return (
    <form
      className="mt-1"
      onSubmit={(event) => {
        event.preventDefault()
        onApply(toCents(low), toCents(high))
      }}
    >
      <Text size="xs" tone="muted" className="mb-2">
        {formatPrice(facets.price_min_cents)} &ndash; {formatPrice(facets.price_max_cents)}
      </Text>

      <div className="flex items-center gap-1">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Minimum price in dollars</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Min"
            value={low}
            onChange={(event) => setLow(event.target.value)}
            className={field}
          />
        </label>
        <span aria-hidden="true" className="text-muted">
          &ndash;
        </span>
        <label className="min-w-0 flex-1">
          <span className="sr-only">Maximum price in dollars</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Max"
            value={high}
            onChange={(event) => setHigh(event.target.value)}
            className={field}
          />
        </label>
        <Button type="submit" variant="secondary" className="shrink-0 px-3 py-1 text-sm">
          Go
        </Button>
      </div>

      {isFiltered && (
        <Button
          variant="link"
          className="mt-2 text-sm"
          onClick={() => {
            setLow('')
            setHigh('')
            onApply(undefined, undefined)
          }}
        >
          Clear price filter
        </Button>
      )}
    </form>
  )
}
