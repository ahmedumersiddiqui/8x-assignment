import { Link } from '@tanstack/react-router'

import { Price } from '@/components/ui/price'
import { Stars } from '@/components/ui/stars'
import { StockStatus } from '@/components/ui/stock-status'
import { Text } from '@/components/ui/text'
import type { ProductCard } from '@/schemas/product'

export function SearchResultRow({
  product,
  deliveryEstimate,
}: {
  product: ProductCard
  deliveryEstimate: string
}) {
  return (
    <article className="flex gap-4 border-b border-line bg-white p-4 last:border-b-0">
      <Link to="/p/$slug" params={{ slug: product.slug }} className="shrink-0">
        {/* Fixed square box, image contained inside it: a phone gets a thumbnail rather
            than a 200px block that squeezes the title into one word per line. */}
        <span className="flex h-30 w-30 items-center justify-center bg-white sm:h-50 sm:w-50">
          <img
            src={product.image ?? ''}
            alt={product.title}
            width={200}
            height={200}
            loading="lazy"
            className="max-h-full max-w-full object-contain"
          />
        </span>
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          to="/p/$slug"
          params={{ slug: product.slug }}
          className="mb-1 block text-base text-ink hover:text-teal sm:text-lg"
        >
          {product.title}
        </Link>
        <Text size="sm" tone="muted" className="mb-1">
          {product.brand}
        </Text>
        <div className="mb-2">
          <Stars rating={product.rating_avg} count={product.rating_count} showValue />
        </div>
        <Price cents={product.price_cents} listCents={product.list_price_cents} />

        {product.in_stock ? (
          <Text size="sm" className="mt-1">
            FREE delivery <span className="font-bold">{deliveryEstimate}</span>
          </Text>
        ) : (
          <p className="mt-1">
            <StockStatus inStock={false} />
          </p>
        )}
      </div>
    </article>
  )
}
