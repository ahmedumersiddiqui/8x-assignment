import type { Address } from '@/schemas/order'
import { Text } from '@/components/ui/text'
import { formatDate, formatPrice } from '@/utils/format'

/** The grey band across the top of an Amazon order card. */
export function OrderSummaryStrip({
  orderId,
  placedAt,
  totalCents,
  address,
}: {
  orderId: number
  placedAt: string
  totalCents: number
  address: Address | null
}) {
  return (
    <div className="flex flex-wrap gap-x-10 gap-y-3 border-b border-line bg-field px-4 py-3 text-xs uppercase text-muted">
      <Field label="Order placed">{formatDate(placedAt)}</Field>
      <Field label="Total">{formatPrice(totalCents)}</Field>
      <Field label="Ship to">{address?.name ?? '—'}</Field>
      <Field label="Order #" className="ml-auto text-right">
        {orderId}
      </Field>
    </div>
  )
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="inline">{label}</dt>
      <Text as="dd" size="sm" className="mt-1 normal-case">
        {children}
      </Text>
    </div>
  )
}
