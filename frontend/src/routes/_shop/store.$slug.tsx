import { createFileRoute, notFound } from '@tanstack/react-router'

import { productsQuery } from '@/hooks/use-products-query'
import { storefrontQuery } from '@/hooks/use-storefront-query'
import { Storefront } from '@/modules/storefront'
import { ProductSearchSchema } from '@/schemas/product'
import { APIError } from '@/utils/api'

export const Route = createFileRoute('/_shop/store/$slug')({
  // Same schema as /s: the storefront is the catalogue query with one filter pinned, so
  // sort and page stay in the URL like every other grid.
  validateSearch: ProductSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, params, deps }) => {
    await queryClient.ensureQueryData(storefrontQuery(params.slug)).catch((error: unknown) => {
      // A mistyped shop name is a 404 page, not a 500.
      if (error instanceof APIError && error.status === 404) throw notFound()
      throw error
    })
    await queryClient.ensureQueryData(productsQuery({ ...deps, store: params.slug }))
  },
  component: StorefrontRoute,
})

function StorefrontRoute() {
  const { slug } = Route.useParams()
  return <Storefront slug={slug} />
}
