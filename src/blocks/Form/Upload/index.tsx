'use client'

import type { UploadField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import { useCallback, useState } from 'react'
import type { FieldErrorsImpl, UseFormSetValue } from 'react-hook-form'
import { FormError } from '../Error'
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
    // biome-ignore lint/suspicious/noExplicitAny: react-hook-form's FieldValues generic doesn't cover a dynamically-keyed form-builder submission
    setValue: UseFormSetValue<any>
  }
> = ({ name, errors, label, required, setValue, width }) => {
  const [file, setFile] = useState<File | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [isDragOver, setIsDragOver] = useState(false)
  const hasError = Boolean(errors[name]) || Boolean(error)
  const errorId = `${name}-error`

  const accept = useCallback(
    (candidate: File | undefined) => {
      if (!candidate) return
      if (candidate.size > MAX_BYTES) {
        setError('File exceeds the 8MB size limit.')
        setFile(undefined)
        setValue(name, undefined)
        return
      }
      setError(undefined)
      setFile(candidate)
      setValue(name, candidate)
    },
    [name, setValue],
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
        {required && (
          <span className="required">
            * <span className="sr-only">(required)</span>
          </span>
        )}
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
        <span className="bp-file-upload__copy">
          Drag a file here or <span className="bp-file-upload__browse">browse</span>
        </span>
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
                Dismiss
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
