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
 * Built from the upload field's own `mimeTypes` rows — the form-builder plugin
 * already ships that field, so this reads it rather than adding a second place
 * to declare the same thing. Empty falls back to images, which is what every
 * existing field means. The server re-checks the real bytes regardless; this
 * only drives the file picker's filter.
 */
function buildAccept(mimeTypes?: { mimeType?: string | null }[] | null): string {
  const declared = (mimeTypes ?? []).map((row) => row.mimeType).filter(Boolean) as string[]
  return declared.length > 0 ? declared.join(',') : IMAGE_TYPES
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
    mimeTypes?: { mimeType?: string | null }[] | null
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
    // biome-ignore lint/suspicious/noExplicitAny: react-hook-form's FieldValues generic doesn't cover a dynamically-keyed form-builder submission
    setValue: UseFormSetValue<any>
    /** 0-100 while the submission that carries this file is uploading. */
    uploadPercent?: number
  }
> = ({ mimeTypes, name, errors, label, register, required, setValue, uploadPercent, width }) => {
  const t = useTranslations('form.upload')
  const [file, setFile] = useState<File | undefined>(undefined)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [isDragOver, setIsDragOver] = useState(false)
  const [justDropped, setJustDropped] = useState(false)
  // The ripple lives on the stage, not on the dropzone: accepting a file
  // unmounts the dropzone in the same tick, so an animation anchored to it
  // never got a frame — the zone just vanished and the file row appeared.
  const stageRef = useRef<HTMLDivElement>(null)
  // dragenter/dragleave also fire for every child element, so a plain boolean
  // flickers as the pointer crosses the icon or the copy. Counting depth is
  // the standard fix.
  const dragDepth = useRef(0)
  const hasError = Boolean(errors[name]) || Boolean(error)
  const errorId = `${name}-error`
  const accept = buildAccept(mimeTypes)
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
    const stage = stageRef.current
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    stage.style.setProperty('--mx', `${event.clientX - rect.left}px`)
    stage.style.setProperty('--my', `${event.clientY - rect.top}px`)
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

      <div
        className="ak-upload__stage"
        ref={stageRef}
        data-dropped={justDropped || undefined}
      >
        <span
          className="ak-upload__ripple"
          aria-hidden="true"
        />

        {!file && (
          <label
            className="bp-file-upload__dropzone ak-upload__zone"
            htmlFor={name}
            data-dragover={isDragOver || undefined}
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
            {/* Drawn as a CSS background rather than an image element: this is
                a local object URL for a file the visitor just picked, so
                next/image has nothing to optimise and no loader for it. */}
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
      </div>

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
