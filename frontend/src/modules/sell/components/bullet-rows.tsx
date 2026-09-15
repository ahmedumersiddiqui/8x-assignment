import { useFieldArray, useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { TextField } from '@/components/ui/text-field'
import type { ListingFormValues } from '@/schemas/store'

import { LISTING_HELP, MAX_BULLETS } from '../constants'

export function BulletRows({ disabled }: { disabled?: boolean }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<ListingFormValues>()
  const { fields, append, remove } = useFieldArray<ListingFormValues>({ name: 'bullets' })

  return (
    <fieldset className="mb-4 border-0 p-0">
      <legend className="mb-1 font-bold">About this item</legend>
      <Text size="xs" tone="muted" className="mb-2">
        {LISTING_HELP.bullets}
      </Text>

      <ul>
        {fields.map((field, index) => (
          <li key={field.id} className="flex items-start gap-2">
            <div className="flex-1">
              <TextField
                label={`Bullet ${index + 1}`}
                maxLength={200}
                disabled={disabled}
                error={errors.bullets?.[index]?.text?.message}
                {...register(`bullets.${index}.text`)}
              />
            </div>
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={disabled}
                aria-label={`Remove bullet ${index + 1}`}
                className="mt-7 text-sm text-link underline hover:text-deal disabled:opacity-60"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

      {fields.length < MAX_BULLETS && (
        <Button variant="outline" onClick={() => append({ text: '' })} disabled={disabled}>
          Add a bullet
        </Button>
      )}
    </fieldset>
  )
}
