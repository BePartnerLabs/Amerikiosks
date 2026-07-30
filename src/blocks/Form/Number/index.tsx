import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { FormError } from '../Error'
import { RequiredMark } from '../RequiredMark'
import { registerOptions } from '../validation'
import { Width } from '../Width'

export const FormNumber: React.FC<
  TextField & {
    // Added to every field block in src/plugins/index.ts, so they are not
    // part of the plugin's own field types.
    autocomplete?: string
    valueType?: string
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({
  autocomplete,
  blockType,
  valueType,
  name,
  defaultValue,
  errors,
  label,
  register,
  required,
  width,
}) => {
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
        defaultValue={defaultValue}
        id={name}
        type="number"
        inputMode="numeric"
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        autoComplete={autocomplete || 'off'}
        {...register(name, registerOptions({ blockType, name, label, required, valueType }))}
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
