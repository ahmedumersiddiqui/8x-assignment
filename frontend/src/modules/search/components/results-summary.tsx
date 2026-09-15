import { PAGE_SIZE } from '@/constants/settings'

export function ResultsSummary({
  page,
  total,
  query,
}: {
  page: number
  total: number
  query: string | undefined
}) {
  const first = (page - 1) * PAGE_SIZE + 1
  const last = Math.min(page * PAGE_SIZE, total)

  return (
    <p aria-live="polite">
      {total === 0 ? 'No results' : `${first}-${last} of ${total.toLocaleString('en-US')} results`}
      {query && (
        <>
          {' '}
          for &ldquo;<span className="text-deal">{query}</span>&rdquo;
        </>
      )}
    </p>
  )
}
