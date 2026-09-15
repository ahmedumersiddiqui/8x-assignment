import { useQuery } from '@tanstack/react-query'

import { ProductTile } from '@/components/product-tile'
import { Text } from '@/components/ui/text'
import { productsQuery } from '@/hooks/use-products-query'

import { RECOMMENDED_COUNT, recommendedSearch } from '../constants'

export function RecommendedProducts({
  categorySlug,
  excludeId,
}: {
  categorySlug: string
  excludeId: number
}) {
  const { data } = useQuery(productsQuery(recommendedSearch(categorySlug)))

  const items = (data?.items ?? [])
    .filter((product) => product.id !== excludeId)
    .slice(0, RECOMMENDED_COUNT)

  if (items.length === 0) return null

  return (
    <section className="mt-4 bg-white p-5">
      <Text as="h2" size="xl" className="mb-4">
        Products related to this item
      </Text>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((product) => (
          <ProductTile key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
