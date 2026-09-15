import { useRef } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { useImageUpload } from '@/hooks/use-image-upload'
import type { ListingFormValues, UploadPolicy } from '@/schemas/store'
import { formatImageTypes, formatMegabytes } from '@/utils/format'

export function ImageUploader({
  storeId,
  policy,
  disabled,
}: {
  storeId: number
  policy: UploadPolicy | undefined
  disabled?: boolean
}) {
  const fileInput = useRef<HTMLInputElement>(null)
  const {
    control,
    formState: { errors },
  } = useFormContext<ListingFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: 'images' })
  const { upload, isUploading, error } = useImageUpload(storeId, policy)

  const maxImages = policy?.max_images ?? 0
  const remaining = maxImages - fields.length
  const canAdd = Boolean(policy?.configured) && remaining > 0 && !disabled

  const onPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])]
    event.target.value = ''
    if (files.length === 0) return
    const uploaded = await upload(files, remaining)
    uploaded.forEach((image) => append(image))
  }

  return (
    <fieldset className="mb-4 border-0 p-0">
      <legend className="mb-1 font-bold">Photos</legend>
      <Text size="xs" tone="muted" className="mb-2">
        {policy
          ? `Up to ${policy.max_images} images, ${formatMegabytes(policy.max_bytes)} each. ${formatImageTypes(policy.allowed_types)}. The first one is the main image.`
          : 'Loading upload limits...'}
      </Text>

      {fields.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-3">
          {fields.map((field, index) => (
            <li key={field.id} className="relative">
              <img
                src={field.url}
                alt={index === 0 ? 'Main listing photo' : `Listing photo ${index + 1}`}
                width={96}
                height={96}
                loading="lazy"
                className="h-24 w-24 border border-line bg-white object-contain"
              />
              {index === 0 && (
                <span className="absolute left-0 top-0 bg-nav px-1 text-[10px] text-white">
                  Main
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={disabled}
                className="mt-1 block w-full text-xs text-link underline hover:text-deal disabled:opacity-60"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={fileInput}
        type="file"
        multiple
        accept={policy?.allowed_types.join(',')}
        onChange={onPick}
        disabled={!canAdd || isUploading}
        className="sr-only"
        aria-label="Add listing photos"
      />
      <Button
        variant="outline"
        onClick={() => fileInput.current?.click()}
        disabled={!canAdd || isUploading}
        isPending={isUploading}
        pendingLabel="Uploading..."
      >
        {fields.length === 0 ? 'Add photos' : `Add more (${remaining} left)`}
      </Button>

      {remaining <= 0 && policy && (
        <Text size="xs" tone="muted" className="mt-2">
          That is the maximum of {policy.max_images} photos. Remove one to swap it out.
        </Text>
      )}
      {error && (
        <Text size="sm" tone="danger" role="alert" className="mt-2">
          {error}
        </Text>
      )}
      {errors.images?.message && (
        <Text size="sm" tone="danger" className="mt-2">
          {errors.images.message}
        </Text>
      )}
    </fieldset>
  )
}
