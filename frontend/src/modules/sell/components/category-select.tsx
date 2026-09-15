import { useFormContext } from 'react-hook-form'
import { useId } from 'react'

import { Text } from '@/components/ui/text'
import type { Category } from '@/schemas/category'
import type { ListingFormValues } from '@/schemas/store'

export function CategorySelect({
  categories,
  disabled,
}: {
  categories: Category[] | undefined
  disabled?: boolean
}) {
  const fieldId = useId()
  const {
    register,
    formState: { errors },
  } = useFormContext<ListingFormValues>()
  const error = errors.category_slug?.message

  return (
    <p className="mb-3">
      <Text as="label" bold htmlFor={fieldId} className="mb-1 block">
        Category
      </Text>
      <select
        id={fieldId}
        disabled={disabled || !categories}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={`w-full rounded-[3px] border bg-white px-2 py-1 ${
          error ? 'border-deal' : 'border-field-line'
        }`}
        {...register('category_slug')}
      >
        <option value="">{categories ? 'Choose a category' : 'Loading categories...'}</option>
        {(categories ?? []).map((category) => (
          <optgroup key={category.id} label={category.name}>
            {category.children.map((child) => (
              <option key={child.id} value={child.slug}>
                {child.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {error && (
        <Text as="span" id={`${fieldId}-error`} size="xs" tone="danger" className="mt-1 block">
          {error}
        </Text>
      )}
    </p>
  )
}
