import { OrderTotals } from '@/components/ui/order-totals'
import { Text } from '@/components/ui/text'
import type { Order } from '@/schemas/order'
import { readAddress } from '@/schemas/order'

import { OrderStatusLabels } from '../constants'
import { OrderLineRow } from './order-line-row'
import { OrderSummaryStrip } from './order-summary-strip'

export function OrderCard({ order }: { order: Order }) {
  const address = readAddress(order.address_snapshot)

  return (
    <section className="mb-4 border border-line bg-white" aria-labelledby={`order-${order.id}`}>
      <OrderSummaryStrip
        orderId={order.id}
        placedAt={order.placed_at}
        totalCents={order.total_cents}
        address={address}
      />

      <div className="flex flex-col gap-6 p-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          <Text as="h2" size="lg" id={`order-${order.id}`}>
            {OrderStatusLabels[order.status] ?? order.status}
          </Text>
          <Text size="sm" tone="muted">
            Arriving {order.delivery_estimate} · {order.delivery_option} delivery
          </Text>

          <div className="mt-2 divide-y divide-line">
            {order.items.map((line) => (
              <OrderLineRow key={`${order.id}-${line.variant_id}`} line={line} />
            ))}
          </div>
        </div>

        <div className="lg:w-[260px] lg:shrink-0">
          <Text as="h3" size="sm" className="mb-2">
            Shipping address
          </Text>
          {address ? (
            <address className="mb-4 text-sm not-italic text-muted">
              {address.name}
              <br />
              {address.line1}
              {address.line2 && (
                <>
                  <br />
                  {address.line2}
                </>
              )}
              <br />
              {address.city}, {address.state} {address.postal_code}
              <br />
              {address.country}
            </address>
          ) : (
            <Text size="sm" tone="muted" className="mb-4">
              Not available
            </Text>
          )}

          <Text as="h3" size="sm" className="mb-2">
            Order summary
          </Text>
          <OrderTotals
            subtotalCents={order.subtotal_cents}
            shippingCents={order.shipping_cents}
            taxCents={order.tax_cents}
            totalCents={order.total_cents}
          />
        </div>
      </div>
    </section>
  )
}
