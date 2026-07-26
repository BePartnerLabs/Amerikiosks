'use client'

import { SelectInput, TextInput, useField } from '@payloadcms/ui'
import type React from 'react'
import { useEffect, useState } from 'react'
import type { MondayBoardsCache } from '@/utilities/detectMondayDrift'

export const MondayGroupPicker: React.FC = () => {
  const { value: boardId } = useField<string | undefined>({ path: 'externalId' })
  const { value, setValue } = useField<string | undefined>({ path: 'mondayGroupId' })
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

  const groups = (boardId && cache?.boards.find((b) => b.id === boardId)?.groups) || []
  const currentValueIsCached = value ? groups.some((g) => g.id === value) : true
  const isLocked = groups.length > 0 && Boolean(value) && currentValueIsCached

  return (
    <div>
      {groups.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <SelectInput
            path="mondayGroupId"
            name="mondayGroupId__mondayGroupPicker"
            label="Pick a group"
            options={groups.map((group) => ({ label: group.title, value: group.id }))}
            value={currentValueIsCached ? value : undefined}
            onChange={(option) => {
              if (option && !Array.isArray(option)) setValue(option.value as string)
            }}
          />
        </div>
      )}
      <TextInput
        path="mondayGroupId"
        label={isLocked ? 'Group id' : 'Or enter the group id manually'}
        value={value ?? ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
        placeholder='e.g. "topics"'
        readOnly={isLocked}
      />
      {isLocked && (
        <button
          type="button"
          onClick={() => setValue('')}
          style={{ marginTop: '0.25rem' }}
        >
          Change group
        </button>
      )}
    </div>
  )
}
