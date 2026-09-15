import { TooltipPlacement } from './constants'

export function Tooltip({
  label,
  placement = 'bottom',
  children,
}: {
  label: string
  placement?: keyof typeof TooltipPlacement
  children: React.ReactNode
}) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-10 whitespace-nowrap bg-ink px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 ${TooltipPlacement[placement]}`}
      >
        {label}
      </span>
    </span>
  )
}
