import { z } from 'zod'

export const RATING_STARS = [5, 4, 3, 2, 1] as const

export const ReviewSchema = z.object({
  id: z.number(),
  rating: z.number(),
  title: z.string(),
  body: z.string(),
  author_name: z.string(),
  verified_purchase: z.boolean(),
  created_at: z.string(),
  is_mine: z.boolean(),
})

export type Review = z.infer<typeof ReviewSchema>

export const RatingSummarySchema = z.object({
  average: z.number(),
  count: z.number(),
  histogram: z.record(z.string(), z.number()),
})

export type RatingSummary = z.infer<typeof RatingSummarySchema>

export const ReviewPageSchema = z.object({
  items: z.array(ReviewSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
  summary: RatingSummarySchema,
  mine: ReviewSchema.nullable(),
})

export type ReviewPage = z.infer<typeof ReviewPageSchema>

export const ReviewPayloadSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).default(''),
  body: z.string().max(4000).default(''),
})

export type ReviewPayload = z.infer<typeof ReviewPayloadSchema>
