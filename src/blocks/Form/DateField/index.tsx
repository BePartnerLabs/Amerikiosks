import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { FormError } from '../Error'
import { RequiredMark } from '../RequiredMark'
import { Width } from '../Width'

/**
 * The browser's own date control rather than a picker component: it is
 * localised, keyboard-accessible and touch-friendly for free, and it submits
 * an unambiguous ISO `YYYY-MM-DD` — which is what Monday's date columns
 * expect, unlike anything a free-text field would produce.
 */
export const DateField: React.FC<{
  name: string
  label?: string
  defaultValue?: string
  required?: boolean
  width?: number
  errors: Partial<FieldErrorsImpl>
  register: UseFormRegister<FieldValues>
}> = ({ name, defaultValue, errors, label, register, required, width }) => {
  const hasError = Boolean(errors[name])
  const errorId = `${name}-error`

  return (
    <Width
      width={width}
      className="bp-field"
    >
      <label
        className="bp-field__label"
        htmlFor={name}
      >
        {label}
        {required && <RequiredMark />}
      </label>
      <input
        className="bp-input"
        // The plugin stores this as a full timestamp; the control wants a bare
        // date, so anything longer is trimmed rather than silently ignored.
        defaultValue={defaultValue?.slice(0, 10)}
        id={name}
        type="date"
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        {...register(name, { required })}
      />
      {hasError && (
        <FormError
          id={errorId}
          name={name}
        />
      )}
    </Width>
  )
}
