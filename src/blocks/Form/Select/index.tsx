import type { SelectField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'
import { Label } from '@/components/ui/label'

import { FormError } from '../Error'
import { Width } from '../Width'
import './select.css'

export const Select: React.FC<
  SelectField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, options, register, required, width }) => {
  return (
    <Width width={width}>
      <Label htmlFor={name}>
        {label}
        {required && (
          <span className="required">
            * <span className="sr-only">(required)</span>
          </span>
        )}
      </Label>
      <select
        className="ak-form__native-select"
        defaultValue={defaultValue ?? ''}
        id={name}
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
      {errors[name] && <FormError name={name} />}
    </Width>
  )
}
