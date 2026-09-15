import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { TextField } from '@/components/ui/text-field'
import { useCreateStoreMutation } from '@/hooks/use-store-mutations'
import type { Store, StoreFormValues } from '@/schemas/store'
import { StoreFormSchema } from '@/schemas/store'
import { getAPIErrorMessage } from '@/utils/api'

export function StoreSetupForm({
  isFirstStore,
  onCreated,
}: {
  isFirstStore: boolean
  onCreated?: (store: Store) => void
}) {
  const create = useCreateStoreMutation()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(StoreFormSchema),
    defaultValues: { display_name: '' },
  })

  const onSubmit = handleSubmit((values) =>
    create.mutate(values, {
      onSuccess: (store) => {
        reset()
        onCreated?.(store)
      },
    }),
  )

  return (
    <form onSubmit={onSubmit} noValidate className="border border-line bg-white p-4 sm:p-6">
      <Text as="h2" size="lg" bold className="mb-1">
        {isFirstStore ? 'Open your store' : 'Open another store'}
      </Text>
      <Text tone="muted" size="sm" className="mb-4">
        {isFirstStore
          ? 'Every listing belongs to a store, so this comes first. The name is what shoppers see under "Sold by".'
          : 'Useful for keeping unrelated lines of business apart. Each store has its own listings.'}
      </Text>

      <div className="max-w-md">
        <TextField
          label="Store name"
          autoComplete="organization"
          placeholder="Fern &amp; Oak"
          disabled={create.isPending}
          error={errors.display_name?.message}
          {...register('display_name')}
        />
      </div>

      <Button type="submit" isPending={create.isPending} pendingLabel="Opening...">
        {isFirstStore ? 'Open my store' : 'Open store'}
      </Button>

      {create.isError && (
        <Text size="sm" tone="danger" role="alert" className="mt-2">
          {getAPIErrorMessage(create.error, 'Could not open that store.')}
        </Text>
      )}
    </form>
  )
}
