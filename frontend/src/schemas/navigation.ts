import { z } from 'zod'

/**
 * A post-sign-in destination is attacker-controlled by definition -- it arrives in a URL
 * anyone can hand out. Only a same-site absolute path is allowed, so a crafted link cannot
 * turn the sign-in screen into a phishing hop.
 *
 * `//evil.example.com` is the one that catches people out: it is protocol-relative, so a
 * bare startsWith('/') check lets it straight through.
 */
export const SafeRedirectSchema = z
  .string()
  .refine((value) => value.startsWith('/') && !value.startsWith('//'))

export const RedirectSearchSchema = z.object({
  redirect: SafeRedirectSchema.optional().catch(undefined),
})
