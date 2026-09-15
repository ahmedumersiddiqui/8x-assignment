import { createFileRoute } from '@tanstack/react-router'

import { StoreListings } from '@/modules/sell'

export const Route = createFileRoute('/_protected/_layout/sell/$storeId/')({
  component: StoreListingsRoute,
})

function StoreListingsRoute() {
  const { storeId } = Route.useParams()
  return <StoreListings storeId={Number(storeId)} />
}
