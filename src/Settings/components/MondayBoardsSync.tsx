'use client'

import { Button, useField } from '@payloadcms/ui'
import type React from 'react'
import { useState } from 'react'
import type { MondayBoardsCache } from '@/utilities/detectMondayDrift'

export const MondayBoardsSync: React.FC = () => {
  const { value, setValue } = useField<MondayBoardsCache | undefined>({
    path: 'mondayBoardsCache',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  const refresh = async () => {
    setStatus('loading')
    setErrorMessage(undefined)

    try {
      const res = await fetch('/api/globals/settings/sync-monday-boards', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setErrorMessage(data.error ?? 'Failed to refresh Monday boards.')
        return
      }

      setValue(data)
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setErrorMessage((err as Error).message)
    }
  }

  return (
    <div style={{ margin: '1rem 0' }}>
      <p style={{ margin: '0 0 0.5rem' }}>
        {value?.syncedAt
          ? `Last synced: ${new Date(value.syncedAt).toLocaleString()}`
          : 'Never synced'}
      </p>
      <Button
        buttonStyle="secondary"
        onClick={refresh}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Refreshing…' : 'Refresh Monday Boards'}
      </Button>
      {errorMessage && <p style={{ marginTop: '0.5rem', color: '#b91c1c' }}>{errorMessage}</p>}
      {value?.boards && value.boards.length > 0 && (
        <details style={{ marginTop: '0.5rem' }}>
          <summary>{value.boards.length} board(s) synced</summary>
          <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
            {[...value.boards]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((board) => (
                <li key={board.id}>
                  {board.name} <code>({board.id})</code>
                </li>
              ))}
          </ul>
        </details>
      )}
    </div>
  )
}
