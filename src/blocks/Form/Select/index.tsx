import type { SelectField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { FormError } from '../Error'
import { Width } from '../Width'
import './select.css'

export const Select: React.FC<
  SelectField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, options, register, required, width }) => {
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
        {required && (
          <span className="required">
            * <span className="sr-only">(required)</span>
          </span>
        )}
      </label>
      <select
        className="ak-form__native-select"
        defaultValue={defaultValue ?? ''}
        id={name}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        {...register(name, { required })}
      >
        <option
          disabled
          value=""
        >
          {label}
        </option>
        {options.map(({ label: optionLabel, value }) => (
          <option
            key={value}
            value={value}
          >
            {optionLabel}
          </option>
        ))}
      </select>
      {hasError && (
        <FormError
          id={errorId}
          name={name}
        />
      )}
    </Width>
  )
}
