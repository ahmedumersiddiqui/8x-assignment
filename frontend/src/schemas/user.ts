import { z } from 'zod'

export const UserSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  is_prime: z.boolean(),
})

export type User = z.infer<typeof UserSchema>

export const CredentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(72),
})

export type Credentials = z.infer<typeof CredentialsSchema>

export const RegisterPayloadSchema = CredentialsSchema.extend({
  name: z.string().min(1).max(120),
})

export type RegisterPayload = z.infer<typeof RegisterPayloadSchema>
