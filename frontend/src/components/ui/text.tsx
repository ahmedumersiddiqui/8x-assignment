import { TextSize, TextTone } from './constants'

type TextProps = {
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'dt' | 'dd' | 'legend' | 'label'
  size?: keyof typeof TextSize
  tone?: keyof typeof TextTone
  bold?: boolean
  className?: string
  children: React.ReactNode
} & React.HTMLAttributes<HTMLElement> &
  Pick<React.LabelHTMLAttributes<HTMLLabelElement>, 'htmlFor'>

export function Text({
  as: Tag = 'p',
  size = 'base',
  tone = 'default',
  bold = false,
  className = '',
  children,
  ...rest
}: TextProps) {
  return (
    <Tag
      className={`${TextSize[size]} ${TextTone[tone]} ${bold ? 'font-bold' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}
