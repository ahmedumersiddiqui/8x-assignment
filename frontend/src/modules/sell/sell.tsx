import { Link, useNavigate } from '@tanstack/react-router'

import { Container } from '@/components/ui/container'
import { ErrorMessage } from '@/components/ui/error-message'
import { Loading } from '@/components/ui/loading'
import { Text } from '@/components/ui/text'
import { WORDMARK } from '@/constants/navigation'
import { useStoresQuery, useUploadPolicyQuery } from '@/hooks/use-stores-query'
import { getAPIErrorMessage } from '@/utils/api'
import { formatDate, plural } from '@/utils/format'

import { StoreSetupForm } from './components/store-setup-form'
import { UploadsUnavailable } from './components/uploads-unavailable'

export function Sell() {
  const navigate = useNavigate()
  const { data: stores, isPending, isError, error, refetch } = useStoresQuery()
  const { data: policy } = useUploadPolicyQuery()

  if (isPending) return <Loading label="Loading your stores" />

  if (isError) {
    return (
      <Container className="py-6">
        <ErrorMessage
          message={getAPIErrorMessage(error, 'Could not load your stores.')}
          onRetry={() => void refetch()}
        />
      </Container>
    )
  }

  const hasStores = stores.length > 0

  return (
    <Container className="py-4">
      <Text as="h1" size="2xl" bold className="mb-1">
        Sell on {WORDMARK}
      </Text>
      <Text tone="muted" className="mb-4">
        {hasStores
          ? 'Pick a store to manage its listings, or open another one.'
          : 'Set up a store to start listing. It takes one field.'}
      </Text>

      {policy && !policy.configured && <UploadsUnavailable />}

      {hasStores && (
        <ul className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <li key={store.id} className="border border-line bg-white p-4">
              <Text as="h2" size="lg" bold className="mb-1 break-words">
                {store.display_name}
              </Text>
              <Text size="sm" tone="muted" className="mb-3">
                {store.listing_count === 0
                  ? 'No listings yet'
                  : `${store.listing_count} ${plural(store.listing_count, 'listing')}`}
                {' · opened '}
                {formatDate(store.created_at)}
              </Text>
              <div className="flex flex-wrap gap-x-4 text-sm">
                <Link to="/sell/$storeId" params={{ storeId: String(store.id) }}>
                  Manage listings
                </Link>
                <Link to="/store/$slug" params={{ slug: store.slug }}>
                  View storefront
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      <StoreSetupForm
        isFirstStore={!hasStores}
        onCreated={(store) =>
          void navigate({ to: '/sell/$storeId', params: { storeId: String(store.id) } })
        }
      />
    </Container>
  )
}
