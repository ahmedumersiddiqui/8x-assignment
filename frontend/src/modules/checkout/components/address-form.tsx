import { useFormContext } from 'react-hook-form'

import { TextField } from '@/components/ui/text-field'
import type { Address } from '@/schemas/order'

import { ADDRESS_FIELDS } from '../constants'

/** Reads the form off context rather than taking a dozen props: the submit button and
 *  the totals panel live in the checkout screen, the fields live here. */
export function AddressForm({ disabled }: { disabled?: boolean }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<Address>()

  return (
    <div className="grid gap-x-4 sm:grid-cols-2">
      {ADDRESS_FIELDS.map((field) => (
        <div key={field.name} className={field.half ? '' : 'sm:col-span-2'}>
          <TextField
            label={field.label}
            autoComplete={field.autoComplete}
            disabled={disabled}
            error={errors[field.name]?.message}
            {...register(field.name)}
          />
        </div>
      ))}
    </div>
  )
}
