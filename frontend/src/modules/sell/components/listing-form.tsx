import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { FormProvider, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { TextAreaField, TextField } from '@/components/ui/text-field'
import { categoriesQuery } from '@/hooks/use-categories-query'
import { useCreateListingMutation } from '@/hooks/use-store-mutations'
import { useUploadPolicyQuery } from '@/hooks/use-stores-query'
import type { ListingFormValues } from '@/schemas/store'
import { ListingFormSchema } from '@/schemas/store'
import { getAPIErrorMessage } from '@/utils/api'

import { EMPTY_LISTING, LISTING_HELP } from '../constants'
import { buildListingPayload } from '../payload'
import { BulletRows } from './bullet-rows'
import { CategorySelect } from './category-select'
import { ImageUploader } from './image-uploader'
import { UploadsUnavailable } from './uploads-unavailable'
import { VariantRows } from './variant-rows'

export function ListingForm({ storeId }: { storeId: number }) {
  const navigate = useNavigate()
  const { data: categories } = useQuery(categoriesQuery())
  const { data: policy } = useUploadPolicyQuery()
  const create = useCreateListingMutation(storeId)

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(ListingFormSchema),
    defaultValues: EMPTY_LISTING,
  })

  const onSubmit = form.handleSubmit((values) =>
    create.mutate(buildListingPayload(values), {
      onSuccess: () =>
        void navigate({ to: '/sell/$storeId', params: { storeId: String(storeId) } }),
    }),
  )

  const isPending = create.isPending

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="border border-line bg-white p-4 sm:p-6">
        {policy && !policy.configured && <UploadsUnavailable />}

        <TextField
          label="Title"
          hint={LISTING_HELP.title}
          maxLength={300}
          disabled={isPending}
          error={form.formState.errors.title?.message}
          {...form.register('title')}
        />

        <div className="grid gap-x-4 sm:grid-cols-2">
          <TextField
            label="Brand"
            maxLength={120}
            disabled={isPending}
            error={form.formState.errors.brand?.message}
            {...form.register('brand')}
          />
          <CategorySelect categories={categories} disabled={isPending} />
        </div>

        <TextAreaField
          label="Description"
          maxLength={4000}
          rows={5}
          disabled={isPending}
          error={form.formState.errors.description?.message}
          {...form.register('description')}
        />

        <BulletRows disabled={isPending} />
        <VariantRows disabled={isPending} />
        <ImageUploader storeId={storeId} policy={policy} disabled={isPending} />

        <div className="flex items-center gap-3 border-t border-line pt-4">
          <Button
            type="submit"
            isPending={isPending}
            pendingLabel="Publishing..."
            disabled={isPending || !policy?.configured}
          >
            Publish listing
          </Button>
          <Button
            variant="secondary"
            disabled={isPending}
            onClick={() =>
              void navigate({ to: '/sell/$storeId', params: { storeId: String(storeId) } })
            }
          >
            Cancel
          </Button>
        </div>

        <Text size="xs" tone="muted" className="mt-2">
          The listing goes live in the catalogue straight away.
        </Text>

        {create.isError && (
          <Text size="sm" tone="danger" role="alert" className="mt-2">
            {getAPIErrorMessage(create.error, 'Could not publish that listing.')}
          </Text>
        )}
      </form>
    </FormProvider>
  )
}
