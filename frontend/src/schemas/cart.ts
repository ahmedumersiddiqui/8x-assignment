import { z } from 'zod'

import { MAX_QTY_PER_LINE } from '@/constants/settings'

export const CartLineSchema = z.object({
  id: z.number(),
  variant_id: z.number(),
  qty: z.number(),
  title: z.string(),
  slug: z.string(),
  image: z.string().nullable(),
  attrs: z.record(z.string(), z.string()),
  unit_price_cents: z.number(),
  line_total_cents: z.number(),
  stock: z.number(),
})

export type CartLine = z.infer<typeof CartLineSchema>

export const CartSchema = z.object({
  items: z.array(CartLineSchema),
  saved_items: z.array(CartLineSchema),
  subtotal_cents: z.number(),
  item_count: z.number(),
})

export type Cart = z.infer<typeof CartSchema>

export const CartItemPayloadSchema = z.object({
  variant_id: z.number().int(),
  qty: z.number().int().min(1).max(MAX_QTY_PER_LINE),
})

export type CartItemPayload = z.infer<typeof CartItemPayloadSchema>

export const CartQtyPayloadSchema = z.object({
  qty: z.number().int().min(1).max(MAX_QTY_PER_LINE),
})

export type CartQtyPayload = z.infer<typeof CartQtyPayloadSchema>
