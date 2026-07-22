'use client'

import { useFormContext } from 'react-hook-form'

export const FormError = ({
  name,
  id,
  className = 'bp-field__error',
}: {
  name: string
  id?: string
  className?: string
}) => {
  const {
    formState: { errors },
  } = useFormContext()
  return (
    <p
      className={className}
      id={id}
      role="alert"
    >
      {(errors[name]?.message as string) || 'This field is required'}
    </p>
  )
}
