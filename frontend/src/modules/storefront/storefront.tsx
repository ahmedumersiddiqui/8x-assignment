import { Link, useNavigate, useSearch } from '@tanstack/react-router'

import { ProductTile } from '@/components/product-tile'
import { Container } from '@/components/ui/container'
import { NoData } from '@/components/ui/no-data'
import { Pagination } from '@/components/ui/pagination'
import { Text } from '@/components/ui/text'
import { PAGE_SIZE } from '@/constants/settings'
import type { Sort } from '@/constants/sort'
import { useProductsQuery } from '@/hooks/use-products-query'
import { useStorefrontQuery } from '@/hooks/use-storefront-query'
import { SortSelect } from '@/modules/search/components/sort-select'
import { formatDate, plural } from '@/utils/format'

const ROUTE_ID = '/_shop/store/$slug' as const

export function Storefront({ slug }: { slug: string }) {
  const navigate = useNavigate()
  const search = useSearch({ from: ROUTE_ID })
  const { data: store } = useStorefrontQuery(slug)
  const { data } = useProductsQuery({ ...search, store: slug })
  const page = search.page ?? 1

  return (
    <Container className="py-4">
      <header className="mb-3 bg-white p-4 sm:p-6">
        <Text as="h1" size="3xl" className="break-words">
          {store.display_name}
        </Text>
        <Text tone="muted" size="sm">
          {store.listing_count} {plural(store.listing_count, 'product')} · selling since{' '}
          {formatDate(store.created_at)}
        </Text>
      </header>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2">
        <Text size="sm" tone="muted">
          {data.total === 0
            ? 'Nothing listed'
            : `${data.total} ${plural(data.total, 'result')} from this store`}
        </Text>
        <SortSelect
          value={search.sort}
          onChange={(sort: Sort) => void navigate({ to: '.', search: { ...search, sort, page: 1 } })}
        />
      </div>

      {data.items.length === 0 ? (
        <NoData title="This store has nothing listed yet">
          Have a look at <Link to="/">the rest of the shop</Link> in the meantime.
        </NoData>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {data.items.map((product) => (
            <ProductTile key={product.id} product={product} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        total={data.total}
        pageSize={PAGE_SIZE}
        label="Storefront pagination"
        onPageChange={(next) => void navigate({ to: '.', search: { ...search, page: next } })}
      />
    </Container>
  )
}
