'use client'

import { SelectInput, useField } from '@payloadcms/ui'
import type React from 'react'
import type { MondayBoardsCache } from '@/utilities/detectMondayDrift'

export const MondayVisibleBoardsSelect: React.FC = () => {
  const { value: cache } = useField<MondayBoardsCache | undefined>({ path: 'mondayBoardsCache' })
  const { value, setValue } = useField<string[]>({ path: 'mondayVisibleBoardIds' })

  if (!cache) {
    return <p>Sync Monday boards above to curate this list.</p>
  }

  const options = [...cache.boards]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((board) => ({ label: `${board.name} (${board.id})`, value: board.id }))

  return (
    <SelectInput
      path="mondayVisibleBoardIds"
      name="mondayVisibleBoardIds"
      label="Boards visible for Forms"
      hasMany
      options={options}
      value={value ?? []}
      onChange={(picked) => {
        const arr = Array.isArray(picked) ? picked : picked ? [picked] : []
        setValue(arr.map((o) => o.value as string))
      }}
    />
  )
}
