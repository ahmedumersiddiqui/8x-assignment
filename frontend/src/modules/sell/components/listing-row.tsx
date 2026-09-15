import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { Price } from '@/components/ui/price'
import { Text } from '@/components/ui/text'
import { useDeleteListingMutation } from '@/hooks/use-store-mutations'
import type { Listing } from '@/schemas/store'
import { getAPIErrorMessage } from '@/utils/api'
import { plural } from '@/utils/format'

export function ListingRow({ listing, storeId }: { listing: Listing; storeId: number }) {
  const remove = useDeleteListingMutation(storeId)

  return (
    <li className="flex flex-wrap items-start gap-4 p-4">
      <img
        src={listing.image ?? ''}
        alt=""
        width={64}
        height={64}
        loading="lazy"
        className="h-16 w-16 shrink-0 border border-line bg-white object-contain"
      />

      <div className="min-w-[12rem] flex-1">
        <Link to="/p/$slug" params={{ slug: listing.slug }} className="font-bold">
          {listing.title}
        </Link>
        <Text size="sm" tone="muted">
          {listing.brand} · {listing.variant_count}{' '}
          {plural(listing.variant_count, 'option')}
        </Text>
        <Text size="sm" tone={listing.stock === 0 ? 'danger' : 'muted'}>
          {listing.stock === 0 ? 'Out of stock' : `${listing.stock} in stock`}
        </Text>
      </div>

      <div className="text-right">
        <Price cents={listing.price_cents} listCents={listing.list_price_cents} size="sm" />
      </div>

      <div className="w-full sm:w-auto">
        <Button
          variant="outline"
          onClick={() => remove.mutate(listing.id)}
          disabled={remove.isPending}
          isPending={remove.isPending}
          pendingLabel="Removing..."
        >
          Remove
        </Button>
        {remove.isError && (
          <Text size="xs" tone="danger" role="alert" className="mt-1 max-w-48">
            {getAPIErrorMessage(remove.error, 'Could not remove that listing.')}
          </Text>
        )}
      </div>
    </li>
  )
}
