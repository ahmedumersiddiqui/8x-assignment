import { z } from 'zod'
import type { ZodType } from 'zod'

export const createPageSchema = <T>(item: ZodType<T>) =>
  z.object({
    items: z.array(item),
    total: z.number(),
    page: z.number(),
    page_size: z.number(),
  })

export type Page<T> = {
  items: T[]
  total: number
  page: number
  page_size: number
}
