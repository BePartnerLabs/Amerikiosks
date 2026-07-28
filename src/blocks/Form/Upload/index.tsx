'use client'

import type { UploadField } from '@payloadcms/plugin-form-builder/types'
import { useTranslations } from 'next-intl'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import type {
  FieldErrorsImpl,
  FieldValues,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form'
import { FormError } from '../Error'
import { RequiredMark } from '../RequiredMark'
import { Width } from '../Width'

const MAX_BYTES = 8 * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Same dropzone markup/behavior as ClaimForm's photo step (bp-file-upload,
// a BPL DS component defined globally in frontend.css, not ClaimForm-only).
export const Upload: React.FC<
  UploadField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
    // biome-ignore lint/suspicious/noExplicitAny: react-hook-form's FieldValues generic doesn't cover a dynamically-keyed form-builder submission
    setValue: UseFormSetValue<any>
  }
> = ({ name, errors, label, register, required, setValue, width }) => {
  const t = useTranslations('form.upload')
  const [file, setFile] = useState<File | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [isDragOver, setIsDragOver] = useState(false)
  const hasError = Boolean(errors[name]) || Boolean(error)
  const errorId = `${name}-error`

  // The dropzone holds its File in component state and pushes it through
  // setValue, so there is no input to spread register()'s props onto the way
  // every other field does. Register the name on its own anyway — without it
  // react-hook-form has no rules attached and `required` is silently
  // unenforced: the form submits with no file and the FormError below can
  // never fire, because nothing ever writes errors[name].
  useEffect(() => {
    register(name, { required })
  }, [name, register, required])

  const accept = useCallback(
    (candidate: File | undefined) => {
      if (!candidate) return
      if (candidate.size > MAX_BYTES) {
        setError(t('tooLarge'))
        setFile(undefined)
        setValue(name, undefined, { shouldValidate: true })
        return
      }
      setError(undefined)
      setFile(candidate)
      setValue(name, candidate, { shouldValidate: true })
    },
    [name, setValue, t],
  )

  return (
    <Width
      width={width}
      className="bp-field bp-file-upload"
    >
      <label
        className="bp-field__label"
        htmlFor={name}
      >
        {label}
        {required && <RequiredMark />}
      </label>
      <label
        className="bp-file-upload__dropzone"
        htmlFor={name}
        data-dragover={isDragOver || undefined}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragOver(false)
          accept(e.dataTransfer.files?.[0])
        }}
      >
        <input
          className="bp-file-upload__input"
          id={name}
          type="file"
          accept={ACCEPT}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          onChange={(e) => accept(e.target.files?.[0])}
        />
        <span
          className="bp-file-upload__icon"
          aria-hidden="true"
        >
          ⬆
        </span>
        <span className="bp-file-upload__copy">{t('prompt')}</span>
      </label>
      {(file || error) && (
        <ul className="bp-file-upload__list">
          {file && !error && (
            <li
              className="bp-file-upload__item"
              data-state="success"
            >
              <span className="bp-file-upload__name">{file.name}</span>
              <span className="bp-file-upload__size">{formatFileSize(file.size)}</span>
            </li>
          )}
          {error && (
            <li
              className="bp-file-upload__item"
              data-state="error"
            >
              <span className="bp-file-upload__name">{error}</span>
              <button
                className="bp-file-upload__retry"
                type="button"
                onClick={() => setError(undefined)}
              >
                {t('dismiss')}
              </button>
            </li>
          )}
        </ul>
      )}
      {hasError && (
        <FormError
          id={errorId}
          name={name}
        />
      )}
    </Width>
  )
}
