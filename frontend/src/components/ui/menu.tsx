import { useEffect, useRef } from 'react'

export function Menu({
  label,
  trigger,
  children,
  className = '',
}: {
  label: string
  trigger: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDetailsElement>(null)

  const close = () => {
    if (ref.current) ref.current.open = false
  }

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current?.open && !ref.current.contains(event.target as Node)) close()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  return (
    <details
      ref={ref}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === 'Escape') close()
      }}
    >
      <summary aria-label={label} className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        {trigger}
      </summary>
      <div
        role="menu"
        onClick={close}
        className={`absolute right-0 top-full z-20 mt-1 min-w-[220px] border border-line bg-white py-2 text-ink shadow-[0_2px_8px_rgba(15,17,17,0.3)] ${className}`}
      >
        {children}
      </div>
    </details>
  )
}

export function MenuItem({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-1.5 hover:bg-field [&>*]:block [&>*]:w-full">{children}</div>
}
