'use client'

import type React from 'react'
import { useState } from 'react'

type ResyncSummary = { processed: number; succeeded: number; failed: Array<{ id: unknown }> }

export const ResyncListButton: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState<string | undefined>()

  const resyncAll = async () => {
    setStatus('loading')
    setMessage(undefined)

    try {
      const res = await fetch('/api/form-submissions/resync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = (await res.json()) as ResyncSummary

      setStatus('done')
      setMessage(
        data.processed === 0
          ? 'No hay envíos en error para reintentar.'
          : `Procesados ${data.processed}, exitosos ${data.succeeded}, siguen fallando ${data.failed.length}.`,
      )
    } catch (err) {
      setStatus('error')
      setMessage((err as Error).message)
    }
  }

  return (
    <div style={{ margin: '1rem 0' }}>
      <button
        type="button"
        onClick={resyncAll}
        disabled={status === 'loading'}
        className="btn btn--style-secondary"
      >
        {status === 'loading' ? 'Reintentando…' : 'Reintentar todos los que fallaron'}
      </button>
      {message && (
        <p style={{ marginTop: '0.5rem', color: status === 'error' ? '#b91c1c' : '#15803d' }}>
          {message}
        </p>
      )}
    </div>
  )
}
