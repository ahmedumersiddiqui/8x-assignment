import { Link, createFileRoute } from '@tanstack/react-router'

import { Container } from '@/components/ui/container'
import { Text } from '@/components/ui/text'
import { ListingForm } from '@/modules/sell'

export const Route = createFileRoute('/_protected/_layout/sell/$storeId/new')({
  component: NewListingRoute,
})

function NewListingRoute() {
  const { storeId } = Route.useParams()

  return (
    <Container className="py-4">
      <Link to="/sell/$storeId" params={{ storeId }} className="text-sm">
        Back to your listings
      </Link>
      <Text as="h1" size="2xl" bold className="mb-4 mt-2">
        Add a listing
      </Text>
      <ListingForm storeId={Number(storeId)} />
    </Container>
  )
}
