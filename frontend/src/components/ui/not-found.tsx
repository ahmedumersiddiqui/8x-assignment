import { Link } from '@tanstack/react-router'

import { Container } from './container'
import { Text } from './text'

export function NotFound() {
  return (
    <Container className="py-16 text-center">
      <Text as="h1" size="2xl" className="mb-2">
        We couldn&rsquo;t find that page
      </Text>
      <Text tone="muted" className="mb-6">
        The link may be broken, or the product may no longer be available.
      </Text>
      <Link to="/">Go to the home page</Link>
    </Container>
  )
}
