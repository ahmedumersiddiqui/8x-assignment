import { forwardRef, useId } from 'react'

import { Text } from './text'

const inputClass = (invalid: boolean) =>
  `w-full rounded-[3px] border px-2 py-1 ${invalid ? 'border-deal' : 'border-field-line'}`

type FieldLabelProps = {
  label: string
  error?: string
  hint?: string
  id: string
  children: React.ReactNode
}

/** Label, hint and error wiring, shared so a textarea announces itself like an input. */
function Field({ label, error, hint, id, children }: FieldLabelProps) {
  return (
    <p className="mb-3">
      <Text as="label" bold htmlFor={id} className="mb-1 block">
        {label}
      </Text>
      {hint && (
        <Text as="span" size="xs" tone="muted" id={`${id}-hint`} className="mb-1 block">
          {hint}
        </Text>
      )}
      {children}
      {error && (
        <Text as="span" id={`${id}-error`} size="xs" tone="danger" className="mt-1 block">
          {error}
        </Text>
      )}
    </p>
  )
}

const describedBy = (id: string, error?: string, hint?: string) =>
  [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined

type TextFieldProps = {
  label: string
  error?: string
  hint?: string
} & React.InputHTMLAttributes<HTMLInputElement>

/** Forwards its ref so `{...register('email')}` works; react-hook-form registers the
 *  element itself rather than driving it through state. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, id, type = 'text', className = '', ...rest },
  ref,
) {
  const generated = useId()
  const fieldId = id ?? generated

  return (
    <Field label={label} error={error} hint={hint} id={fieldId}>
      <input
        ref={ref}
        id={fieldId}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, error, hint)}
        className={`${inputClass(Boolean(error))} ${className}`}
        {...rest}
      />
    </Field>
  )
})

type TextAreaFieldProps = {
  label: string
  error?: string
  hint?: string
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  function TextAreaField({ label, error, hint, id, rows = 4, className = '', ...rest }, ref) {
    const generated = useId()
    const fieldId = id ?? generated

    return (
      <Field label={label} error={error} hint={hint} id={fieldId}>
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fieldId, error, hint)}
          className={`${inputClass(Boolean(error))} ${className}`}
          {...rest}
        />
      </Field>
    )
  },
)
