import { Link } from '@tanstack/react-router'

import { Text } from '@/components/ui/text'
import type { Category } from '@/schemas/category'

import { HOME_CHILDREN_PER_CATEGORY } from '../constants'

export function CategoryCard({ category }: { category: Category }) {
  const children = category.children.slice(0, HOME_CHILDREN_PER_CATEGORY)

  return (
    <section className="flex flex-col bg-white p-5" aria-labelledby={`dept-${category.id}`}>
      <h2 id={`dept-${category.id}`} className="mb-3 text-lg sm:text-xl">
        {category.name}
      </h2>

      <ul className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3">
        {children.map((child) => (
          <li key={child.id}>
            <Link
              to="/s"
              search={{ category: child.slug, page: 1 }}
              className="group block text-ink hover:no-underline"
            >
              <span className="block aspect-square w-full overflow-hidden bg-page">
                {child.image && (
                  <img
                    src={child.image}
                    alt=""
                    width={180}
                    height={180}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                )}
              </span>
              <Text as="span" size="sm" className="mt-1 block group-hover:text-teal">
                {child.name}
              </Text>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
