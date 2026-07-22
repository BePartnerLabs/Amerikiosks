import type { CheckboxField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { FormError } from '../Error'
import { Width } from '../Width'

export const Checkbox: React.FC<
  CheckboxField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => {
  const hasError = Boolean(errors[name])
  const errorId = `${name}-error`

  return (
    <Width
      width={width}
      className="bp-checkbox-field"
    >
      <label className="bp-checkbox">
        <input
          className="bp-checkbox__input"
          defaultChecked={defaultValue}
          id={name}
          type="checkbox"
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          {...register(name, { required })}
        />
        {label}
        {required && (
          <span className="required">
            * <span className="sr-only">(required)</span>
          </span>
        )}
      </label>
      {hasError && (
        <FormError
          className="bp-checkbox-field__error"
          id={errorId}
          name={name}
        />
      )}
    </Width>
  )
}
