import { z } from 'zod'

import { RegisterPayloadSchema } from '@/schemas/user'

/** The confirm field is a UI concern, so it lives with the screen, not in the API schema. */
export const RegisterFormSchema = RegisterPayloadSchema.extend({
  confirmPassword: z.string(),
}).refine((values) => values.password === values.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type RegisterFormValues = z.infer<typeof RegisterFormSchema>
