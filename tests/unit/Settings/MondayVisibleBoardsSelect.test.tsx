import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

type SelectOption = { label: string; value: string }

const setValueMock = vi.fn()
const useFieldMock = vi.fn()
vi.mock('@payloadcms/ui', () => ({
  useField: (args: { path: string }) => useFieldMock(args),
  SelectInput: ({
    options,
    value,
    onChange,
  }: {
    options?: SelectOption[]
    value?: string[]
    onChange?: (options: SelectOption[]) => void
  }) => (
    <select
      multiple
      value={value ?? []}
      onChange={(e) => {
        const picked = Array.from(e.target.selectedOptions).map(
          (o) => options?.find((opt) => opt.value === o.value) as SelectOption,
        )
        onChange?.(picked)
      }}
    >
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

import { MondayVisibleBoardsSelect } from '@/Settings/components/MondayVisibleBoardsSelect'

describe('MondayVisibleBoardsSelect', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('shows a prompt to sync when there is no cache yet', () => {
    useFieldMock.mockImplementation(({ path }: { path: string }) => {
      if (path === 'mondayBoardsCache') return { value: undefined }
      return { value: [], setValue: setValueMock }
    })

    render(<MondayVisibleBoardsSelect />)

    expect(screen.getByText('Sync Monday boards above to curate this list.')).toBeInTheDocument()
  })

  it('lists every cached board as a multi-select option, sorted by name', () => {
    useFieldMock.mockImplementation(({ path }: { path: string }) => {
      if (path === 'mondayBoardsCache') {
        return {
          value: {
            syncedAt: '2026-07-25T00:00:00.000Z',
            boards: [
              { id: '2', name: 'Zebra Board', groups: [], columns: [] },
              { id: '1', name: 'Alpha Board', groups: [], columns: [] },
            ],
          },
        }
      }
      return { value: [], setValue: setValueMock }
    })

    render(<MondayVisibleBoardsSelect />)

    const options = screen.getAllByRole('option') as HTMLOptionElement[]
    expect(options.map((o) => o.textContent)).toEqual(['Alpha Board (1)', 'Zebra Board (2)'])
  })

  it('updates the field with the picked board ids', () => {
    useFieldMock.mockImplementation(({ path }: { path: string }) => {
      if (path === 'mondayBoardsCache') {
        return {
          value: {
            syncedAt: '2026-07-25T00:00:00.000Z',
            boards: [{ id: '1', name: 'Alpha Board', groups: [], columns: [] }],
          },
        }
      }
      return { value: [], setValue: setValueMock }
    })

    render(<MondayVisibleBoardsSelect />)
    const select = screen.getByRole('listbox') as HTMLSelectElement
    const option = screen.getByRole('option', { name: 'Alpha Board (1)' }) as HTMLOptionElement
    option.selected = true

    fireEvent.change(select)

    expect(setValueMock).toHaveBeenCalledWith(['1'])
  })
})
