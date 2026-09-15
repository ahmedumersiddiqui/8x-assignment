import { Stars } from '@/components/ui/stars'
import type { Facets } from '@/schemas/product'
import { useUIStore } from '@/stores/ui-store'

import { VISIBLE_BRAND_FACETS } from '../constants'
import { useSearchFilters } from '../hooks/use-search-filters'
import { PriceFilter } from './price-filter'

export function FacetRail({ facets }: { facets: Facets }) {
  const { search, toggleBrand, toggleRating, setInStock, setPriceRange } = useSearchFilters()
  const isOpen = useUIStore((state) => state.isFilterDrawerOpen)

  return (
    <aside
      className={`w-full shrink-0 bg-white p-4 lg:block lg:w-[230px] ${isOpen ? 'block' : 'hidden'}`}
      aria-label="Filters"
    >
      <fieldset className="mb-6 border-0 p-0">
        <legend className="mb-2">Customer Reviews</legend>
        {facets.ratings.map((bucket) => {
          const rating = Number(bucket.value)
          const isActive = search.min_rating === rating
          return (
            <button
              key={bucket.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => toggleRating(rating)}
              className={`flex w-full items-center gap-2 py-1 text-left ${isActive ? 'font-bold' : ''}`}
            >
              <Stars rating={rating} />
              <span className="text-sm">&amp; Up ({bucket.count})</span>
            </button>
          )
        })}
      </fieldset>

      <fieldset className="mb-6 border-0 p-0">
        <legend className="mb-2">Brands</legend>
        {facets.brands.slice(0, VISIBLE_BRAND_FACETS).map((brand) => (
          <label key={brand.value} className="flex items-center gap-2 py-1 text-sm">
            <input
              type="checkbox"
              checked={(search.brand ?? []).includes(brand.value)}
              onChange={() => toggleBrand(brand.value)}
            />
            {brand.value} ({brand.count})
          </label>
        ))}
      </fieldset>

      <fieldset className="mb-6 border-0 p-0">
        <legend className="mb-2">Price</legend>
        <PriceFilter
          facets={facets}
          minCents={search.min_price}
          maxCents={search.max_price}
          onApply={setPriceRange}
        />
      </fieldset>

      <fieldset className="border-0 p-0">
        <legend className="mb-2">Availability</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={search.in_stock ?? false}
            onChange={(event) => setInStock(event.target.checked)}
          />
          In stock only
        </label>
      </fieldset>
    </aside>
  )
}
