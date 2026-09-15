import { percentOff, splitPrice } from '@/utils/format'

import { Text } from './text'

export function Price({
  cents,
  listCents = null,
  size = 'lg',
}: {
  cents: number
  listCents?: number | null
  size?: 'lg' | 'sm'
}) {
  const { whole, fraction } = splitPrice(cents)
  const off = percentOff(cents, listCents)
  const big = size === 'lg' ? 'text-3xl' : 'text-xl'

  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      {off !== null && <span className="text-lg text-deal">-{off}%</span>}
      <span className={big}>
        <span className="align-super text-sm">$</span>
        {whole}
        <span className="align-super text-sm">{fraction}</span>
      </span>
      {listCents !== null && off !== null && (
        <Text as="span" size="xs" tone="muted">
          List:{' '}
          <s>
            ${splitPrice(listCents).whole}.{splitPrice(listCents).fraction}
          </s>
        </Text>
      )}
    </div>
  )
}
