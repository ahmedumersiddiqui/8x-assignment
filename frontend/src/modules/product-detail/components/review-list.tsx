import { Stars } from '@/components/ui/stars'
import { Text } from '@/components/ui/text'
import type { Review } from '@/schemas/review'
import { formatDate } from '@/utils/format'

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <Text tone="muted" className="py-6">
        No reviews match that filter yet.
      </Text>
    )
  }

  return (
    <ul>
      {reviews.map((review) => (
        <li key={review.id} className="border-b border-line py-4 last:border-b-0">
          <Text size="sm" bold className="mb-1">
            {review.author_name || 'Anonymous'}
            {review.is_mine && <span className="ml-2 font-normal text-teal">Your review</span>}
          </Text>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Stars rating={review.rating} />
            {review.title && <Text as="span" bold>{review.title}</Text>}
          </div>
          <Text size="sm" tone="muted" className="mb-1">
            Reviewed on {formatDate(review.created_at)}
            {review.verified_purchase && (
              <span className="ml-2 text-deal">Verified Purchase</span>
            )}
          </Text>
          {review.body && <Text>{review.body}</Text>}
        </li>
      ))}
    </ul>
  )
}
