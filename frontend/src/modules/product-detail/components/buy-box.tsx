import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { DeliveryIcon, IconSize, SuccessIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Price } from '@/components/ui/price'
import { QtyStepper } from '@/components/ui/qty-stepper'
import { StockStatus } from '@/components/ui/stock-status'
import { Text } from '@/components/ui/text'
import { CART_PATH, CHECKOUT_PATH } from '@/constants/routes'
import { MAX_QTY_PER_LINE } from '@/constants/settings'
import { useAddToCartMutation } from '@/hooks/use-cart-mutations'
import type { Variant } from '@/schemas/product'
import { getAPIErrorMessage } from '@/utils/api'

import { LOW_STOCK_THRESHOLD, metaRows } from '../constants'

export function BuyBox({
  variant,
  deliveryEstimate,
  soldBy,
  storeSlug,
}: {
  variant: Variant
  deliveryEstimate: string
  soldBy: string | null
  storeSlug: string | null
}) {
  const [qty, setQty] = useState(1)
  const navigate = useNavigate()
  const addToCart = useAddToCartMutation()
  // Its own mutation instance so Buy Now's pending state never spins Add to Cart's label.
  const buyNow = useAddToCartMutation()
  const maxQty = Math.min(variant.stock, MAX_QTY_PER_LINE)

  return (
    <aside className="self-start border border-line bg-white p-4" aria-label="Buy box">
      <Price cents={variant.price_cents} listCents={variant.list_price_cents} />

      {variant.stock > 0 ? (
        <>
          <Text size="sm" className="mt-2 flex items-center gap-2">
            <DeliveryIcon size={IconSize.sm} aria-hidden="true" />
            <span>
              FREE delivery <span className="font-bold">{deliveryEstimate}</span>
            </span>
          </Text>
          <p className="mt-2">
            <StockStatus inStock size="lg" />
          </p>
          {variant.stock <= LOW_STOCK_THRESHOLD && (
            <Text size="sm" tone="danger">
              Only {variant.stock} left &mdash; order soon.
            </Text>
          )}

          <div className="mt-3 flex items-center gap-2">
            <Text as="span" size="sm" tone="muted">
              Qty
            </Text>
            <QtyStepper value={qty} max={maxQty} label="quantity" onChange={setQty} />
          </div>

          <Button
            fullWidth
            className="mt-3"
            disabled={buyNow.isPending}
            isPending={addToCart.isPending}
            pendingLabel="Adding..."
            onClick={() => addToCart.mutate({ variant_id: variant.id, qty })}
          >
            Add to Cart
          </Button>

          <Button
            variant="buy"
            fullWidth
            className="mt-2"
            disabled={addToCart.isPending}
            isPending={buyNow.isPending}
            pendingLabel="One moment..."
            onClick={async () => {
              await buyNow.mutateAsync({ variant_id: variant.id, qty })
              await navigate({ to: CHECKOUT_PATH })
            }}
          >
            Buy Now
          </Button>

          <dl className="mt-4 border-t border-line pt-3 text-xs">
            {metaRows(soldBy, storeSlug).map((row) => (
              <div key={row.label} className="flex gap-2 py-0.5">
                <Text as="dt" size="xs" tone="muted" className="w-20 shrink-0">
                  {row.label}
                </Text>
                <dd>
                  {row.storeSlug ? (
                    <Link to="/store/$slug" params={{ slug: row.storeSlug }}>
                      {row.value}
                    </Link>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          {addToCart.isSuccess && (
            <Text size="sm" tone="success" role="status" className="mt-3 flex items-center gap-1">
              <SuccessIcon size={IconSize.sm} aria-hidden="true" />
              Added to your cart. <Link to={CART_PATH}>Go to cart</Link>
            </Text>
          )}
          {addToCart.isError && (
            <Text size="sm" tone="danger" role="alert" className="mt-3">
              {getAPIErrorMessage(addToCart.error, 'Could not add that. Please try again.')}
            </Text>
          )}
        </>
      ) : (
        <>
          <p className="mt-2">
            <StockStatus inStock={false} size="lg" />
          </p>
          <Text size="sm" tone="muted" className="mt-1">
            We don&apos;t know when or if this item will be back in stock.
          </Text>
        </>
      )}
    </aside>
  )
}
