'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import type React from 'react'
import { useState } from 'react'

export const ResyncDocButton: React.FC = () => {
  const { id } = useDocumentInfo()
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState<string | undefined>()

  const resync = async () => {
    if (!id) return
    setStatus('loading')
    setMessage(undefined)

    try {
      const res = await fetch('/api/claims/resync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId: id }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }

      if (data.ok) {
        setStatus('ok')
        setMessage('Reintentado con éxito.')
      } else {
        setStatus('error')
        setMessage(data.error ?? 'Falló el reintento.')
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
        onClick={resync}
        disabled={status === 'loading'}
        className="btn btn--style-secondary"
      >
        {status === 'loading' ? 'Reintentando…' : 'Reintentar sync ahora'}
      </button>
      {message && (
        <p style={{ marginTop: '0.5rem', color: status === 'error' ? '#b91c1c' : '#15803d' }}>
          {message}
        </p>
      )}
    </div>
  )
}
