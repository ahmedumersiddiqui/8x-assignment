export function Container({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`mx-auto max-w-[1500px] px-4 ${className}`}>{children}</div>
}
