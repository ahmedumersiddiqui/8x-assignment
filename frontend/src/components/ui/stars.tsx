import { IconSize, StarIcon } from '@/components/icons'

const STARS = [0, 1, 2, 3, 4]
const ROW_WIDTH = STARS.length * IconSize.sm

export function Stars({
  rating,
  count,
  showValue = false,
}: {
  rating: number
  count?: number
  showValue?: boolean
}) {
  const percent = (rating / 5) * 100

  return (
    <span className="flex items-center gap-1">
      {showValue && <span className="text-sm">{rating.toFixed(1)}</span>}
      <span
        className="relative inline-block h-4 shrink-0"
        style={{ width: ROW_WIDTH }}
        role="img"
        aria-label={`${rating} out of 5 stars`}
      >
        <StarRow className="text-line" />
        <span className="absolute inset-0 overflow-hidden" style={{ width: `${percent}%` }}>
          <StarRow className="text-star" />
        </span>
      </span>
      {count !== undefined && (
        <span className="text-sm text-link">{count.toLocaleString('en-US')}</span>
      )}
    </span>
  )
}

function StarRow({ className }: { className: string }) {
  return (
    <span className={`flex ${className}`} aria-hidden="true">
      {STARS.map((index) => (
        <StarIcon key={index} size={IconSize.sm} className="shrink-0 fill-current" strokeWidth={0} />
      ))}
    </span>
  )
}
