import type { StateField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { FormError } from '../Error'
import { RequiredMark } from '../RequiredMark'
import '../Select/select.css'
import { Width } from '../Width'
import { stateOptions } from './options'

export const State: React.FC<
  StateField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => {
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
        {stateOptions.map(({ label: optionLabel, value }) => (
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
