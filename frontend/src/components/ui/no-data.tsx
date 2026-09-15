import { Text } from './text'

export function NoData({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="border border-line bg-white p-10 text-center">
      <Text size="xl" className="mb-2">
        {title}
      </Text>
      <Text as="div" tone="muted">
        {children}
      </Text>
    </div>
  )
}
