import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const useFieldMock = vi.fn()
vi.mock('@payloadcms/ui', () => ({
  useField: (...args: unknown[]) => useFieldMock(...args),
}))

import { MondayConnectedForms } from '@/Settings/components/MondayConnectedForms'

describe('MondayConnectedForms', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('shows a prompt to sync when there is no cache yet', async () => {
    useFieldMock.mockReturnValue({ value: undefined })
    render(<MondayConnectedForms />)
    expect(
      await screen.findByText('Sync Monday boards above to check connected forms.'),
    ).toBeInTheDocument()
  })

  it('lists a form as up to date when all its columns exist on the board', async () => {
    useFieldMock.mockReturnValue({
      value: {
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
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          docs: [
            {
              id: 1,
              title: 'Contact Form',
              externalId: '4042731281',
              fields: [{ externalId: 'email' }],
            },
          ],
        }),
      }),
    )

    render(<MondayConnectedForms />)

    expect(await screen.findByText('Contact Form')).toBeInTheDocument()
    expect(screen.getByText('✓ up to date')).toBeInTheDocument()
  })

  it('flags a form with missing columns', async () => {
    useFieldMock.mockReturnValue({
      value: {
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
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          docs: [
            {
              id: 1,
              title: 'Contact Form',
              externalId: '4042731281',
              fields: [{ externalId: 'email' }, { externalId: 'deleted_col' }],
            },
          ],
        }),
      }),
    )

    render(<MondayConnectedForms />)

    expect(await screen.findByText(/deleted_col/)).toBeInTheDocument()
  })
})
