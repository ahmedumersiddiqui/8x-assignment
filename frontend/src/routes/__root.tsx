import type { QueryClient } from '@tanstack/react-query'
import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'

import { WORDMARK } from '@/constants/navigation'
import { categoriesQuery } from '@/hooks/use-categories-query'
import { fetchAccountDetails } from '@/utils/fetch-account-details'
import { syncCart } from '@/utils/sync-cart'
import appCss from '@/styles.css?url'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: `${WORDMARK} — online shopping` },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  // Identity has to be settled before `_auth` or `_protected` can decide anything, and it
  // is what exercises the SSR cookie forward in src/utils/api.ts. The cart rides along so
  // the header's badge does not flash.
  beforeLoad: async ({ context: { queryClient } }) => ({
    accountDetails: await fetchAccountDetails(queryClient),
  }),
  // The category tree is header chrome now that the search bar scopes by department. Without
  // it in the cache before first paint, SSR emits an empty <select> and hydration tears.
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([syncCart(queryClient), queryClient.ensureQueryData(categoriesQuery())])
  },
  shellComponent: RootDocument,
})

/** The document only. Page chrome belongs to the layout segments below it. */
function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
