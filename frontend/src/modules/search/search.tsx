import { Link } from '@tanstack/react-router'

import { FiltersIcon, IconSize } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { NoData } from '@/components/ui/no-data'
import { Pagination } from '@/components/ui/pagination'
import { PAGE_SIZE } from '@/constants/settings'
import { useProductsQuery } from '@/hooks/use-products-query'
import { useUIStore } from '@/stores/ui-store'

import { FacetRail } from './components/facet-rail'
import { ResultsSummary } from './components/results-summary'
import { SearchResultRow } from './components/search-result-row'
import { SortSelect } from './components/sort-select'
import { useSearchFilters } from './hooks/use-search-filters'

export function Search() {
  const { search, setSort } = useSearchFilters()
  const { data } = useProductsQuery(search)
  const { isFilterDrawerOpen, setFilterDrawerOpen } = useUIStore()

  const page = search.page ?? 1

  return (
    <Container className="py-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 bg-white px-4 py-2">
        <ResultsSummary page={page} total={data.total} query={search.q} />
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setFilterDrawerOpen(!isFilterDrawerOpen)}
            aria-expanded={isFilterDrawerOpen}
            className="lg:hidden"
          >
            <FiltersIcon size={IconSize.sm} aria-hidden="true" />
            Filters
          </Button>
          <SortSelect value={search.sort} onChange={setSort} />
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <FacetRail facets={data.facets} />
        <div className="min-w-0 flex-1">
          {data.items.length === 0 ? (
            <NoData title="No results found">
              Try a different search term, or <Link to="/">browse the home page</Link>.
            </NoData>
          ) : (
            <div className="bg-white">
              <h1 className="px-4 pt-3 text-lg">Results</h1>
              {data.items.map((product) => (
                <SearchResultRow
                  key={product.id}
                  product={product}
                  deliveryEstimate={data.delivery_estimate}
                />
              ))}
            </div>
          )}

          <Pagination page={page} total={data.total} pageSize={PAGE_SIZE} />
        </div>
      </div>
    </Container>
  )
}
