import { IconSize, SpinnerIcon } from '@/components/icons'

import { Text } from './text'

export function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <output className="flex items-center justify-center gap-2 p-8" aria-live="polite">
      <SpinnerIcon size={IconSize.md} className="animate-spin text-muted" aria-hidden="true" />
      <Text as="span" tone="muted">
        {label}...
      </Text>
    </output>
  )
}
