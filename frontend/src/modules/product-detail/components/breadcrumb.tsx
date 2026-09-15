import { Link } from '@tanstack/react-router'

import { ForwardIcon, IconSize } from '@/components/icons'
import { useCategoriesQuery } from '@/hooks/use-categories-query'
import type { Category } from '@/schemas/category'

/** The department and subcategory a slug sits under, root first. Empty if it isn't in the tree. */
const trail = (tree: Category[], slug: string): Category[] => {
  for (const department of tree) {
    if (department.slug === slug) return [department]
    const child = department.children.find((node) => node.slug === slug)
    if (child) return [department, child]
  }
  return []
}

export function Breadcrumb({ categorySlug }: { categorySlug: string }) {
  const { data: categories } = useCategoriesQuery()
  const path = trail(categories, categorySlug)

  if (path.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-2">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-muted">
        {path.map((node, index) => (
          <li key={node.id} className="flex items-center gap-1">
            {index > 0 && (
              <ForwardIcon size={IconSize.sm} aria-hidden="true" className="text-line" />
            )}
            <Link to="/s" search={{ category: node.slug, page: 1 }} className="text-teal">
              {node.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}
