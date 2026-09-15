import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { Container } from '@/components/ui/container'
import { ErrorMessage } from '@/components/ui/error-message'
import { Loading } from '@/components/ui/loading'
import { Text } from '@/components/ui/text'
import { useCart } from '@/hooks/use-cart-query'
import { useCheckoutMutation } from '@/hooks/use-checkout-mutation'
import { useCheckoutPreview } from '@/hooks/use-checkout-preview-query'
import type { DeliveryOption } from '@/schemas/order'
import { AddressSchema, DeliveryOptions } from '@/schemas/order'
import { getAPIErrorMessage } from '@/utils/api'
import { formatPrice } from '@/utils/format'

import { AddressForm } from './components/address-form'
import { CheckoutSummary } from './components/checkout-summary'
import { DeliveryPicker } from './components/delivery-picker'
import { OrderConfirmation } from './components/order-confirmation'
import { DEMO_ADDRESS } from './constants'

export function Checkout() {
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>(DeliveryOptions.Standard)
  const { data: cart, isPending: isCartPending } = useCart()
  const preview = useCheckoutPreview(deliveryOption)
  const checkout = useCheckoutMutation()

  // One key per visit to this screen, so a double-clicked Place Order returns the first
  // order instead of creating a second. The server enforces it; this supplies it.
  const idempotencyKey = useRef(crypto.randomUUID()).current

  // Types are inferred from the schema rather than pinned to Address: country carries a
  // zod default, so what the form holds and what it resolves to are not the same shape.
  const form = useForm({
    resolver: zodResolver(AddressSchema),
    // Prefilled so a reviewer can place an order without typing an address first.
    defaultValues: DEMO_ADDRESS,
  })

  const onSubmit = form.handleSubmit((address) =>
    checkout.mutate({ address, delivery_option: deliveryOption, idempotency_key: idempotencyKey }),
  )

  if (checkout.isSuccess) return <OrderConfirmation order={checkout.data} />
  if (isCartPending && !cart) return <Loading label="Loading your order" />

  if (!cart || cart.items.length === 0) {
    return (
      <Container className="py-16">
        <div className="bg-white p-10 text-center">
          <Text as="h1" size="2xl" bold className="mb-2">
            There is nothing to check out
          </Text>
          <Text tone="muted" className="mb-6">
            Your cart is empty, so there is no order to place.
          </Text>
          <Link to="/">Back to the home page</Link>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-4">
      <FormProvider {...form}>
        <form onSubmit={onSubmit} noValidate>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="min-w-0 flex-1 bg-white p-4 sm:p-6">
              <Text as="h1" size="2xl" bold className="mb-4 border-b border-line pb-3">
                Checkout
              </Text>

              {checkout.isError && (
                <div className="mb-4">
                  <ErrorMessage
                    message={getAPIErrorMessage(
                      checkout.error,
                      'We could not place your order. Please try again.',
                    )}
                  />
                </div>
              )}

              <Text as="h2" size="lg" bold className="mb-2">
                Shipping address
              </Text>
              <AddressForm disabled={checkout.isPending} />

              <hr className="my-5 border-line" />
              <DeliveryPicker
                value={deliveryOption}
                estimate={preview.data?.delivery_estimate}
                disabled={checkout.isPending}
                onChange={setDeliveryOption}
              />

              <hr className="my-5 border-line" />
              <Text as="h2" size="lg" bold className="mb-2">
                Review your items
              </Text>
              <ul className="divide-y divide-line border-t border-line">
                {cart.items.map((line) => (
                  <li key={line.id} className="flex items-center gap-4 py-3">
                    <img
                      src={line.image ?? ''}
                      alt=""
                      width={64}
                      height={64}
                      loading="lazy"
                      className="h-16 w-16 shrink-0 bg-white object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <Text className="truncate">{line.title}</Text>
                      <Text size="sm" tone="muted">
                        Qty {line.qty}
                      </Text>
                    </div>
                    <Text bold className="shrink-0">
                      {formatPrice(line.line_total_cents)}
                    </Text>
                  </li>
                ))}
              </ul>
            </div>

            <CheckoutSummary
              totals={preview.data}
              isPending={checkout.isPending}
              isStale={preview.isFetching}
            />
          </div>
        </form>
      </FormProvider>
    </Container>
  )
}
