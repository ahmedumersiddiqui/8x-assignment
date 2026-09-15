import { z } from 'zod'

import { parseMoneyToCents } from '@/utils/money'

export const StoreSchema = z.object({
  id: z.number(),
  display_name: z.string(),
  slug: z.string(),
  created_at: z.string(),
  listing_count: z.number(),
})

export type Store = z.infer<typeof StoreSchema>

export const StoresSchema = z.array(StoreSchema)

/** The public storefront: no owner, no ids a shopper has no use for. */
export const StorefrontSchema = z.object({
  display_name: z.string(),
  slug: z.string(),
  created_at: z.string(),
  listing_count: z.number(),
})

export type Storefront = z.infer<typeof StorefrontSchema>

export const StoreFormSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(2, 'Store name must be at least 2 characters')
    .max(120, 'Store name is too long'),
})

export type StoreFormValues = z.infer<typeof StoreFormSchema>

export const UploadPolicySchema = z.object({
  configured: z.boolean(),
  max_bytes: z.number(),
  max_images: z.number(),
  allowed_types: z.array(z.string()),
})

export type UploadPolicy = z.infer<typeof UploadPolicySchema>

export const UploadTicketSchema = z.object({
  upload_url: z.string(),
  key: z.string(),
  public_url: z.string(),
  expires_in: z.number(),
})

export type UploadTicket = z.infer<typeof UploadTicketSchema>

export const ListingSchema = z.object({
  id: z.number(),
  store_id: z.number(),
  slug: z.string(),
  title: z.string(),
  brand: z.string(),
  image: z.string().nullable(),
  price_cents: z.number(),
  list_price_cents: z.number().nullable(),
  stock: z.number(),
  variant_count: z.number(),
  rating_avg: z.number(),
  rating_count: z.number(),
  created_at: z.string(),
})

export type Listing = z.infer<typeof ListingSchema>

export const ListingPageSchema = z.object({
  items: z.array(ListingSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
})

export type ListingPage = z.infer<typeof ListingPageSchema>

const money = (message: string) =>
  z.string().refine((value) => parseMoneyToCents(value) !== null, message)

/** What the form holds, which is not what the API takes: prices are typed as dollars and
 *  the option axis is named once for the whole listing rather than repeated per row. */
export const ListingFormSchema = z
  .object({
    title: z.string().trim().min(3, 'Give the listing a title').max(300, 'Title is too long'),
    brand: z.string().trim().min(1, 'Who makes it?').max(120, 'Brand name is too long'),
    category_slug: z.string().min(1, 'Pick a category'),
    description: z.string().max(4000, 'Description is too long'),
    bullets: z.array(z.object({ text: z.string().max(200, 'Keep bullets under 200 characters') })),
    option_name: z.string().max(60, 'Option name is too long'),
    variants: z
      .array(
        z.object({
          option_value: z.string().max(60, 'Option value is too long'),
          price: money('Enter a price like 24.99'),
          list_price: z.union([money('Enter a price like 29.99'), z.literal('')]),
          stock: z.coerce
            .number({ message: 'Enter a whole number' })
            .int('Enter a whole number')
            .min(0, 'Stock cannot be negative')
            .max(100_000, 'That is a lot of stock'),
        }),
      )
      .min(1)
      .max(8, 'Up to 8 options per listing'),
    images: z
      .array(z.object({ key: z.string(), url: z.string() }))
      .min(1, 'Add at least one photo')
      .max(6, 'Up to 6 photos per listing'),
  })
  .superRefine((values, context) => {
    values.variants.forEach((variant, index) => {
      const price = parseMoneyToCents(variant.price)
      if (price === 0) {
        context.addIssue({
          code: 'custom',
          path: ['variants', index, 'price'],
          message: 'Price must be more than zero',
        })
      }
      const listPrice = variant.list_price ? parseMoneyToCents(variant.list_price) : null
      if (price !== null && listPrice !== null && listPrice <= price) {
        context.addIssue({
          code: 'custom',
          path: ['variants', index, 'list_price'],
          message: 'The was-price has to be higher than the price',
        })
      }
    })

    if (values.variants.length < 2) return

    // More than one option means each needs a label, or the buy box shows identical rows.
    if (!values.option_name.trim()) {
      context.addIssue({
        code: 'custom',
        path: ['option_name'],
        message: 'Name the option so shoppers can tell the choices apart',
      })
    }
    const seen = new Set<string>()
    values.variants.forEach((variant, index) => {
      const value = variant.option_value.trim()
      if (!value) {
        context.addIssue({
          code: 'custom',
          path: ['variants', index, 'option_value'],
          message: 'Give this option a value',
        })
        return
      }
      if (seen.has(value)) {
        context.addIssue({
          code: 'custom',
          path: ['variants', index, 'option_value'],
          message: 'Two options cannot have the same value',
        })
      }
      seen.add(value)
    })
  })

export type ListingFormValues = z.input<typeof ListingFormSchema>
