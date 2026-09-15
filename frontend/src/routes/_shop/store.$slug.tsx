import { createFileRoute } from '@tanstack/react-router'

import { productsQuery } from '@/hooks/use-products-query'
import { storefrontQuery } from '@/hooks/use-storefront-query'
import { Storefront } from '@/modules/storefront'
import { ProductSearchSchema } from '@/schemas/product'

export const Route = createFileRoute('/_shop/store/$slug')({
  // Same schema as /s: the storefront is the catalogue query with one filter pinned, so
  // sort and page stay in the URL like every other grid.
  validateSearch: ProductSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context: { queryClient }, params, deps }) =>
    Promise.all([
      queryClient.ensureQueryData(storefrontQuery(params.slug)),
      queryClient.ensureQueryData(productsQuery({ ...deps, store: params.slug })),
    ]),
  component: StorefrontRoute,
})

function StorefrontRoute() {
  const { slug } = Route.useParams()
  return <Storefront slug={slug} />
}
