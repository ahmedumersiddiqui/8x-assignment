import { Stars } from '@/components/ui/stars'
import { Text } from '@/components/ui/text'
import type { RatingSummary } from '@/schemas/review'
import { RATING_STARS } from '@/schemas/review'

export function RatingHistogram({
  summary,
  activeRating,
  onFilter,
}: {
  summary: RatingSummary
  activeRating?: number
  onFilter: (rating: number | undefined) => void
}) {
  return (
    <div className="lg:w-[280px] lg:shrink-0">
      <div className="mb-2 flex items-center gap-2">
        <Stars rating={summary.average} />
        <Text as="span" size="lg">
          {summary.average} out of 5
        </Text>
      </div>
      <Text size="sm" tone="muted" className="mb-3">
        {summary.count.toLocaleString('en-US')} global ratings
      </Text>

      {RATING_STARS.map((star) => {
        const count = summary.histogram[String(star)] ?? 0
        const percent = summary.count ? Math.round((count / summary.count) * 100) : 0
        const isActive = activeRating === star
        return (
          <button
            key={star}
            type="button"
            aria-pressed={isActive}
            onClick={() => onFilter(isActive ? undefined : star)}
            className="flex w-full items-center gap-2 py-0.5 text-left text-sm hover:underline"
          >
            <span className={`w-12 shrink-0 text-link ${isActive ? 'font-bold' : ''}`}>
              {star} star
            </span>
            <span className="h-4 flex-1 border border-line bg-field">
              <span className="block h-full bg-star" style={{ width: `${percent}%` }} />
            </span>
            <span className="w-10 shrink-0 text-right text-muted">{percent}%</span>
          </button>
        )
      })}
    </div>
  )
}
