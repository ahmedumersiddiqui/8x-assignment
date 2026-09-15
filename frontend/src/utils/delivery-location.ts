import { createIsomorphicFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'

import { DELIVERY_COOKIE, DELIVERY_COOKIE_MAX_AGE } from '@/constants/settings'

const POSTAL_CODE = /^\d{5}$/

const fromCookieString = (cookies: string | undefined) => {
  const match = cookies?.match(new RegExp(`(?:^|;\s*)${DELIVERY_COOKIE}=([^;]*)`))
  const value = match ? decodeURIComponent(match[1]) : ''
  return POSTAL_CODE.test(value) ? value : null
}

export const isPostalCode = (value: string) => POSTAL_CODE.test(value)

export const readDeliveryLocation = createIsomorphicFn()
  .client(() => fromCookieString(document.cookie))
  .server(() => fromCookieString(getRequestHeader('cookie')))

export function writeDeliveryLocation(postalCode: string | null) {
  const base = `${DELIVERY_COOKIE}=${postalCode ?? ''}; path=/; samesite=lax`
  document.cookie = postalCode ? `${base}; max-age=${DELIVERY_COOKIE_MAX_AGE}` : `${base}; max-age=0`
}
