import { ExpandIcon, IconSize } from '@/components/icons'

type Option = { value: string | number; label: string }

type SelectProps = {
  label: string
  options: Option[]
  hideLabel?: boolean
  className?: string
} & React.SelectHTMLAttributes<HTMLSelectElement>

export function Select({
  label,
  options,
  hideLabel = false,
  className = '',
  disabled,
  ...rest
}: SelectProps) {
  return (
    <label className={`flex items-center gap-2 text-sm ${disabled ? 'opacity-60' : ''}`}>
      <span className={hideLabel ? 'sr-only' : 'whitespace-nowrap text-muted'}>{label}</span>
      {/* min-w keeps the chosen option readable when a flex parent tries to squeeze it to
          nothing, which is what turned this into an empty box at phone width. */}
      <span className="relative inline-flex">
        <select
          aria-label={hideLabel ? label : undefined}
          disabled={disabled}
          className={`w-full min-w-28 cursor-pointer appearance-none border border-field-line bg-gradient-to-b from-white to-field py-1.5 pl-3 pr-8 text-ink shadow-[0_1px_2px_rgba(15,17,17,0.08)] transition-colors hover:to-line focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/40 disabled:cursor-not-allowed ${className}`}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ExpandIcon
          size={IconSize.sm}
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted"
        />
      </span>
    </label>
  )
}
