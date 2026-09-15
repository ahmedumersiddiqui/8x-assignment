import { Container } from '@/components/ui/container'
import { ErrorMessage } from '@/components/ui/error-message'
import { Loading } from '@/components/ui/loading'
import { Text } from '@/components/ui/text'
import { useCart } from '@/hooks/use-cart-query'
import {
  useMoveToCartMutation,
  useRemoveCartItemMutation,
  useSaveForLaterMutation,
  useUpdateCartItemMutation,
} from '@/hooks/use-cart-mutations'
import { useCartStore } from '@/stores/cart-store'
import { getAPIErrorMessage } from '@/utils/api'
import { formatPrice, plural } from '@/utils/format'

import { CartLineRow } from './components/cart-line-row'
import { CartSummary } from './components/cart-summary'
import { EmptyCart } from './components/empty-cart'
import { SavedItems } from './components/saved-items'

export function Cart() {
  const { data: cart, isPending, isError, error, refetch } = useCart()
  const busyLineIds = useCartStore((state) => state.busyLineIds)
  const updateItem = useUpdateCartItemMutation()
  const removeItem = useRemoveCartItemMutation()
  const saveForLater = useSaveForLaterMutation()
  const moveToCart = useMoveToCartMutation()

  if (isPending && !cart) return <Loading label="Loading your cart" />
  if (isError && !cart) {
    return (
      <Container className="py-6">
        <ErrorMessage message={getAPIErrorMessage(error)} onRetry={() => refetch()} />
      </Container>
    )
  }
  const saved = (
    <SavedItems
      lines={cart?.saved_items ?? []}
      busyLineIds={busyLineIds}
      onMoveToCart={(itemId) => moveToCart.mutate(itemId)}
      onRemove={(itemId) => removeItem.mutate(itemId)}
    />
  )

  if (!cart || cart.items.length === 0) {
    return (
      <Container className="py-4">
        <EmptyCart />
        {saved}
      </Container>
    )
  }

  const failure =
    updateItem.error ?? removeItem.error ?? saveForLater.error ?? moveToCart.error

  return (
    <Container className="py-4">
      <div className="flex flex-col items-start gap-4 lg:flex-row">
        <div className="w-full min-w-0 flex-1 bg-white p-4">
          <div className="flex items-baseline justify-between">
            <Text as="h1" size="2xl">
              Shopping Cart
            </Text>
            <Text as="span" size="sm" tone="muted">
              Price
            </Text>
          </div>

          {failure && (
            <Text role="alert" size="sm" tone="danger" className="mt-3 border border-deal px-3 py-2">
              {getAPIErrorMessage(failure, 'That change did not stick. Please try again.')}
            </Text>
          )}

          {cart.items.map((line) => (
            <CartLineRow
              key={line.id}
              line={line}
              isBusy={busyLineIds.includes(line.id)}
              onQtyChange={(qty) => updateItem.mutate({ itemId: line.id, qty })}
              onRemove={() => removeItem.mutate(line.id)}
              onSaveForLater={() => saveForLater.mutate(line.id)}
            />
          ))}

          <Text size="lg" className="mt-4 border-t border-line pt-4 text-right">
            Subtotal ({cart.item_count} {plural(cart.item_count, 'item')}):{' '}
            <span className="font-bold">{formatPrice(cart.subtotal_cents)}</span>
          </Text>
        </div>

        <CartSummary itemCount={cart.item_count} subtotalCents={cart.subtotal_cents} />
      </div>

      {saved}
    </Container>
  )
}
