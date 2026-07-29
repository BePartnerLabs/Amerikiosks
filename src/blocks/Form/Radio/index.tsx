import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { FormError } from '../Error'
import { RequiredMark } from '../RequiredMark'
import { Width } from '../Width'

type Option = { label?: string | null; value?: string | null }

/**
 * All options visible at once, which is the whole reason to pick this over a
 * select: for a short list — the yes/no questions these forms ask — a select
 * costs a click and hides the choices until it is opened.
 */
export const Radio: React.FC<{
  name: string
  label?: string
  defaultValue?: string
  options?: Option[] | null
  required?: boolean
  width?: number
  errors: Partial<FieldErrorsImpl>
  register: UseFormRegister<FieldValues>
}> = ({ name, defaultValue, errors, label, options, register, required, width }) => {
  const hasError = Boolean(errors[name])
  const errorId = `${name}-error`

  return (
    <Width
      width={width}
      className="bp-field ak-radio-field"
    >
      {/* A fieldset, not a label: the group has one question and several
          controls, and a <label> may only point at one of them. */}
      <fieldset
        className="ak-radio-field__group"
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
      >
        <legend className="bp-field__label">
          {label}
          {required && <RequiredMark />}
        </legend>

        <div className="ak-radio-field__options">
          {(options ?? []).map((option) => {
            const value = option.value ?? ''
            return (
              <label
                className="ak-radio"
                key={value}
              >
                <input
                  className="ak-radio__input"
                  type="radio"
                  value={value}
                  defaultChecked={defaultValue === value}
                  {...register(name, { required })}
                />
                <span className="ak-radio__label">{option.label ?? value}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {hasError && (
        <FormError
          id={errorId}
          name={name}
        />
      )}
    </Width>
  )
}
