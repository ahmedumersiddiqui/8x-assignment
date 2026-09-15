import type { ErrorComponentProps } from '@tanstack/react-router'

import { getAPIErrorMessage } from '@/utils/api'

import { Container } from './container'
import { ErrorMessage } from './error-message'

export function RouteError({ error, reset }: ErrorComponentProps) {
  return (
    <Container className="py-10">
      <ErrorMessage message={getAPIErrorMessage(error)} onRetry={reset} />
    </Container>
  )
}
