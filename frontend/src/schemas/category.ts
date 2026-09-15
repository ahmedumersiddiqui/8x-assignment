import { z } from 'zod'

export type Category = {
  id: number
  name: string
  slug: string
  image: string | null
  children: Category[]
}

export const CategorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    image: z.string().nullable(),
    children: z.array(CategorySchema),
  }),
)

export const CategoryListSchema = z.array(CategorySchema)
