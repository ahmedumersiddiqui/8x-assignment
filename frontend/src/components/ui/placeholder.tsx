import { Link } from '@tanstack/react-router'

import { Container } from './container'
import { Text } from './text'

export function Placeholder({ title }: { title: string }) {
  return (
    <Container className="py-16">
      <div className="bg-white p-10 text-center">
        <Text as="h1" size="2xl" className="mb-2">
          {title}
        </Text>
        <Text tone="muted" className="mb-6">
          This screen is not built yet.
        </Text>
        <Link to="/">Back to the home page</Link>
      </div>
    </Container>
  )
}
