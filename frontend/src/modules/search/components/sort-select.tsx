import { Select } from '@/components/ui/select'
import type { Sort } from '@/constants/sort'
import { SortLabels, SortOptions } from '@/constants/sort'

const OPTIONS = Object.entries(SortLabels).map(([value, label]) => ({ value, label }))

export function SortSelect({
  value,
  onChange,
}: {
  value: Sort | undefined
  onChange: (sort: Sort) => void
}) {
  return (
    <Select
      label="Sort by:"
      options={OPTIONS}
      value={value ?? SortOptions.Featured}
      onChange={(event) => onChange(event.target.value as Sort)}
    />
  )
}
