'use client'

import { useField } from '@payloadcms/ui'
import type React from 'react'
import { useEffect, useState } from 'react'
import { detectMondayDrift, type MondayBoardsCache } from '@/utilities/detectMondayDrift'

type ConnectedForm = {
  id: string | number
  title: string
  externalId?: string | null
  fields?: Array<{ externalId?: string | null }>
}

export const MondayConnectedForms: React.FC = () => {
  const { value: cache } = useField<MondayBoardsCache | undefined>({ path: 'mondayBoardsCache' })
  const [forms, setForms] = useState<ConnectedForm[] | undefined>()

  useEffect(() => {
    if (!cache) return
    let cancelled = false

    fetch('/api/forms?where[integrationTarget][equals]=monday&depth=0&limit=100')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setForms(data.docs ?? [])
      })

    return () => {
      cancelled = true
    }
  }, [cache])

  if (!cache) {
    return <p>Sync Monday boards above to check connected forms.</p>
  }

  if (!forms) {
    return <p>Loading connected forms…</p>
  }

  if (forms.length === 0) {
    return <p>No forms are currently connected to Monday.com.</p>
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {forms.map((form) => {
        const drift = detectMondayDrift(form, cache)
        return (
          <li
            key={form.id}
            style={{ margin: '0.5rem 0' }}
          >
            <a href={`/admin/collections/forms/${form.id}`}>{form.title}</a>
            {' — '}
            {!drift.boardFound ? (
              <span style={{ color: '#b91c1c' }}>⚠️ board not found in cache</span>
            ) : drift.missingColumnIds.length === 0 ? (
              <span style={{ color: '#15803d' }}>✓ up to date</span>
            ) : (
              <span style={{ color: '#b91c1c' }}>
                ⚠️ {drift.missingColumnIds.length} field(s) point to missing columns:{' '}
                {drift.missingColumnIds.join(', ')}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
