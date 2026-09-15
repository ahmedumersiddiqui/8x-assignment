import { createFileRoute, notFound } from '@tanstack/react-router'

import { productQuery } from '@/hooks/use-product-query'
import { productsQuery } from '@/hooks/use-products-query'
import { reviewsQuery } from '@/hooks/use-reviews-query'
import { ProductDetail } from '@/modules/product-detail'
import { recommendedSearch } from '@/modules/product-detail/constants'
import { APIError } from '@/utils/api'

export const Route = createFileRoute('/_shop/p/$slug')({
  loader: async ({ context: { queryClient }, params }) => {
    const product = await queryClient
      .ensureQueryData(productQuery(params.slug))
      .catch((error: unknown) => {
        if (error instanceof APIError && error.status === 404) throw notFound()
        throw error
      })

    // Sequential on purpose: the category only exists once the product has resolved.
    // Awaited, so the rail is server-rendered -- leaving it to the client meant the
    // section appeared only after hydration, which React reports as a mismatch.
    await Promise.all([
      queryClient.ensureQueryData(productsQuery(recommendedSearch(product.category_slug))),
      queryClient.ensureQueryData(reviewsQuery(params.slug)),
    ])

    return product
  },
  component: ProductDetail,
})
