/** Amazon shows a fixed top-ten brand list with a "see more", not every brand in the index. */
export const VISIBLE_BRAND_FACETS = 10
/**
 * Two names for one route, because the router keys them differently: `useSearch` takes the
 * route id, which carries the pathless `_shop` layout segment, while `useNavigate` and
 * every `<Link>` take the path the visitor actually sees.
 */
export const SEARCH_ROUTE_ID = '/_shop/s' as const
export const SEARCH_PATH = '/s' as const
