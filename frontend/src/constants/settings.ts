const ENV = import.meta.env

// Trailing slash stripped: it would build `origin//api/v1`, which the API 404s.
export const API_ORIGIN = (ENV.VITE_API_ORIGIN ?? 'http://localhost:8000').replace(/\/+$/, '')
export const API_PREFIX = ENV.VITE_API_PREFIX ?? '/api/v1'
export const IS_DEV_ENVIRONMENT = ENV.DEV

// Not httpOnly: the header renders the chosen location, and the API reads the same cookie.
export const DELIVERY_COOKIE = 'delivery_postal_code'
export const DELIVERY_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export const PAGE_SIZE = 24
export const ORDERS_PAGE_SIZE = 10
export const MAX_QTY_PER_LINE = 20

export const STALE_TIME_MS = {
  catalog: 60_000,
  product: 5 * 60_000,
  session: 30_000,
} as const
