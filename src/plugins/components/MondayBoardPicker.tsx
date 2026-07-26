'use client'

import { SelectInput, TextInput, useField } from '@payloadcms/ui'
import Link from 'next/link'
import type React from 'react'
import { useEffect, useState } from 'react'
import type { MondayBoardsCache } from '@/utilities/detectMondayDrift'

export const MondayBoardPicker: React.FC = () => {
  const { value, setValue } = useField<string | undefined>({ path: 'externalId' })
  const { value: integrationTarget } = useField<string | undefined>({ path: 'integrationTarget' })
  const [cache, setCache] = useState<MondayBoardsCache | undefined | null>(null)
  const [visibleBoardIds, setVisibleBoardIds] = useState<string[]>([])
  const isMonday = integrationTarget === 'monday'

  useEffect(() => {
    if (!isMonday) return
    let cancelled = false

    fetch('/api/globals/settings?depth=0')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setCache(data.mondayBoardsCache)
          setVisibleBoardIds(data.mondayVisibleBoardIds ?? [])
        }
      })

    return () => {
      cancelled = true
    }
  }, [isMonday])

  const allBoards = isMonday ? (cache?.boards ?? []) : []
  // An empty allowlist means "not curated yet" — fall back to showing every
  // synced board so the picker isn't empty before anyone curates the list.
  const boards =
    visibleBoardIds.length > 0 ? allBoards.filter((b) => visibleBoardIds.includes(b.id)) : allBoards
  // Checked against the full cache, not the curated `boards` list — a board
  // that exists but was excluded from curation is still a real, valid board,
  // not "drift" that needs a warning.
  const currentValueIsCached = value ? allBoards.some((b) => b.id === value) : true

  if (!isMonday) {
    return (
      <TextInput
        path="externalId"
        value={value ?? ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
        placeholder="Record id"
      />
    )
  }

  const isLocked = boards.length > 0 && Boolean(value) && currentValueIsCached

  return (
    <div>
      {cache === undefined && (
        <p style={{ color: '#b91c1c' }}>
          No boards synced yet — sync them in{' '}
          <Link href="/admin/globals/settings">Settings → Integrations</Link>.
        </p>
      )}
      {cache && value && !currentValueIsCached && (
        <p style={{ color: '#b91c1c' }}>
          This board id isn't in the last synced cache — it may be new, deleted, or a typo. Double
          check it, or refresh boards in{' '}
          <Link href="/admin/globals/settings">Settings → Integrations</Link>.
        </p>
      )}
      {boards.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <SelectInput
            path="externalId"
            name="externalId__mondayBoardPicker"
            label="Pick a synced board"
            options={[...boards]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((board) => ({
                label: `${board.name} (${board.id})`,
                value: board.id,
              }))}
            value={currentValueIsCached && value ? value : undefined}
            onChange={(option) => {
              if (option && !Array.isArray(option)) setValue(option.value as string)
            }}
          />
        </div>
      )}
      <TextInput
        path="externalId"
        label={isLocked ? 'Board id' : 'Or enter the board id manually'}
        value={value ?? ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
        placeholder="Monday.com board id"
        readOnly={isLocked}
      />
      {isLocked && (
        <button
          type="button"
          onClick={() => setValue('')}
          style={{ marginTop: '0.25rem' }}
        >
          Change board
        </button>
      )}
    </div>
  )
}
