import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { FormError } from '../Error'
import { RequiredMark } from '../RequiredMark'
import { Width } from '../Width'

/**
 * The browser's own date control rather than a picker component: it is
 * localised, keyboard-accessible and touch-friendly for free, and it submits an
 * unambiguous `YYYY-MM-DD` (or `YYYY-MM-DDTHH:mm` with time) — which is what a
 * Monday date column needs, unlike anything a free-text field would produce.
 *
 * Same approach ClaimForm already takes for `transactionDateTime`.
 */
export const DateField: React.FC<{
  name: string
  label?: string
  defaultValue?: string
  /** 'date' (default) or 'dateAndTime', set per field in /admin. */
  granularity?: string
  required?: boolean
  width?: number
  errors: Partial<FieldErrorsImpl>
  register: UseFormRegister<FieldValues>
}> = ({ name, defaultValue, errors, granularity, label, register, required, width }) => {
  const hasError = Boolean(errors[name])
  const errorId = `${name}-error`
  const withTime = granularity === 'dateAndTime'

  // The plugin stores this as a full timestamp, and each control accepts only
  // its own slice of one: 10 characters for a date, 16 for a local datetime.
  // Anything longer is silently ignored by the browser, leaving the field
  // looking empty even though a default was set.
  const value = defaultValue?.slice(0, withTime ? 16 : 10)

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
        defaultValue={value}
        id={name}
        type={withTime ? 'datetime-local' : 'date'}
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
