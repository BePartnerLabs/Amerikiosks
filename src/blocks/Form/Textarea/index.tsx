'use client'

import type { TextField } from '@payloadcms/plugin-form-builder/types'
import { useTranslations } from 'next-intl'
import type React from 'react'
import { useState } from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { FormError } from '../Error'
import { RequiredMark } from '../RequiredMark'
import { MAX_TEXTAREA_LENGTH, registerOptions } from '../validation'
import { Width } from '../Width'

// Shows the counter only near the limit. Always-on character counts read as
// pressure on a field where most people write two lines.
const COUNTER_VISIBLE_FROM = 0.8

export const Textarea: React.FC<
  TextField & {
    // Added to every field block in src/plugins/index.ts, so they are not
    // part of the plugin's own field types.
    autocomplete?: string
    valueType?: string
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
    rows?: number
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
  rows = 3,
  width,
}) => {
  const t = useTranslations('form')
  const [length, setLength] = useState((defaultValue ?? '').length)
  const hasError = Boolean(errors[name])
  const errorId = `${name}-error`
  const registered = register(
    name,
    registerOptions({ blockType, name, label, required, valueType }),
  )
  const showCounter = length >= MAX_TEXTAREA_LENGTH * COUNTER_VISIBLE_FROM

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
      <textarea
        className="bp-input"
        defaultValue={defaultValue}
        id={name}
        rows={rows}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        autoComplete={autocomplete || 'off'}
        // A hard stop, so the limit cannot be reached by typing at all — the
        // server rule stays as the guard against a paste or a scripted POST.
        maxLength={MAX_TEXTAREA_LENGTH}
        {...registered}
        onChange={(event) => {
          setLength(event.target.value.length)
          return registered.onChange(event)
        }}
      />
      {showCounter && (
        <p
          className="ak-field__counter"
          aria-live="polite"
        >
          {t('charactersLeft', { count: MAX_TEXTAREA_LENGTH - length })}
        </p>
      )}
      {hasError && (
        <FormError
          id={errorId}
          max={MAX_TEXTAREA_LENGTH}
          name={name}
        />
      )}
    </Width>
  )
}
