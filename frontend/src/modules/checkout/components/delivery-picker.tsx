import { Text } from '@/components/ui/text'
import type { DeliveryOption } from '@/schemas/order'

import { DELIVERY_CHOICES } from '../constants'

export function DeliveryPicker({
  value,
  estimate,
  disabled,
  onChange,
}: {
  value: DeliveryOption
  estimate?: string
  disabled: boolean
  onChange: (option: DeliveryOption) => void
}) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="mb-2 font-bold">Choose a delivery speed</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {DELIVERY_CHOICES.map((choice) => {
          const isActive = value === choice.value
          return (
            <label
              key={choice.value}
              className={`flex cursor-pointer gap-2 border p-3 transition-colors ${
                isActive ? 'border-teal bg-field' : 'border-line hover:bg-field'
              } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <input
                type="radio"
                name="delivery_option"
                value={choice.value}
                checked={isActive}
                disabled={disabled}
                onChange={() => onChange(choice.value)}
                className="mt-0.5 accent-teal"
              />
              <span className="min-w-0">
                <Text as="span" bold className="block">
                  {choice.label}
                </Text>
                {isActive && estimate ? (
                  <Text as="span" size="sm" tone="success" className="block">
                    Arrives {estimate}
                  </Text>
                ) : (
                  <Text as="span" size="sm" tone="muted" className="block">
                    {choice.note}
                  </Text>
                )}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
