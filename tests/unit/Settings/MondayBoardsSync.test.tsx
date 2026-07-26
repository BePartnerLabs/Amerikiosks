import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const setValueMock = vi.fn()
const useFieldMock = vi.fn()
vi.mock('@payloadcms/ui', () => ({
  useField: (...args: unknown[]) => useFieldMock(...args),
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children?: React.ReactNode
    onClick?: () => void
    disabled?: boolean
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}))

import { MondayBoardsSync } from '@/Settings/components/MondayBoardsSync'

describe('MondayBoardsSync', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('shows "Never synced" when the cache is empty', () => {
    useFieldMock.mockReturnValue({ value: undefined, setValue: setValueMock })
    render(<MondayBoardsSync />)
    expect(screen.getByText('Never synced')).toBeInTheDocument()
  })

  it('shows the last synced timestamp when a cache exists', () => {
    useFieldMock.mockReturnValue({
      value: { syncedAt: '2026-07-25T12:00:00.000Z', boards: [] },
      setValue: setValueMock,
    })
    render(<MondayBoardsSync />)
    expect(screen.getByText(/Last synced/)).toBeInTheDocument()
  })

  it('lists the synced board names instead of raw JSON', () => {
    useFieldMock.mockReturnValue({
      value: {
        syncedAt: '2026-07-25T12:00:00.000Z',
        boards: [
          { id: '2', name: 'Zebra Board', groups: [], columns: [] },
          { id: '1', name: 'Alpha Board', groups: [], columns: [] },
        ],
      },
      setValue: setValueMock,
    })
    render(<MondayBoardsSync />)
    expect(screen.getByText('2 board(s) synced')).toBeInTheDocument()
    expect(screen.getByText('Alpha Board', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('Zebra Board', { exact: false })).toBeInTheDocument()
  })

  it('does not show the board list when there are no boards yet', () => {
    useFieldMock.mockReturnValue({ value: undefined, setValue: setValueMock })
    render(<MondayBoardsSync />)
    expect(screen.queryByText(/board\(s\) synced/)).toBeNull()
  })

  it('refreshes boards and updates the field value on success', async () => {
    useFieldMock.mockReturnValue({ value: undefined, setValue: setValueMock })
    const newCache = { syncedAt: '2026-07-25T13:00:00.000Z', boards: [] }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => newCache }))

    render(<MondayBoardsSync />)
    fireEvent.click(screen.getByRole('button', { name: 'Refresh Monday Boards' }))

    await waitFor(() => expect(setValueMock).toHaveBeenCalledWith(newCache))
    expect(fetch).toHaveBeenCalledWith(
      '/api/globals/settings/sync-monday-boards',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('shows an error message and does not update the field on failure', async () => {
    useFieldMock.mockReturnValue({ value: undefined, setValue: setValueMock })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Bad token' }) }),
    )

    render(<MondayBoardsSync />)
    fireEvent.click(screen.getByRole('button', { name: 'Refresh Monday Boards' }))

    expect(await screen.findByText('Bad token')).toBeInTheDocument()
    expect(setValueMock).not.toHaveBeenCalled()
  })
})
