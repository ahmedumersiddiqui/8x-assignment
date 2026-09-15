import { Link } from '@tanstack/react-router'

import { buttonClass } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { formatPrice, plural } from '@/utils/format'

/**
 * Subtotal only. Shipping and tax are the server's answer at checkout, and quoting a
 * total here that the server might not agree with is how a cart starts lying.
 */
export function CartSummary({ itemCount, subtotalCents }: { itemCount: number; subtotalCents: number }) {
  return (
    <aside className="w-full bg-white p-4 lg:w-[300px] lg:shrink-0" aria-label="Order summary">
      <Text size="lg">
        Subtotal ({itemCount} {plural(itemCount, 'item')}):{' '}
        <span className="font-bold">{formatPrice(subtotalCents)}</span>
      </Text>
      <Link
        to="/checkout"
        className={buttonClass('primary', 'mt-3 w-full hover:no-underline')}
      >
        Proceed to checkout
      </Link>
    </aside>
  )
}
