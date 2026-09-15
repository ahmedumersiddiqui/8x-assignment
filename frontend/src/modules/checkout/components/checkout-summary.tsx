import { Button } from '@/components/ui/button'
import { OrderTotals } from '@/components/ui/order-totals'
import { Text } from '@/components/ui/text'
import type { Totals } from '@/schemas/order'
import { plural } from '@/utils/format'

/**
 * Every figure here comes from GET /checkout/preview, which runs the same compute_totals
 * that POST /checkout charges with. The client adds nothing up.
 */
export function CheckoutSummary({
  totals,
  isPending,
  isStale,
}: {
  totals: Totals | undefined
  isPending: boolean
  isStale: boolean
}) {
  return (
    <aside
      className="w-full bg-white p-4 lg:sticky lg:top-4 lg:w-[300px] lg:shrink-0"
      aria-label="Order summary"
    >
      <Button type="submit" fullWidth isPending={isPending} pendingLabel="Placing your order...">
        Place your order
      </Button>

      <Text size="xs" tone="muted" className="mt-2">
        By placing your order, you agree to our Conditions of Use and Privacy Notice.
      </Text>

      <hr className="my-3 border-line" />

      <Text as="h2" size="lg" bold className="mb-2">
        Order Summary
      </Text>

      {totals ? (
        <div aria-busy={isStale} className={isStale ? 'opacity-60' : ''}>
          <OrderTotals
            subtotalCents={totals.subtotal_cents}
            shippingCents={totals.shipping_cents}
            taxCents={totals.tax_cents}
            totalCents={totals.total_cents}
          />
          <Text size="xs" tone="muted" className="mt-2">
            {totals.item_count} {plural(totals.item_count, 'item')} · arriving{' '}
            {totals.delivery_estimate}
          </Text>
        </div>
      ) : (
        <Text size="sm" tone="muted">
          Calculating your total...
        </Text>
      )}
    </aside>
  )
}
