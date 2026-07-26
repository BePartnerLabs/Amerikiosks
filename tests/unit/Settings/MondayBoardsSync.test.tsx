import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const setValueMock = vi.fn()
const useFieldMock = vi.fn()
vi.mock('@payloadcms/ui', () => ({
  useField: (...args: unknown[]) => useFieldMock(...args),
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
