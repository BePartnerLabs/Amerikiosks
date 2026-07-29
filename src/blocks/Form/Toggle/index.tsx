'use client'

import type React from 'react'
import { useState } from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { FormError } from '../Error'
import { RequiredMark } from '../RequiredMark'
import { Width } from '../Width'

/**
 * A yes/no question as a switch rather than a checkbox or a two-option select.
 *
 * Reuses the `bp-toggle` markup the cookie preferences panel already uses, so
 * the two read as the same control — the styles for it live in
 * src/app/(frontend)/frontend.css, not here, precisely so there is one
 * definition rather than a copy per feature.
 *
 * Stored as a boolean, exactly like `checkbox`; the difference is only what
 * the visitor sees. A select with Yes/No costs a click and hides the options
 * until opened, which is the wrong trade for a binary question.
 */
export const Toggle: React.FC<{
  name: string
  label?: string
  defaultValue?: boolean
  required?: boolean
  width?: number
  errors: Partial<FieldErrorsImpl>
  register: UseFormRegister<FieldValues>
}> = ({ name, defaultValue, errors, label, register, required, width }) => {
  const [checked, setChecked] = useState(Boolean(defaultValue))
  const hasError = Boolean(errors[name])
  const errorId = `${name}-error`
  const registered = register(name, { required })

  return (
    <Width
      width={width}
      className="bp-field ak-toggle-field"
    >
      <label className="bp-toggle">
        {/* role="switch" requires aria-checked to be kept in sync — a native
            checkbox's own checked state is not enough once the role is
            overridden, and assistive tech would announce it as always off. */}
        <input
          className="bp-toggle__input"
          defaultChecked={defaultValue}
          id={name}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          {...registered}
          onChange={(event) => {
            setChecked(event.target.checked)
            return registered.onChange(event)
          }}
        />
        <span
          className="bp-toggle__track"
          aria-hidden="true"
        >
          <span className="bp-toggle__thumb" />
        </span>
        <span className="bp-toggle__label">
          {label}
          {required && <RequiredMark />}
        </span>
      </label>
      {hasError && (
        <FormError
          id={errorId}
          name={name}
        />
      )}
    </Width>
  )
}
