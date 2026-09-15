import { ButtonVariant, PENDING_LABEL } from './constants'

type Variant = keyof typeof ButtonVariant

const DISABLED = 'disabled:cursor-not-allowed disabled:opacity-60'

export const buttonClass = (variant: Variant = 'primary', className = '') =>
  `inline-flex items-center justify-center gap-2 ${ButtonVariant[variant]} ${className}`

type ButtonProps = {
  variant?: Variant
  isPending?: boolean
  pendingLabel?: string
  fullWidth?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  variant = 'primary',
  isPending = false,
  pendingLabel = PENDING_LABEL,
  fullWidth = false,
  type = 'button',
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled ?? isPending}
      className={buttonClass(variant, `${fullWidth ? 'w-full' : ''} ${DISABLED} ${className}`)}
      {...rest}
    >
      {isPending ? pendingLabel : children}
    </button>
  )
}
