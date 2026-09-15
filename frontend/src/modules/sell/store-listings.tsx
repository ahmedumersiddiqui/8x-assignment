import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { Container } from '@/components/ui/container'
import { ErrorMessage } from '@/components/ui/error-message'
import { Loading } from '@/components/ui/loading'
import { NoData } from '@/components/ui/no-data'
import { Pagination } from '@/components/ui/pagination'
import { Text } from '@/components/ui/text'
import { STORE_LISTINGS_PAGE_SIZE, useStoreListingsQuery } from '@/hooks/use-store-listings-query'
import { useStoresQuery } from '@/hooks/use-stores-query'
import { getAPIErrorMessage } from '@/utils/api'

import { ListingRow } from './components/listing-row'

export function StoreListings({ storeId }: { storeId: number }) {
  const [page, setPage] = useState(1)
  const { data: stores } = useStoresQuery()
  const listings = useStoreListingsQuery(storeId, page)
  const store = stores?.find((candidate) => candidate.id === storeId)

  if (listings.isPending) return <Loading label="Loading listings" />

  if (listings.isError) {
    return (
      <Container className="py-6">
        <ErrorMessage
          message={getAPIErrorMessage(listings.error, 'Could not load this store.')}
          onRetry={() => void listings.refetch()}
        />
      </Container>
    )
  }

  return (
    <Container className="py-4">
      <Link to="/sell" className="text-sm">
        All your stores
      </Link>

      <div className="mb-4 mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Text as="h1" size="2xl" bold>
            {store?.display_name ?? 'Your store'}
          </Text>
          <Text tone="muted" size="sm">
            {listings.data.total === 0
              ? 'Nothing listed yet'
              : `${listings.data.total} listed${listings.isFetching ? ' · refreshing' : ''}`}
          </Text>
        </div>
        {store && (
          <Link to="/store/$slug" params={{ slug: store.slug }} className="text-sm">
            View public storefront
          </Link>
        )}
        <Link
          to="/sell/$storeId/new"
          params={{ storeId: String(storeId) }}
          className="rounded-[100vw] bg-cta px-5 py-1.5 text-ink hover:bg-cta-hover hover:no-underline"
        >
          Add a listing
        </Link>
      </div>

      {listings.data.items.length === 0 ? (
        <NoData title="No listings in this store">
          Your first listing needs a title, a price and at least one photo.
        </NoData>
      ) : (
        <>
          <ul className="divide-y divide-line border border-line bg-white">
            {listings.data.items.map((listing) => (
              <ListingRow key={listing.id} listing={listing} storeId={storeId} />
            ))}
          </ul>
          <Pagination
            page={page}
            total={listings.data.total}
            pageSize={STORE_LISTINGS_PAGE_SIZE}
            onPageChange={setPage}
            label="Listings pagination"
          />
        </>
      )}
    </Container>
  )
}
