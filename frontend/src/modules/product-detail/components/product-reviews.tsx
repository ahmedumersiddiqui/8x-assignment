import { useState } from 'react'

import { Loading } from '@/components/ui/loading'
import { Pagination } from '@/components/ui/pagination'
import { Text } from '@/components/ui/text'
import { useReviewsQuery } from '@/hooks/use-reviews-query'

import { RatingHistogram } from './rating-histogram'
import { ReviewForm } from './review-form'
import { ReviewList } from './review-list'

export function ProductReviews({ slug }: { slug: string }) {
  const [rating, setRating] = useState<number | undefined>(undefined)
  const [page, setPage] = useState(1)
  const { data, isPending, isPlaceholderData } = useReviewsQuery(slug, rating, page)

  const filterBy = (next: number | undefined) => {
    setRating(next)
    setPage(1)
  }

  return (
    <section className="mt-4 bg-white p-5" aria-labelledby="reviews-heading">
      <Text as="h2" size="xl" id="reviews-heading" className="mb-4">
        Customer reviews
      </Text>

      {isPending && !data ? (
        <Loading label="Loading reviews" />
      ) : (
        data && (
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="lg:w-[280px] lg:shrink-0">
              <RatingHistogram summary={data.summary} activeRating={rating} onFilter={filterBy} />
              <div className="mt-6">
                <ReviewForm slug={slug} mine={data.mine} />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <Text as="h3" size="lg" className="mb-2">
                {rating ? `${rating}-star reviews` : 'Top reviews'}
              </Text>
              <div aria-busy={isPlaceholderData} className={isPlaceholderData ? 'opacity-60' : ''}>
                <ReviewList reviews={data.items} />
              </div>
              <Pagination
                page={data.page}
                total={data.total}
                pageSize={data.page_size}
                onPageChange={setPage}
                label="Reviews pagination"
              />
            </div>
          </div>
        )
      )}
    </section>
  )
}
