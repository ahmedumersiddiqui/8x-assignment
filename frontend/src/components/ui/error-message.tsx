import { ErrorIcon, IconSize } from '@/components/icons'

import { Button } from './button'
import { Text } from './text'

export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="border border-line bg-white p-6" role="alert">
      <Text size="lg" tone="danger" className="mb-2 flex items-center gap-2">
        <ErrorIcon size={IconSize.md} aria-hidden="true" />
        Something went wrong
      </Text>
      <Text tone="muted" className="mb-4">
        {message}
      </Text>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
