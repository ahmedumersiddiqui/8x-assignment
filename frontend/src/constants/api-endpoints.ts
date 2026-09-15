export const APIEndpoints = {
  Cart: '/cart',
  CartItems: '/cart/items',
  Categories: '/categories',
  Checkout: '/checkout',
  CheckoutPreview: '/checkout/preview',
  Login: '/auth/login',
  Logout: '/auth/logout',
  Me: '/auth/me',
  Orders: '/orders',
  Products: '/products',
  Register: '/auth/register',
  Stores: '/stores',
  UploadPolicy: '/uploads/policy',
  UploadSign: '/uploads/sign',
} as const

export const productEndpoint = (slug: string) => `${APIEndpoints.Products}/${slug}`
export const cartItemEndpoint = (itemId: number) => `${APIEndpoints.CartItems}/${itemId}`
export const saveForLaterEndpoint = (itemId: number) => `${cartItemEndpoint(itemId)}/save`
export const moveToCartEndpoint = (itemId: number) => `${cartItemEndpoint(itemId)}/move-to-cart`
export const reviewsEndpoint = (slug: string) => `${productEndpoint(slug)}/reviews`
export const orderEndpoint = (orderId: number) => `${APIEndpoints.Orders}/${orderId}`
export const storefrontEndpoint = (slug: string) => `${APIEndpoints.Stores}/${slug}`
export const storeListingsEndpoint = (storeId: number) => `${APIEndpoints.Stores}/${storeId}/listings`
export const storeListingEndpoint = (storeId: number, productId: number) =>
  `${storeListingsEndpoint(storeId)}/${productId}`
