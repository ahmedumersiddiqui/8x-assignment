import { useFieldArray, useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { TextField } from '@/components/ui/text-field'
import type { ListingFormValues } from '@/schemas/store'

import { EMPTY_VARIANT, LISTING_HELP, MAX_VARIANTS } from '../constants'

/** The variation selector, from the seller's side. One axis named once, then a row per
 *  choice -- which is how the buy box will render it. */
export function VariantRows({ disabled }: { disabled?: boolean }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<ListingFormValues>()
  const { fields, append, remove } = useFieldArray<ListingFormValues>({ name: 'variants' })

  const isSingle = fields.length === 1

  return (
    <fieldset className="mb-4 border-0 p-0">
      <legend className="mb-1 font-bold">Price and options</legend>

      <div className="max-w-xs">
        <TextField
          label="Option name"
          placeholder="Size"
          hint={LISTING_HELP.option}
          disabled={disabled}
          error={errors.option_name?.message}
          {...register('option_name')}
        />
      </div>

      <ul className="mb-2">
        {fields.map((field, index) => (
          <li key={field.id} className="border-t border-line pt-3">
            <div className="grid gap-x-3 sm:grid-cols-4">
              <TextField
                label={index === 0 ? 'Option value' : `Option value ${index + 1}`}
                placeholder="Small"
                disabled={disabled}
                error={errors.variants?.[index]?.option_value?.message}
                {...register(`variants.${index}.option_value`)}
              />
              <TextField
                label="Price"
                inputMode="decimal"
                placeholder="24.99"
                disabled={disabled}
                error={errors.variants?.[index]?.price?.message}
                {...register(`variants.${index}.price`)}
              />
              <TextField
                label="Was price"
                inputMode="decimal"
                placeholder="Optional"
                disabled={disabled}
                error={errors.variants?.[index]?.list_price?.message}
                {...register(`variants.${index}.list_price`)}
              />
              <TextField
                label="Stock"
                type="number"
                min={0}
                step={1}
                disabled={disabled}
                error={errors.variants?.[index]?.stock?.message}
                {...register(`variants.${index}.stock`)}
              />
            </div>
            {!isSingle && (
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={disabled}
                className="mb-3 text-sm text-link underline hover:text-deal disabled:opacity-60"
              >
                Remove this option
              </button>
            )}
          </li>
        ))}
      </ul>

      {fields.length < MAX_VARIANTS && (
        <Button
          variant="outline"
          onClick={() => append({ ...EMPTY_VARIANT })}
          disabled={disabled}
        >
          Add another option
        </Button>
      )}

      {errors.variants?.root?.message && (
        <Text size="sm" tone="danger" className="mt-2">
          {errors.variants.root.message}
        </Text>
      )}
    </fieldset>
  )
}
