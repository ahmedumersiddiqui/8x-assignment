import { Link } from '@tanstack/react-router'

import { PAGE_GAP, PaginationClass, pageWindow } from './constants'

type PaginationProps = {
  page: number
  total: number
  pageSize: number
  /** Supply this for pagination that is local state; omit it for URL-driven search paging. */
  onPageChange?: (page: number) => void
  label?: string
}

export function Pagination({
  page,
  total,
  pageSize,
  onPageChange,
  label = 'Pagination',
}: PaginationProps) {
  const pages = Math.ceil(total / pageSize)
  if (pages <= 1) return null

  const step = (target: number) => (
    <Step key={`step-${target}`} page={target} onPageChange={onPageChange} isCurrent={false}>
      {target < page ? 'Previous' : 'Next'}
    </Step>
  )

  return (
    <nav aria-label={label} className="my-4 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? step(page - 1) : <Disabled>Previous</Disabled>}

      {pageWindow(page, pages).map((entry, index) =>
        entry === PAGE_GAP ? (
          <span key={`gap-${index}`} aria-hidden="true" className="px-1 text-muted">
            &hellip;
          </span>
        ) : (
          <Step key={entry} page={entry} onPageChange={onPageChange} isCurrent={entry === page}>
            {entry}
          </Step>
        ),
      )}

      {page < pages ? step(page + 1) : <Disabled>Next</Disabled>}
    </nav>
  )
}

function Step({
  page,
  isCurrent,
  onPageChange,
  children,
}: {
  page: number
  isCurrent: boolean
  onPageChange?: (page: number) => void
  children: React.ReactNode
}) {
  const className = isCurrent ? PaginationClass.current : PaginationClass.item
  const isNumbered = typeof children === 'number'
  const describe = isNumbered ? `Go to page ${page}` : `${String(children)}, page ${page}`

  if (onPageChange) {
    return (
      <button
        type="button"
        onClick={() => onPageChange(page)}
        aria-current={isCurrent ? 'page' : undefined}
        aria-label={describe}
        className={className}
      >
        {children}
      </button>
    )
  }

  return (
    <Link
      to="/s"
      search={(old) => ({ ...old, page })}
      aria-current={isCurrent ? 'page' : undefined}
      aria-label={describe}
      className={`${className} hover:no-underline`}
    >
      {children}
    </Link>
  )
}

function Disabled({ children }: { children: React.ReactNode }) {
  return (
    <span aria-hidden="true" className={PaginationClass.disabled}>
      {children}
    </span>
  )
}
