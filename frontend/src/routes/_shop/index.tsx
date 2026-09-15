import { createFileRoute } from '@tanstack/react-router'

import { categoriesQuery } from '@/hooks/use-categories-query'
import { productsQuery } from '@/hooks/use-products-query'
import { HOME_SEARCH, Home } from '@/modules/home'

export const Route = createFileRoute('/_shop/')({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(categoriesQuery()),
      queryClient.ensureQueryData(productsQuery(HOME_SEARCH)),
    ]),
  component: Home,
})
