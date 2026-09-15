import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { TextAreaField, TextField } from '@/components/ui/text-field'
import { LOGIN_PATH } from '@/constants/routes'
import { useAccountQuery } from '@/hooks/use-account-query'
import { useWriteReviewMutation } from '@/hooks/use-review-mutation'
import type { Review } from '@/schemas/review'
import { ReviewPayloadSchema } from '@/schemas/review'
import { getAPIErrorMessage } from '@/utils/api'

import { StarRatingInput } from './star-rating-input'

export function ReviewForm({ slug, mine }: { slug: string; mine: Review | null }) {
  const { data: user } = useAccountQuery()
  const write = useWriteReviewMutation(slug)
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ReviewPayloadSchema),
    defaultValues: {
      rating: mine?.rating ?? 0,
      title: mine?.title ?? '',
      body: mine?.body ?? '',
    },
  })

  const rating = watch('rating')

  if (!user) {
    return (
      <div className="border border-line p-4">
        <Text className="mb-2">Share your thoughts with other customers</Text>
        <Link to={LOGIN_PATH} search={{ redirect: `/p/${slug}` }}>
          Sign in to write a review
        </Link>
      </div>
    )
  }

  return (
    <form
      className="border border-line p-4"
      onSubmit={handleSubmit((values) => write.mutate(values))}
      noValidate
    >
      <Text as="h3" size="lg" className="mb-2">
        {mine ? 'Update your review' : 'Write a review'}
      </Text>

      {/* The stars are a radio group, not an input react-hook-form can register, so the
          field is driven through a Controller instead. */}
      <Controller
        control={control}
        name="rating"
        render={({ field }) => (
          <StarRatingInput
            value={field.value}
            onChange={field.onChange}
            disabled={write.isPending}
          />
        )}
      />

      <div className="mt-3">
        <TextField
          label="Headline (optional)"
          maxLength={200}
          placeholder="What's most important to know?"
          disabled={write.isPending}
          error={errors.title?.message}
          {...register('title')}
        />
        <TextAreaField
          label="Review (optional)"
          maxLength={4000}
          placeholder="What did you like or dislike?"
          disabled={write.isPending}
          error={errors.body?.message}
          {...register('body')}
        />
      </div>

      <Button
        type="submit"
        disabled={rating === 0 || write.isPending}
        isPending={write.isPending}
        pendingLabel="Submitting..."
      >
        {mine ? 'Update review' : 'Submit review'}
      </Button>

      {rating === 0 && (
        <Text size="sm" tone="muted" className="mt-2">
          Pick a star rating to continue.
        </Text>
      )}
      {write.isSuccess && (
        <Text size="sm" tone="success" role="status" className="mt-2">
          Thanks — your review is live.
        </Text>
      )}
      {write.isError && (
        <Text size="sm" tone="danger" role="alert" className="mt-2">
          {getAPIErrorMessage(write.error, 'Could not save that review.')}
        </Text>
      )}
    </form>
  )
}
