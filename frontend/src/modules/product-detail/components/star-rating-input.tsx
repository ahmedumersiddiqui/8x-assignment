import { IconSize, StarIcon } from '@/components/icons'
import { RATING_STARS } from '@/schemas/review'

const ASCENDING = [...RATING_STARS].reverse()

export function StarRatingInput({
  value,
  onChange,
  disabled = false,
}: {
  value: number
  onChange: (rating: number) => void
  disabled?: boolean
}) {
  return (
    <fieldset className="border-0 p-0" disabled={disabled}>
      <legend className="sr-only">Your rating</legend>
      <div className="flex gap-1">
        {ASCENDING.map((star) => (
          <label key={star} className="cursor-pointer">
            <input
              type="radio"
              name="rating"
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
              className="peer sr-only"
            />
            <StarIcon
              size={IconSize.lg}
              strokeWidth={1}
              aria-hidden="true"
              className={`transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-teal ${
                star <= value ? 'fill-star text-star' : 'fill-transparent text-line'
              }`}
            />
            <span className="sr-only">
              {star} {star === 1 ? 'star' : 'stars'}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
