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
  }: {
    value?: string
    onChange?: (e: { target: { value: string } }) => void
    placeholder?: string
  }) => (
    <input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange?.(e)}
      placeholder={placeholder}
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
      <option value="">— pick a group —</option>
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

import { MondayGroupPicker } from '@/plugins/components/MondayGroupPicker'

const cachedBoards = {
  syncedAt: '2026-07-25T00:00:00.000Z',
  boards: [
    {
      id: '4042731281',
      name: 'Contact Us - AK',
      groups: [
        { id: 'topics', title: 'Topics' },
        { id: 'new_group', title: 'New Leads' },
      ],
      columns: [],
    },
  ],
}

function mockFields({ boardId, groupId }: { boardId: string; groupId: string }) {
  useFieldMock.mockImplementation(({ path }: { path: string }) => {
    if (path === 'externalId') return { value: boardId, setValue: vi.fn() }
    return { value: groupId, setValue: setValueMock }
  })
}

describe('MondayGroupPicker', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders only the text input when no board is selected yet', () => {
    mockFields({ boardId: '', groupId: '' })
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    render(<MondayGroupPicker />)

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(screen.queryByRole('combobox')).toBeNull()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it("lists the selected board's groups in a select", async () => {
    mockFields({ boardId: '4042731281', groupId: '' })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: async () => ({ mondayBoardsCache: cachedBoards }) }),
    )

    render(<MondayGroupPicker />)
    const select = await screen.findByRole('combobox')

    fireEvent.change(select, { target: { value: 'new_group' } })
    expect(setValueMock).toHaveBeenCalledWith('new_group')
  })

  it('keeps the text input editable as a manual fallback', async () => {
    mockFields({ boardId: '4042731281', groupId: 'topics' })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: async () => ({ mondayBoardsCache: cachedBoards }) }),
    )

    render(<MondayGroupPicker />)
    await screen.findByRole('combobox')

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('topics')
    fireEvent.change(input, { target: { value: 'custom_group' } })
    expect(setValueMock).toHaveBeenCalledWith('custom_group')
  })
})
