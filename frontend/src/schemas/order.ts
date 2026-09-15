import { z } from 'zod'

export const DeliveryOptions = {
  Express: 'express',
  Standard: 'standard',
} as const

export type DeliveryOption = (typeof DeliveryOptions)[keyof typeof DeliveryOptions]

export const AddressSchema = z.object({
  name: z.string().min(1).max(120),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).nullable().optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postal_code: z.string().min(3).max(20),
  country: z.string().length(2).default('US'),
  phone: z.string().min(5).max(30),
})

export type Address = z.infer<typeof AddressSchema>

export const CheckoutPayloadSchema = z.object({
  address: AddressSchema,
  delivery_option: z.enum(DeliveryOptions),
  idempotency_key: z.string().min(8).max(64),
})

export type CheckoutPayload = z.infer<typeof CheckoutPayloadSchema>

/** What checkout will charge, quoted by the server. The client never does this arithmetic. */
export const TotalsSchema = z.object({
  item_count: z.number(),
  subtotal_cents: z.number(),
  shipping_cents: z.number(),
  tax_cents: z.number(),
  total_cents: z.number(),
  delivery_estimate: z.string(),
})

export type Totals = z.infer<typeof TotalsSchema>

export const OrderLineSchema = z.object({
  variant_id: z.number(),
  qty: z.number(),
  unit_price_cents: z.number(),
  title_snapshot: z.string(),
  image_snapshot: z.string().nullable(),
  slug_snapshot: z.string(),
})

export type OrderLine = z.infer<typeof OrderLineSchema>

export const OrderSchema = z.object({
  id: z.number(),
  status: z.string(),
  subtotal_cents: z.number(),
  shipping_cents: z.number(),
  tax_cents: z.number(),
  total_cents: z.number(),
  address_snapshot: z.record(z.string(), z.unknown()),
  delivery_option: z.string(),
  delivery_estimate: z.string(),
  placed_at: z.string(),
  items: z.array(OrderLineSchema),
})

export type Order = z.infer<typeof OrderSchema>

export const readAddress = (snapshot: Record<string, unknown>): Address | null => {
  const parsed = AddressSchema.safeParse(snapshot)
  return parsed.success ? parsed.data : null
}

export const OrdersSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
})

export type OrdersSearch = z.infer<typeof OrdersSearchSchema>
