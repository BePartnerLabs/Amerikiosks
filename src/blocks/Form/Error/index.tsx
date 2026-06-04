'use client'

import { useFormContext } from 'react-hook-form'

export const FormError = ({ name }: { name: string }) => {
  const {
    formState: { errors },
  } = useFormContext()
  return (
    <div className="ak-form__error">
      {(errors[name]?.message as string) || 'This field is required'}
    </div>
  )
}
