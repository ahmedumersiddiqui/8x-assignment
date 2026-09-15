import { Link, getRouteApi } from '@tanstack/react-router'
import { useState } from 'react'

import { Container } from '@/components/ui/container'
import { Stars } from '@/components/ui/stars'
import { Text } from '@/components/ui/text'
import { useProductQuery } from '@/hooks/use-product-query'

import { Breadcrumb } from './components/breadcrumb'
import { BuyBox } from './components/buy-box'
import { ProductGallery } from './components/product-gallery'
import { ProductReviews } from './components/product-reviews'
import { RecommendedProducts } from './components/recommended-products'
import { SpecTable } from './components/spec-table'
import { VariantSelector } from './components/variant-selector'
import { defaultVariant } from './select-variant'

const route = getRouteApi('/_shop/p/$slug')

export function ProductDetail() {
  const { slug } = route.useParams()
  const { data: product } = useProductQuery(slug)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const selected =
    product.variants.find((variant) => variant.id === selectedId) ??
    defaultVariant(product.variants)

  return (
    <Container className="py-4">
      <Breadcrumb categorySlug={product.category_slug} />

      <div className="grid gap-6 bg-white p-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)_300px]">
        <ProductGallery images={product.images} title={product.title} />

        <div className="min-w-0">
          <Text as="h1" size="2xl">
            {product.title}
          </Text>
          <Link to="/s" search={{ brand: [product.brand], page: 1 }} className="text-sm">
            Visit the {product.brand} store
          </Link>

          <div className="mt-2 flex items-center gap-2">
            <Stars rating={product.rating_avg} count={product.rating_count} />
            <Text as="span" size="sm" tone="muted">
              {product.rating_avg} out of 5
            </Text>
          </div>

          <hr className="my-4 border-line" />

          <div className="mb-4">
            <VariantSelector
              variants={product.variants}
              selectedId={selected.id}
              onSelect={setSelectedId}
            />
          </div>

          <Text tone="muted" className="mb-4">
            {product.description}
          </Text>

          {product.bullets.length > 0 && (
            <>
              <Text as="h2" size="lg" className="mb-2">
                About this item
              </Text>
              <ul className="mb-4 list-disc space-y-1 pl-5 text-sm">
                {product.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </>
          )}

          <Text as="h2" size="lg" className="mb-2">
            Product details
          </Text>
          <SpecTable specs={product.specs} />
        </div>

        <BuyBox
          variant={selected}
          deliveryEstimate={product.delivery_estimate}
          soldBy={product.sold_by}
          storeSlug={product.store_slug}
        />
      </div>

      <ProductReviews slug={slug} />

      <RecommendedProducts categorySlug={product.category_slug} excludeId={product.id} />
    </Container>
  )
}
