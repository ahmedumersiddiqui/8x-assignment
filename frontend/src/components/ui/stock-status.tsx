import { Text } from './text'

export function StockStatus({
  inStock,
  size = 'sm',
}: {
  inStock: boolean
  size?: 'sm' | 'base' | 'lg'
}) {
  return inStock ? (
    <Text as="span" size={size} tone="success">
      In Stock
    </Text>
  ) : (
    <Text as="span" size={size} tone="danger">
      Currently unavailable
    </Text>
  )
}
