import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const useRowLabel = vi.fn()
vi.mock('@payloadcms/ui', () => ({
  useRowLabel: () => useRowLabel(),
}))

import { RowLabel as FooterRowLabel } from '@/Footer/RowLabel'
import { RowLabel as HeaderRowLabel } from '@/Header/RowLabel'

describe.each([
  ['Footer', FooterRowLabel],
  ['Header', HeaderRowLabel],
])('%s RowLabel', (_name, RowLabel) => {
  afterEach(() => {
    cleanup()
    useRowLabel.mockReset()
  })

  it('renders "Row" when there is no link label', () => {
    useRowLabel.mockReturnValue({ data: {}, rowNumber: undefined })
    const { getByText } = render(<RowLabel path="navItems.0" />)
    expect(getByText('Row')).toBeInTheDocument()
  })

  it('renders the nav item label with a 1-indexed row number', () => {
    useRowLabel.mockReturnValue({ data: { link: { label: 'Home' } }, rowNumber: 0 })
    const { getByText } = render(<RowLabel path="navItems.0" />)
    expect(getByText('Nav item 1: Home')).toBeInTheDocument()
  })
})
