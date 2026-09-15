import { Link } from '@tanstack/react-router'

import type { OrderLine } from '@/schemas/order'
import { buttonClass } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { formatPrice } from '@/utils/format'

/**
 * Everything here is the snapshot the order was placed with, not the product's current
 * state -- if the price or title has since changed, this still shows what was bought.
 */
export function OrderLineRow({ line }: { line: OrderLine }) {
  return (
    <article className="flex gap-4 py-3">
      <Link to="/p/$slug" params={{ slug: line.slug_snapshot }} className="shrink-0">
        <img
          src={line.image_snapshot ?? ''}
          alt={line.title_snapshot}
          width={100}
          height={100}
          loading="lazy"
          className="h-[80px] w-[80px] object-contain"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          to="/p/$slug"
          params={{ slug: line.slug_snapshot }}
          className="text-ink hover:text-teal"
        >
          {line.title_snapshot}
        </Link>
        <Text size="sm" tone="muted" className="mt-1">
          {formatPrice(line.unit_price_cents)} × {line.qty}
        </Text>
        <Link
          to="/p/$slug"
          params={{ slug: line.slug_snapshot }}
          className={buttonClass('primary', 'mt-2 py-1 text-sm hover:no-underline')}
        >
          Buy it again
        </Link>
      </div>
      <p className="shrink-0 text-sm">{formatPrice(line.unit_price_cents * line.qty)}</p>
    </article>
  )
}
