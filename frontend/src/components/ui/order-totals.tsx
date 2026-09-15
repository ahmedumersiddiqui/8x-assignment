import { Text } from '@/components/ui/text'
import { formatPrice } from '@/utils/format'

export function OrderTotals({
  subtotalCents,
  shippingCents,
  taxCents,
  totalCents,
}: {
  subtotalCents: number
  shippingCents: number
  taxCents: number
  totalCents: number
}) {
  const rows = [
    ['Subtotal', subtotalCents],
    ['Shipping', shippingCents],
    ['Estimated tax', taxCents],
  ] as const

  return (
    <dl className="text-sm">
      {rows.map(([label, cents]) => (
        <div key={label} className="flex justify-between py-0.5">
          <Text as="dt" tone="muted">
            {label}
          </Text>
          <dd>{cents === 0 && label === 'Shipping' ? 'FREE' : formatPrice(cents)}</dd>
        </div>
      ))}
      <div className="mt-1 flex justify-between border-t border-line pt-1 text-lg">
        <dt>Order total</dt>
        <dd className="font-bold text-deal">{formatPrice(totalCents)}</dd>
      </div>
    </dl>
  )
}
