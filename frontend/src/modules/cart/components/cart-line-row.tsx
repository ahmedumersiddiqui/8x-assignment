import { Link } from '@tanstack/react-router'

import { DeleteIcon, IconSize, SaveIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { QtyStepper } from '@/components/ui/qty-stepper'
import { StockStatus } from '@/components/ui/stock-status'
import { Text } from '@/components/ui/text'
import { MAX_QTY_PER_LINE } from '@/constants/settings'
import { formatPrice } from '@/utils/format'
import type { CartLine } from '@/schemas/cart'


export function CartLineRow({
  line,
  isBusy,
  onQtyChange,
  onRemove,
  onSaveForLater,
}: {
  line: CartLine
  isBusy: boolean
  onQtyChange: (qty: number) => void
  onRemove: () => void
  onSaveForLater: () => void
}) {
  const attrs = Object.entries(line.attrs)

  return (
    <article
      className={`flex flex-wrap gap-4 border-t border-line py-4 ${isBusy ? 'opacity-60' : ''}`}
      aria-busy={isBusy}
    >
      <Link to="/p/$slug" params={{ slug: line.slug }} className="shrink-0">
        <img
          src={line.image ?? ''}
          alt={line.title}
          width={180}
          height={180}
          loading="lazy"
          className="h-[100px] w-[100px] object-contain sm:h-[140px] sm:w-[140px]"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link to="/p/$slug" params={{ slug: line.slug }} className="text-lg text-ink hover:text-teal">
          {line.title}
        </Link>

        <p className="mt-1">
          <StockStatus inStock={line.stock > 0} />
        </p>

        {attrs.length > 0 && (
          <Text size="sm" tone="muted" className="mt-1">
            {attrs.map(([name, value]) => `${name}: ${value}`).join(' · ')}
          </Text>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <QtyStepper
            value={line.qty}
            max={Math.min(line.stock, MAX_QTY_PER_LINE)}
            label={`quantity of ${line.title}`}
            isBusy={isBusy}
            onChange={onQtyChange}
            onRemove={onRemove}
          />
          {line.qty > 1 && (
            <>
              <span aria-hidden="true" className="text-line">
                |
              </span>
              <Button variant="link" onClick={onRemove} disabled={isBusy}>
                <DeleteIcon size={IconSize.sm} aria-hidden="true" />
                Delete
                <span className="sr-only"> {line.title} from cart</span>
              </Button>
            </>
          )}
          <span aria-hidden="true" className="text-line">
            |
          </span>
          <Button variant="link" onClick={onSaveForLater} disabled={isBusy}>
            <SaveIcon size={IconSize.sm} aria-hidden="true" />
            Save for later
            <span className="sr-only"> {line.title}</span>
          </Button>
        </div>
      </div>

      <p className="order-last w-full shrink-0 text-right text-lg sm:order-none sm:w-auto">
        {formatPrice(line.line_total_cents)}
      </p>
    </article>
  )
}
