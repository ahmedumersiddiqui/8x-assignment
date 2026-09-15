import { useState } from 'react'

import { IconSize, LocationIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Text } from '@/components/ui/text'
import { useDeliveryLocation } from '@/hooks/use-delivery-location'
import { isPostalCode } from '@/utils/delivery-location'

import { DELIVERY_QUICK_PICKS, POSTAL_CODE_LENGTH } from '../constants'

const labelFor = (postalCode: string | null) => {
  if (!postalCode) return 'Select a location'
  const pick = DELIVERY_QUICK_PICKS.find((entry) => entry.postalCode === postalCode)
  return pick ? pick.label : postalCode
}

export function DeliverTo() {
  const { postalCode, setLocation } = useDeliveryLocation()
  const [isOpen, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  const apply = (value: string | null) => {
    setLocation(value)
    setOpen(false)
    setDraft('')
    setError('')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden shrink-0 items-end gap-1 px-2 py-1 text-left text-white hover:underline lg:flex"
      >
        <LocationIcon size={IconSize.sm} aria-hidden="true" className="mb-1" />
        <span>
          <span className="block text-xs text-line">Deliver to</span>
          <span className="block font-bold">{labelFor(postalCode)}</span>
        </span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        title="Choose your location"
        placement="center"
      >
        <div className="p-5">
          <Text size="sm" tone="muted" className="mb-4">
            Delivery dates are estimated from your ZIP code. Prices and availability do not change.
          </Text>

          <form
            className="mb-4 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              if (!isPostalCode(draft)) {
                setError(`Enter a ${POSTAL_CODE_LENGTH}-digit US ZIP code.`)
                return
              }
              apply(draft)
            }}
          >
            <label className="flex-1">
              <span className="sr-only">ZIP code</span>
              <input
                value={draft}
                inputMode="numeric"
                maxLength={POSTAL_CODE_LENGTH}
                placeholder="Enter a ZIP code"
                onChange={(event) => {
                  setDraft(event.target.value.replace(/\D/g, ''))
                  setError('')
                }}
                aria-invalid={error ? true : undefined}
                className={`w-full rounded-[3px] border px-2 py-1 ${
                  error ? 'border-deal' : 'border-field-line'
                }`}
              />
            </label>
            <Button type="submit">Apply</Button>
          </form>

          {error && (
            <Text size="sm" tone="danger" role="alert" className="mb-3">
              {error}
            </Text>
          )}

          <Text size="sm" bold className="mb-2">
            Or pick a city
          </Text>
          <ul className="mb-4 grid grid-cols-2 gap-2">
            {DELIVERY_QUICK_PICKS.map((pick) => (
              <li key={pick.postalCode}>
                <Button
                  variant={pick.postalCode === postalCode ? 'primary' : 'outline'}
                  fullWidth
                  onClick={() => apply(pick.postalCode)}
                >
                  {pick.label}
                </Button>
              </li>
            ))}
          </ul>

          {postalCode && (
            <Button variant="link" onClick={() => apply(null)}>
              Clear my location
            </Button>
          )}
        </div>
      </Modal>
    </>
  )
}
