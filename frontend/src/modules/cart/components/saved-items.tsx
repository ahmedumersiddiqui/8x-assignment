import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { StockStatus } from '@/components/ui/stock-status'
import { Text } from '@/components/ui/text'
import type { CartLine } from '@/schemas/cart'
import { formatPrice, plural } from '@/utils/format'

export function SavedItems({
  lines,
  busyLineIds,
  onMoveToCart,
  onRemove,
}: {
  lines: CartLine[]
  busyLineIds: number[]
  onMoveToCart: (itemId: number) => void
  onRemove: (itemId: number) => void
}) {
  if (lines.length === 0) return null

  return (
    <section className="mt-4 w-full bg-white p-4" aria-label="Saved for later">
      <Text as="h2" size="2xl" className="mb-3">
        Saved for later ({lines.length} {plural(lines.length, 'item')})
      </Text>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {lines.map((line) => {
          const isBusy = busyLineIds.includes(line.id)
          return (
            <article key={line.id} className={`flex flex-col ${isBusy ? 'opacity-60' : ''}`}>
              <Link to="/p/$slug" params={{ slug: line.slug }} className="mb-2">
                <img
                  src={line.image ?? ''}
                  alt={line.title}
                  width={180}
                  height={180}
                  loading="lazy"
                  className="mx-auto h-[140px] w-auto object-contain"
                />
              </Link>
              <Link
                to="/p/$slug"
                params={{ slug: line.slug }}
                className="mb-1 line-clamp-2 text-ink hover:text-teal"
              >
                {line.title}
              </Link>
              <Text size="lg" className="mb-1">
                {formatPrice(line.unit_price_cents)}
              </Text>
              <div className="mb-2">
                <StockStatus inStock={line.stock > 0} />
              </div>
              <Button
                variant="secondary"
                disabled={isBusy || line.stock === 0}
                onClick={() => onMoveToCart(line.id)}
                className="mb-1"
              >
                Move to cart
              </Button>
              <Button variant="link" disabled={isBusy} onClick={() => onRemove(line.id)}>
                Delete
                <span className="sr-only"> {line.title}</span>
              </Button>
            </article>
          )
        })}
      </div>
    </section>
  )
}
