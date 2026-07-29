'use client'

import type { UploadField } from '@payloadcms/plugin-form-builder/types'
import { useTranslations } from 'next-intl'
import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
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

const IMAGE_TYPES = 'image/jpeg,image/png,image/webp,image/heic'
const PDF_TYPE = 'application/pdf'

/**
 * Built from the field's own `acceptedFileTypes` (set in /admin), not a fixed
 * constant — a placement application may legitimately need a lease or a floor
 * plan. Empty falls back to images, which is what every existing field means.
 * The server re-checks the real bytes regardless; this only drives the picker.
 */
function buildAccept(types?: string[] | null): string {
  const chosen = types?.length ? types : ['image']
  return [chosen.includes('image') ? IMAGE_TYPES : '', chosen.includes('pdf') ? PDF_TYPE : '']
    .filter(Boolean)
    .join(',')
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileExtension(name: string): string {
  const ext = name.includes('.') ? name.split('.').pop() : undefined
  return (ext ?? 'file').slice(0, 4).toUpperCase()
}

// Same dropzone markup/behavior as ClaimForm's photo step (bp-file-upload,
// a BPL DS component defined globally in frontend.css, not ClaimForm-only).
export const Upload: React.FC<
  UploadField & {
    acceptedFileTypes?: string[] | null
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
    // biome-ignore lint/suspicious/noExplicitAny: react-hook-form's FieldValues generic doesn't cover a dynamically-keyed form-builder submission
    setValue: UseFormSetValue<any>
    /** 0-100 while the submission that carries this file is uploading. */
    uploadPercent?: number
  }
> = ({
  acceptedFileTypes,
  name,
  errors,
  label,
  register,
  required,
  setValue,
  uploadPercent,
  width,
}) => {
  const t = useTranslations('form.upload')
  const [file, setFile] = useState<File | undefined>(undefined)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [isDragOver, setIsDragOver] = useState(false)
  const [justDropped, setJustDropped] = useState(false)
  const zoneRef = useRef<HTMLLabelElement>(null)
  // dragenter/dragleave also fire for every child element, so a plain boolean
  // flickers as the pointer crosses the icon or the copy. Counting depth is
  // the standard fix.
  const dragDepth = useRef(0)
  const hasError = Boolean(errors[name]) || Boolean(error)
  const errorId = `${name}-error`
  const accept = buildAccept(acceptedFileTypes)
  const isUploading = typeof uploadPercent === 'number' && uploadPercent < 100

  // The dropzone holds its File in component state and pushes it through
  // setValue, so there is no input to spread register()'s props onto the way
  // every other field does. Register the name on its own anyway — without it
  // react-hook-form has no rules attached and `required` is silently
  // unenforced: the form submits with no file and the FormError below can
  // never fire, because nothing ever writes errors[name].
  useEffect(() => {
    register(name, { required })
  }, [name, register, required])

  // Object URLs are leaked memory until revoked, and a visitor can swap the
  // file several times before submitting.
  useEffect(() => {
    if (!file?.type.startsWith('image/')) {
      setPreviewUrl(undefined)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const accepted = useCallback(
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

  const remove = useCallback(() => {
    setFile(undefined)
    setError(undefined)
    setValue(name, undefined, { shouldValidate: true })
  }, [name, setValue])

  // The spotlight follows the pointer through two custom properties rather
  // than through React state: dragover fires on every mouse move, and a
  // re-render per frame would be a lot of work for a decoration.
  const trackPointer = useCallback((event: React.DragEvent) => {
    const zone = zoneRef.current
    if (!zone) return
    const rect = zone.getBoundingClientRect()
    zone.style.setProperty('--mx', `${event.clientX - rect.left}px`)
    zone.style.setProperty('--my', `${event.clientY - rect.top}px`)
  }, [])

  return (
    <Width
      width={width}
      className="bp-field bp-file-upload ak-upload"
    >
      <label
        className="bp-field__label"
        htmlFor={name}
      >
        {label}
        {required && <RequiredMark />}
      </label>

      {!file && (
        <label
          ref={zoneRef}
          className="bp-file-upload__dropzone ak-upload__zone"
          htmlFor={name}
          data-dragover={isDragOver || undefined}
          data-dropped={justDropped || undefined}
          onDragEnter={(e) => {
            e.preventDefault()
            dragDepth.current += 1
            setIsDragOver(true)
          }}
          onDragOver={(e) => {
            e.preventDefault()
            trackPointer(e)
          }}
          onDragLeave={() => {
            dragDepth.current -= 1
            if (dragDepth.current <= 0) {
              dragDepth.current = 0
              setIsDragOver(false)
            }
          }}
          onDrop={(e) => {
            e.preventDefault()
            dragDepth.current = 0
            trackPointer(e)
            setIsDragOver(false)
            setJustDropped(true)
            setTimeout(() => setJustDropped(false), 500)
            accepted(e.dataTransfer.files?.[0])
          }}
        >
          <span
            className="ak-upload__ripple"
            aria-hidden="true"
          />
          <input
            className="bp-file-upload__input"
            id={name}
            type="file"
            accept={accept}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
            onChange={(e) => accepted(e.target.files?.[0])}
          />
          <span
            className="bp-file-upload__icon"
            aria-hidden="true"
          >
            ⬆
          </span>
          <span className="bp-file-upload__copy">{t('prompt')}</span>
          <span className="ak-upload__hint">
            {accept.includes(PDF_TYPE) ? t('hintWithPdf') : t('hint')}
          </span>
        </label>
      )}

      {file && (
        <div className="ak-upload__file">
          {/* Drawn as a CSS background rather than an image element: this is a
              local object URL for a file the visitor just picked, so next/image
              has nothing to optimise and no loader that could fetch it. */}
          <span
            className="ak-upload__thumb"
            aria-hidden="true"
            style={previewUrl ? { backgroundImage: `url(${previewUrl})` } : undefined}
          >
            {previewUrl ? '' : fileExtension(file.name)}
          </span>

          <span className="ak-upload__meta">
            <span className="ak-upload__name">{file.name}</span>
            <span className="ak-upload__size">
              {isUploading
                ? `${uploadPercent}% · ${formatFileSize(file.size)}`
                : formatFileSize(file.size)}
            </span>
            {typeof uploadPercent === 'number' && (
              <span
                className="ak-upload__bar"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={uploadPercent}
                aria-label={t('uploading')}
              >
                <span
                  className="ak-upload__bar-fill"
                  style={{ inlineSize: `${uploadPercent}%` }}
                />
              </span>
            )}
          </span>

          <button
            className="ak-upload__remove"
            type="button"
            onClick={remove}
            disabled={isUploading}
            aria-label={t('remove')}
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <p
          className="ak-upload__error"
          role="alert"
        >
          {error}
        </p>
      )}
      {hasError && !error && (
        <FormError
          id={errorId}
          name={name}
        />
      )}
    </Width>
  )
}
