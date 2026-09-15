import { DeleteIcon, IconSize, MinusIcon, PlusIcon } from '@/components/icons'

const STEP = 'flex h-8 w-9 items-center justify-center text-ink transition-colors hover:bg-field disabled:cursor-not-allowed disabled:text-line disabled:hover:bg-transparent'

export function QtyStepper({
  value,
  max,
  label,
  isBusy = false,
  onChange,
  onRemove,
}: {
  value: number
  max: number
  label: string
  isBusy?: boolean
  onChange: (qty: number) => void
  onRemove?: () => void
}) {
  const atMin = value <= 1
  const removes = atMin && onRemove !== undefined

  return (
    <div
      className={`inline-flex items-center rounded-[100vw] border border-line bg-white shadow-[0_2px_5px_rgba(15,17,17,0.15)] ${
        isBusy ? 'opacity-60' : ''
      }`}
    >
      <button
        type="button"
        disabled={isBusy || (atMin && !removes)}
        onClick={() => (removes ? onRemove() : onChange(value - 1))}
        aria-label={removes ? `Remove ${label}` : `Decrease ${label}`}
        className={`${STEP} rounded-l-[100vw] ${removes ? 'text-link' : ''}`}
      >
        {removes ? (
          <DeleteIcon size={IconSize.sm} aria-hidden="true" />
        ) : (
          <MinusIcon size={IconSize.sm} aria-hidden="true" />
        )}
      </button>

      <span
        aria-live="polite"
        aria-label={`${label}: ${value}`}
        className="min-w-9 border-x border-line px-1 text-center leading-8"
      >
        {value}
      </span>

      <button
        type="button"
        disabled={isBusy || value >= max}
        onClick={() => onChange(value + 1)}
        aria-label={`Increase ${label}`}
        className={`${STEP} rounded-r-[100vw]`}
      >
        <PlusIcon size={IconSize.sm} aria-hidden="true" />
      </button>
    </div>
  )
}
