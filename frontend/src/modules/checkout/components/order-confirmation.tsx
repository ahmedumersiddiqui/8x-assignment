import { Link } from '@tanstack/react-router'

import { IconSize, SuccessIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { OrderTotals } from '@/components/ui/order-totals'
import { Text } from '@/components/ui/text'
import type { Order } from '@/schemas/order'
import { readAddress } from '@/schemas/order'

export function OrderConfirmation({ order }: { order: Order }) {
  const address = readAddress(order.address_snapshot)

  return (
    <Container className="py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 bg-white p-6">
          <div className="flex items-start gap-3">
            <SuccessIcon
              size={IconSize.lg}
              aria-hidden="true"
              className="mt-1 shrink-0 text-success"
            />
            <div className="min-w-0">
              <Text as="h1" size="2xl" bold className="text-success">
                Order placed, thank you!
              </Text>
              <Text tone="muted" className="mt-1">
                Confirmation will be sent to your email. Order #{order.id}.
              </Text>
            </div>
          </div>

          <Text size="lg" bold className="mt-5">
            Arriving {order.delivery_estimate}
          </Text>
          <Text size="sm" tone="muted" className="mb-4 first-letter:capitalize">
            {order.delivery_option} delivery
            {address ? ` to ${address.name}, ${address.city}, ${address.state}` : ''}
          </Text>

          <ul className="divide-y divide-line border-t border-line">
            {order.items.map((line) => (
              <li key={line.variant_id} className="flex items-center gap-4 py-3">
                <img
                  src={line.image_snapshot ?? ''}
                  alt=""
                  width={64}
                  height={64}
                  loading="lazy"
                  className="h-16 w-16 shrink-0 bg-white object-contain"
                />
                <div className="min-w-0 flex-1">
                  <Link to="/p/$slug" params={{ slug: line.slug_snapshot }} className="text-ink hover:text-teal">
                    {line.title_snapshot}
                  </Link>
                  <Text size="sm" tone="muted">
                    Qty {line.qty}
                  </Text>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/orders" className={buttonClass('primary', 'hover:no-underline')}>
              View your orders
            </Link>
            <Link to="/" className={buttonClass('secondary', 'hover:no-underline')}>
              Continue shopping
            </Link>
          </div>
        </div>

        <aside className="w-full bg-white p-4 lg:w-[300px] lg:shrink-0" aria-label="Order summary">
          <Text as="h2" size="lg" bold className="mb-2">
            Order Summary
          </Text>
          <OrderTotals
            subtotalCents={order.subtotal_cents}
            shippingCents={order.shipping_cents}
            taxCents={order.tax_cents}
            totalCents={order.total_cents}
          />
        </aside>
      </div>
    </Container>
  )
}
