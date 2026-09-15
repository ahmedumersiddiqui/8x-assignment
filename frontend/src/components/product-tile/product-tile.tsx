import { Link } from '@tanstack/react-router'

import { Price } from '@/components/ui/price'
import { Stars } from '@/components/ui/stars'
import { StockStatus } from '@/components/ui/stock-status'
import type { ProductCard } from '@/schemas/product'

export function ProductTile({ product }: { product: ProductCard }) {
  return (
    <article className="flex flex-col bg-white p-4">
      {/* Square box with the image contained: a grid of mixed aspect ratios reflows into a
          ragged mess, and a product grid that looks ragged looks broken. */}
      <Link
        to="/p/$slug"
        params={{ slug: product.slug }}
        className="mb-3 flex aspect-square items-center justify-center"
      >
        <img
          src={product.image ?? ''}
          alt={product.title}
          width={240}
          height={240}
          loading="lazy"
          className="max-h-full max-w-full object-contain"
        />
      </Link>
      <Link
        to="/p/$slug"
        params={{ slug: product.slug }}
        className="mb-1 line-clamp-2 text-ink hover:text-teal"
      >
        {product.title}
      </Link>
      <div className="mb-1">
        <Stars rating={product.rating_avg} count={product.rating_count} />
      </div>
      <Price cents={product.price_cents} listCents={product.list_price_cents} size="sm" />
      {!product.in_stock && (
        <p className="mt-1">
          <StockStatus inStock={false} />
        </p>
      )}
    </article>
  )
}
