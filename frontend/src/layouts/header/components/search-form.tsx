import { useQuery } from '@tanstack/react-query'
import { useLocation, useNavigate } from '@tanstack/react-router'

import { IconSize, SearchIcon } from '@/components/icons'
import { WORDMARK } from '@/constants/navigation'
import { categoriesQuery } from '@/hooks/use-categories-query'
import { useUIStore } from '@/stores/ui-store'

const ALL_DEPARTMENTS = 'all'

export function SearchForm() {
  const navigate = useNavigate()
  const setSearchFocused = useUIStore((state) => state.setSearchFocused)
  const { data: categories } = useQuery(categoriesQuery())
  // The header sits above the search route, so useSearch would read the layout's params,
  // not the URL's. The router's location is the only place both are visible from here.
  const search = useLocation({ select: (location) => location.search }) as {
    q?: string
    category?: string
  }
  const term = search.q ?? ''
  const scope = search.category ?? ALL_DEPARTMENTS

  return (
    <form
      role="search"
      // Remount when the URL changes, and again once the department options exist:
      // defaultValue cannot select an <option> that has not rendered yet.
      key={`${scope}:${term}:${categories?.length ?? 0}`}
      className="order-last flex min-w-full flex-1 sm:order-none sm:min-w-[280px]"
      onSubmit={(event) => {
        event.preventDefault()
        const fields = new FormData(event.currentTarget)
        const category = String(fields.get('scope'))
        void navigate({
          to: '/s',
          search: {
            q: String(fields.get('q')) || undefined,
            category: category === ALL_DEPARTMENTS ? undefined : category,
            page: 1,
          },
        })
      }}
    >
      <label htmlFor="search-scope" className="sr-only">
        Search in department
      </label>
      <select
        id="search-scope"
        name="scope"
        defaultValue={scope}
        className="hidden max-w-[150px] cursor-pointer rounded-l-[8px] border-r border-line bg-field px-2 text-xs text-ink outline-none sm:block"
      >
        <option value={ALL_DEPARTMENTS}>All</option>
        {(categories ?? []).map((category) => (
          <optgroup key={category.id} label={category.name}>
            <option value={category.slug}>All {category.name}</option>
            {category.children.map((child) => (
              <option key={child.id} value={child.slug}>
                {child.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <label htmlFor="site-search" className="sr-only">
        Search {WORDMARK}
      </label>
      <input
        id="site-search"
        name="q"
        defaultValue={term}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        placeholder={`Search ${WORDMARK}`}
        className="w-full rounded-l-[8px] bg-white px-3 py-2 text-ink outline-none sm:rounded-l-none"
      />
      <button
        type="submit"
        className="flex items-center rounded-r-[8px] bg-cta px-4 text-ink hover:bg-cta-hover"
        aria-label="Submit search"
      >
        <SearchIcon size={IconSize.md} aria-hidden="true" />
      </button>
    </form>
  )
}
