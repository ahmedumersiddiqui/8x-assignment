import { createFileRoute } from '@tanstack/react-router'

import { productsQuery } from '@/hooks/use-products-query'
import { Search } from '@/modules/search'
import { ProductSearchSchema } from '@/schemas/product'

export const Route = createFileRoute('/_shop/s')({
  validateSearch: ProductSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context: { queryClient }, deps }) => queryClient.ensureQueryData(productsQuery(deps)),
  component: Search,
})
