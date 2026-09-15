import { ProductTile } from '@/components/product-tile'
import { Container } from '@/components/ui/container'
import { useCategoriesQuery } from '@/hooks/use-categories-query'
import { useProductsQuery } from '@/hooks/use-products-query'

import { CategoryCard } from './components/category-card'
import { HOME_CATEGORY_COUNT, HOME_FEATURED_COUNT, HOME_SEARCH } from './constants'

export function Home() {
  const { data: categories } = useCategoriesQuery()
  const { data: featured } = useProductsQuery(HOME_SEARCH)

  return (
    <Container className="py-4">
      <section className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.slice(0, HOME_CATEGORY_COUNT).map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </section>

      <section className="bg-white p-5">
        <h2 className="mb-4 text-xl">Top rated right now</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {featured.items.slice(0, HOME_FEATURED_COUNT).map((product) => (
            <ProductTile key={product.id} product={product} />
          ))}
        </div>
      </section>
    </Container>
  )
}
