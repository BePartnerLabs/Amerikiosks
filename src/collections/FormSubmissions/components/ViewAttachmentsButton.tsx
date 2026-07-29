'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import type React from 'react'
import { useState } from 'react'

type AttachmentRow = { field?: string | null; filename?: string | null }

// The `attachments` rows only show the raw R2 object key, which is not a URL
// and not clickable. Same reasoning as Claims' ViewPhotoButton: without this,
// viewing a submitted file means knowing to call
// GET /api/form-submissions/:id/attachment-url?field=... by hand.
export const ViewAttachmentsButton: React.FC = () => {
  const { id, savedDocumentData } = useDocumentInfo()
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [message, setMessage] = useState<string | undefined>()

  const attachments = ((savedDocumentData as { attachments?: AttachmentRow[] } | undefined)
    ?.attachments ?? []) as AttachmentRow[]

  if (!id || attachments.length === 0) return null

  const view = async (field?: string | null) => {
    setStatus('loading')
    setMessage(undefined)

    try {
      const query = field ? `?field=${encodeURIComponent(field)}` : ''
      const res = await fetch(`/api/form-submissions/${id}/attachment-url${query}`)
      const data = (await res.json()) as { url?: string; error?: string }

      if (data.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer')
        setStatus('idle')
      } else {
        setStatus('error')
        setMessage(data.error ?? 'This submission has no attachment.')
      }
    } catch (err) {
      setStatus('error')
      setMessage((err as Error).message)
    }
  }

  return (
    <div style={{ margin: '1rem 0' }}>
      {attachments.map((attachment) => (
        <button
          key={attachment.field ?? attachment.filename ?? 'attachment'}
          className="btn btn--style-secondary btn--size-small"
          type="button"
          disabled={status === 'loading'}
          onClick={() => view(attachment.field)}
        >
          {status === 'loading'
            ? 'Opening…'
            : `View ${attachment.filename ?? attachment.field ?? 'attachment'}`}
        </button>
      ))}
      {message && <p style={{ color: 'var(--theme-error-500)' }}>{message}</p>}
    </div>
  )
}
