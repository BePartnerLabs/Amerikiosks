'use client'

import { useTranslations } from 'next-intl'
import { useFormContext } from 'react-hook-form'

const KNOWN_CODES = ['required', 'email', 'number', 'phone', 'maxLength'] as const

export const FormError = ({
  name,
  id,
  className = 'bp-field__error',
}: {
  name: string
  id?: string
  className?: string
}) => {
  const t = useTranslations('form.errors')
  const {
    formState: { errors },
  } = useFormContext()

  const error = errors[name]
  // `registerOptions.validate` (src/blocks/Form/validation.ts) returns a code
  // rather than a sentence, so the message gets translated here instead of
  // being frozen in English at validation time.
  const raw = (error?.message as string) || (error?.type === 'required' ? 'required' : '')
  const code = (KNOWN_CODES as readonly string[]).includes(raw) ? raw : 'required'

  return (
    <p
      className={className}
      id={id}
      role="alert"
    >
      {t(code)}
    </p>
  )
}
