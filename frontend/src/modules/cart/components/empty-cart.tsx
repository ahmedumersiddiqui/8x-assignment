import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { CartIcon, IconSize } from '@/components/icons'
import { ProductTile } from '@/components/product-tile'
import { buttonClass } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { useAccountQuery } from '@/hooks/use-account-query'
import { productsQuery } from '@/hooks/use-products-query'

import { CART_RAIL_COUNT, CART_RAIL_SEARCH } from '../constants'

/** There is no terminal page on Amazon: an empty cart still sells. */
export function EmptyCart() {
  // Plain useQuery, not the suspense hook -- the rail must never hold up the cart itself.
  const { data: rail } = useQuery(productsQuery(CART_RAIL_SEARCH))
  const { data: user } = useAccountQuery()

  return (
    <div className="flex flex-col items-start gap-4 lg:flex-row">
      <div className="flex-1 bg-white p-8">
        <CartIcon size={IconSize.xl} className="mb-3 text-line" aria-hidden="true" />
        <Text as="h1" size="2xl" className="mb-2">
          Your cart is empty
        </Text>
        <Text tone="muted" className="mb-4">
          Items you add will appear here, and they stay in the cart when you sign in.
        </Text>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/s"
            search={{ sort: 'rating' }}
            className={buttonClass('primary', 'hover:no-underline')}
          >
            Shop top rated
          </Link>
          {!user && (
            <Link
              to="/login"
              className={buttonClass('secondary', 'hover:no-underline')}
            >
              Sign in to your account
            </Link>
          )}
        </div>
      </div>

      {rail && rail.items.length > 0 && (
        <section className="w-full bg-white p-4 lg:w-[300px] lg:shrink-0">
          <Text as="h2" size="lg" className="mb-3">
            Customers also bought
          </Text>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {rail.items.slice(0, CART_RAIL_COUNT).map((product) => (
              <ProductTile key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
