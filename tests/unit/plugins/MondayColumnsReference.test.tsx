import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const useFieldMock = vi.fn()
vi.mock('@payloadcms/ui', () => ({
  useField: (...args: unknown[]) => useFieldMock(...args),
}))

import { MondayColumnsReference } from '@/plugins/components/MondayColumnsReference'

describe('MondayColumnsReference', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('prompts to sync boards first when the settings fetch has no cache', async () => {
    useFieldMock.mockReturnValue({ value: '4042731281' })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: async () => ({ mondayBoardsCache: undefined }) }),
    )

    render(<MondayColumnsReference />)

    expect(
      await screen.findByText('Sync Monday boards first in Settings → Integrations.'),
    ).toBeInTheDocument()
  })

  it('shows a not-found message when the entered board id has no match in the cache', async () => {
    useFieldMock.mockReturnValue({ value: '999' })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          mondayBoardsCache: {
            syncedAt: '2026-07-25T00:00:00.000Z',
            boards: [{ id: '4042731281', name: 'Contact Us - AK', groups: [], columns: [] }],
          },
        }),
      }),
    )

    render(<MondayColumnsReference />)

    expect(
      await screen.findByText(
        'No cached board matches this id — double check it, or refresh boards in Settings.',
      ),
    ).toBeInTheDocument()
  })

  it('renders the matching board columns with title, type, and copyable id', async () => {
    useFieldMock.mockReturnValue({ value: '4042731281' })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          mondayBoardsCache: {
            syncedAt: '2026-07-25T00:00:00.000Z',
            boards: [
              {
                id: '4042731281',
                name: 'Contact Us - AK',
                groups: [],
                columns: [{ id: 'email', title: 'Email', type: 'email' }],
              },
            ],
          },
        }),
      }),
    )

    render(<MondayColumnsReference />)

    expect(await screen.findByText('Email')).toBeInTheDocument()
    expect(screen.getByText('email', { selector: 'code' })).toBeInTheDocument()
  })

  it('renders nothing (no fetch) when no board id has been entered yet', () => {
    useFieldMock.mockReturnValue({ value: undefined })
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    render(<MondayColumnsReference />)

    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
