'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import type React from 'react'
import { useState } from 'react'

// The sidebar's `photoKey` field only shows the raw R2 object key (not
// clickable, not a URL) — staff have no way to view the photo without
// knowing to swap it for the claim's own id in GET /api/claims/:id/photo-url.
// This button does that correctly instead of leaving it to guesswork.
export const ViewPhotoButton: React.FC = () => {
  const { id } = useDocumentInfo()
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [message, setMessage] = useState<string | undefined>()

  const viewPhoto = async () => {
    if (!id) return
    setStatus('loading')
    setMessage(undefined)

    try {
      const res = await fetch(`/api/claims/${id}/photo-url`)
      const data = (await res.json()) as { url?: string; error?: string }

      if (data.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer')
        setStatus('idle')
      } else {
        setStatus('error')
        setMessage(data.error ?? 'This claim has no submitted photo.')
      }
    } catch (err) {
      setStatus('error')
      setMessage((err as Error).message)
    }
  }

  return (
    <div style={{ margin: '1rem 0' }}>
      <button
        type="button"
        onClick={viewPhoto}
        disabled={status === 'loading'}
        className="btn btn--style-secondary"
      >
        {status === 'loading' ? 'Cargando…' : 'Ver foto'}
      </button>
      {message && <p style={{ marginTop: '0.5rem', color: '#b91c1c' }}>{message}</p>}
    </div>
  )
}
