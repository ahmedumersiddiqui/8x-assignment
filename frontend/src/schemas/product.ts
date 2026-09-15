import { z } from 'zod'

import { PAGE_SIZE } from '@/constants/settings'
import { SortOptions } from '@/constants/sort'

export const ProductCardSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  brand: z.string(),
  rating_avg: z.number(),
  rating_count: z.number(),
  price_cents: z.number(),
  list_price_cents: z.number().nullable(),
  image: z.string().nullable(),
  in_stock: z.boolean(),
})

export type ProductCard = z.infer<typeof ProductCardSchema>

export const VariantSchema = z.object({
  id: z.number(),
  sku: z.string(),
  attrs: z.record(z.string(), z.string()),
  price_cents: z.number(),
  list_price_cents: z.number().nullable(),
  stock: z.number(),
})

export type Variant = z.infer<typeof VariantSchema>

export const ProductDetailSchema = ProductCardSchema.extend({
  description: z.string(),
  bullets: z.array(z.string()),
  specs: z.record(z.string(), z.string()),
  images: z.array(z.string()),
  variants: z.array(VariantSchema),
  category_slug: z.string(),
  // Computed server-side from the shipping rules; never re-derived in the browser.
  delivery_estimate: z.string(),
  // The storefront that listed it. Nullable because a product can outlive its store.
  sold_by: z.string().nullable(),
  store_slug: z.string().nullable(),
})

export type ProductDetail = z.infer<typeof ProductDetailSchema>

export const FacetCountSchema = z.object({ value: z.string(), count: z.number() })

export type FacetCount = z.infer<typeof FacetCountSchema>

export const FacetsSchema = z.object({
  brands: z.array(FacetCountSchema),
  ratings: z.array(FacetCountSchema),
  price_min_cents: z.number(),
  price_max_cents: z.number(),
})

export type Facets = z.infer<typeof FacetsSchema>

export const SearchResponseSchema = z.object({
  items: z.array(ProductCardSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
  facets: FacetsSchema,
  delivery_estimate: z.string(),
})

export type SearchResponse = z.infer<typeof SearchResponseSchema>

const optionalNumber = z.coerce.number().optional().catch(undefined)

const brandList = z
  .union([z.string(), z.array(z.string())])
  .transform((value) => (Array.isArray(value) ? value : [value]))
  .optional()
  .catch(undefined)

export const ProductSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
  // A storefront slug. The store page is this same query, scoped.
  store: z.string().optional().catch(undefined),
  brand: brandList,
  min_price: optionalNumber,
  max_price: optionalNumber,
  min_rating: optionalNumber,
  in_stock: z
    .union([z.boolean(), z.literal('true').transform(() => true)])
    .optional()
    .catch(undefined),
  sort: z.enum(SortOptions).optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
})

export type ProductSearch = z.infer<typeof ProductSearchSchema>

export const withSearchDefaults = (search: ProductSearch) => ({
  ...search,
  page: search.page ?? 1,
  page_size: PAGE_SIZE,
})
