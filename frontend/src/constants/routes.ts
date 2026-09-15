import type { FileRoutesByPath } from '@tanstack/react-router'

export const LOGIN_PATH: FileRoutesByPath['/_auth/login']['fullPath'] = '/login'
export const REGISTER_PATH: FileRoutesByPath['/_auth/register']['fullPath'] = '/register'
export const HOME_PATH: FileRoutesByPath['/_shop/']['fullPath'] = '/'
export const ORDERS_PATH: FileRoutesByPath['/_protected/_layout/orders']['fullPath'] = '/orders'
export const CART_PATH: FileRoutesByPath['/_shop/cart']['fullPath'] = '/cart'
export const ACCOUNT_PATH: FileRoutesByPath['/_protected/_layout/account']['fullPath'] = '/account'
export const CHECKOUT_PATH: FileRoutesByPath['/_protected/_layout/checkout']['fullPath'] =
  '/checkout'
// An index route's fullPath carries a trailing slash ('/sell/') while Link's `to` union
// uses the bare form, so this one is pinned to the link target rather than the route.
export const SELL_PATH = '/sell' as const
