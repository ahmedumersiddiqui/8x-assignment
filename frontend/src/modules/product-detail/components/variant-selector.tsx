import type { Variant } from '@/schemas/product'
import { Text } from '@/components/ui/text'
import { formatPrice } from '@/utils/format'

const describe = (variant: Variant) => Object.values(variant.attrs).join(' / ')

export function VariantSelector({
  variants,
  selectedId,
  onSelect,
}: {
  variants: Variant[]
  selectedId: number
  onSelect: (variantId: number) => void
}) {
  if (variants.length < 2) return null
  const axis = Object.keys(variants[0].attrs)[0] ?? 'Option'

  return (
    <fieldset className="border-0 p-0">
      <Text as="legend" size="sm" tone="muted" className="mb-2">
        {axis}
      </Text>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedId
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelect(variant.id)}
              aria-pressed={isSelected}
              className={`border px-3 py-2 text-left text-sm ${
                isSelected ? 'border-teal ring-1 ring-teal' : 'border-line'
              } ${variant.stock === 0 ? 'text-muted line-through' : ''}`}
            >
              <span className="block">{describe(variant)}</span>
              <Text as="span" size="xs" tone="muted" className="block">
                {formatPrice(variant.price_cents)}
              </Text>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
