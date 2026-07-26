'use client'

import { useField } from '@payloadcms/ui'
import type React from 'react'
import { useEffect, useState } from 'react'
import type { MondayBoardCache, MondayBoardsCache } from '@/utilities/detectMondayDrift'

export const MondayColumnsReference: React.FC = () => {
  const { value: boardId } = useField<string | undefined>({ path: 'externalId' })
  const [cache, setCache] = useState<MondayBoardsCache | undefined | null>(null)

  useEffect(() => {
    if (!boardId) return
    let cancelled = false

    fetch('/api/globals/settings?depth=0')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setCache(data.mondayBoardsCache)
      })

    return () => {
      cancelled = true
    }
  }, [boardId])

  if (!boardId) return null

  if (cache === null) return <p>Loading Monday columns…</p>

  if (!cache) {
    return <p>Sync Monday boards first in Settings → Integrations.</p>
  }

  const board: MondayBoardCache | undefined = cache.boards.find((b) => b.id === boardId)

  if (!board) {
    return <p>No cached board matches this id — double check it, or refresh boards in Settings.</p>
  }

  const copy = (text: string) => navigator.clipboard.writeText(text)

  return (
    <table style={{ width: '100%', fontSize: '0.875rem' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left' }}>Column</th>
          <th style={{ textAlign: 'left' }}>Type</th>
          <th style={{ textAlign: 'left' }}>Id</th>
        </tr>
      </thead>
      <tbody>
        {board.columns.map((column) => (
          <tr key={column.id}>
            <td>{column.title}</td>
            <td>{column.type}</td>
            <td>
              <code>{column.id}</code>{' '}
              <button
                type="button"
                onClick={() => copy(column.id)}
              >
                Copy
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
