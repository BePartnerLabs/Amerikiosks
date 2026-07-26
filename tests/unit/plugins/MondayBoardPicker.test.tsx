import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

type SelectOption = { label: string; value: string }

const setValueMock = vi.fn()
const useFieldMock = vi.fn()
vi.mock('@payloadcms/ui', () => ({
  useField: (args: { path: string }) => useFieldMock(args),
  TextInput: ({
    value,
    onChange,
    placeholder,
    readOnly,
  }: {
    value?: string
    onChange?: (e: { target: { value: string } }) => void
    placeholder?: string
    readOnly?: boolean
  }) => (
    <input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange?.(e)}
      placeholder={placeholder}
      readOnly={readOnly}
    />
  ),
  SelectInput: ({
    options,
    value,
    onChange,
  }: {
    options?: SelectOption[]
    value?: string
    onChange?: (option: SelectOption) => void
  }) => (
    <select
      value={value ?? ''}
      onChange={(e) => {
        const picked = options?.find((o) => o.value === e.target.value)
        if (picked) onChange?.(picked)
      }}
    >
      <option value="">— pick a synced board —</option>
      {options?.map((o) => (
        <option
          key={o.value}
          value={o.value}
        >
          {o.label}
        </option>
      ))}
    </select>
  ),
}))

import { MondayBoardPicker } from '@/plugins/components/MondayBoardPicker'

const cachedBoards = {
  syncedAt: '2026-07-25T00:00:00.000Z',
  boards: [
    { id: '4042731281', name: 'Contact Us - AK', groups: [], columns: [] },
    { id: '9921952442', name: 'Machines Tracker', groups: [], columns: [] },
  ],
}

function mockFields(externalId: string) {
  useFieldMock.mockImplementation(({ path }: { path: string }) => {
    if (path === 'integrationTarget') return { value: 'monday', setValue: vi.fn() }
    return { value: externalId, setValue: setValueMock }
  })
}

describe('MondayBoardPicker', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('shows a warning with a link to Settings when there is no cache yet', async () => {
    mockFields('')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: async () => ({ mondayBoardsCache: undefined }) }),
    )

    render(<MondayBoardPicker />)

    expect(await screen.findByText(/No boards synced yet/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Settings → Integrations' })).toHaveAttribute(
      'href',
      '/admin/globals/settings',
    )
  })

  it('always renders the text input so the board id stays editable', async () => {
    mockFields('4042731281')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: async () => ({ mondayBoardsCache: cachedBoards }) }),
    )

    render(<MondayBoardPicker />)
    await screen.findByRole('combobox')

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('4042731281')

    fireEvent.change(input, { target: { value: '123' } })
    expect(setValueMock).toHaveBeenCalledWith('123')
  })

  it('lists cached boards in a select and fills the text input on pick', async () => {
    mockFields('')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: async () => ({ mondayBoardsCache: cachedBoards }) }),
    )

    render(<MondayBoardPicker />)
    const select = await screen.findByRole('combobox')

    fireEvent.change(select, { target: { value: '9921952442' } })
    expect(setValueMock).toHaveBeenCalledWith('9921952442')
  })

  it('only lists boards in the curated visible-ids allowlist when one is set', async () => {
    mockFields('')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          mondayBoardsCache: cachedBoards,
          mondayVisibleBoardIds: ['9921952442'],
        }),
      }),
    )

    render(<MondayBoardPicker />)
    await screen.findByRole('combobox')

    expect(screen.queryByText('Contact Us - AK (4042731281)')).toBeNull()
    expect(screen.getByText('Machines Tracker (9921952442)')).toBeInTheDocument()
  })

  it('does not warn when the current value is a real board excluded from curation', async () => {
    mockFields('4042731281')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          mondayBoardsCache: cachedBoards,
          mondayVisibleBoardIds: ['9921952442'],
        }),
      }),
    )

    render(<MondayBoardPicker />)
    await screen.findByRole('combobox')

    expect(screen.queryByText(/isn't in the last synced cache/)).toBeNull()
  })

  it('warns when the current value does not match any cached board', async () => {
    mockFields('not-a-real-board')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: async () => ({ mondayBoardsCache: cachedBoards }) }),
    )

    render(<MondayBoardPicker />)

    expect(
      await screen.findByText(/This board id isn't in the last synced cache/),
    ).toBeInTheDocument()
  })

  it('shows no warning when the current value matches a cached board', async () => {
    mockFields('4042731281')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: async () => ({ mondayBoardsCache: cachedBoards }) }),
    )

    render(<MondayBoardPicker />)
    await screen.findByRole('combobox')

    expect(screen.queryByText(/isn't in the last synced cache/)).toBeNull()
    expect(screen.queryByText(/No boards synced yet/)).toBeNull()
  })

  it('pre-selects the matching board in the select when the value already exists', async () => {
    mockFields('9921952442')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: async () => ({ mondayBoardsCache: cachedBoards }) }),
    )

    render(<MondayBoardPicker />)
    const select = (await screen.findByRole('combobox')) as HTMLSelectElement

    expect(select.value).toBe('9921952442')
  })

  it('locks the text input and shows a "Change board" button once a cached board is set', async () => {
    mockFields('4042731281')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: async () => ({ mondayBoardsCache: cachedBoards }) }),
    )

    render(<MondayBoardPicker />)
    await screen.findByRole('combobox')

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.readOnly).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: 'Change board' }))
    expect(setValueMock).toHaveBeenCalledWith('')
  })

  it('keeps the text input editable when the value does not match a cached board', async () => {
    mockFields('not-a-real-board')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: async () => ({ mondayBoardsCache: cachedBoards }) }),
    )

    render(<MondayBoardPicker />)
    await screen.findByRole('combobox')

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.readOnly).toBe(false)
    expect(screen.queryByRole('button', { name: 'Change board' })).toBeNull()
  })

  it('renders a plain text input with no Monday chrome when the integration target is not monday', () => {
    useFieldMock.mockImplementation(({ path }: { path: string }) => {
      if (path === 'integrationTarget') return { value: 'odoo', setValue: vi.fn() }
      return { value: '', setValue: setValueMock }
    })
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    render(<MondayBoardPicker />)

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(screen.getByPlaceholderText('Record id')).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).toBeNull()
  })
})
