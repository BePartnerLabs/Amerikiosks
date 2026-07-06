import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@/components/ui/pagination', () => ({
  Pagination: ({ children }: { children: React.ReactNode }) => <nav>{children}</nav>,
  PaginationContent: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  PaginationItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  PaginationEllipsis: () => <span>...</span>,
  PaginationLink: ({
    children,
    onClick,
    isActive,
  }: {
    children: React.ReactNode
    onClick: () => void
    isActive?: boolean
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </button>
  ),
  PaginationNext: ({ disabled, onClick }: { disabled?: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      Next
    </button>
  ),
  PaginationPrevious: ({ disabled, onClick }: { disabled?: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      Previous
    </button>
  ),
}))

import { Pagination } from '@/components/Pagination'

describe('Pagination', () => {
  afterEach(() => {
    cleanup()
    push.mockClear()
  })

  it('disables Previous on the first page', () => {
    render(
      <Pagination
        page={1}
        totalPages={5}
      />,
    )
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
  })

  it('disables Next on the last page', () => {
    render(
      <Pagination
        page={5}
        totalPages={5}
      />,
    )
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('marks the current page as active', () => {
    render(
      <Pagination
        page={3}
        totalPages={5}
      />,
    )
    expect(screen.getByRole('button', { name: '3' })).toHaveAttribute('aria-current', 'page')
  })

  it('navigates to the previous page when clicked', () => {
    render(
      <Pagination
        page={3}
        totalPages={5}
      />,
    )
    screen.getByRole('button', { name: 'Previous' }).click()
    expect(push).toHaveBeenCalledWith('/insights/page/2')
  })

  it('navigates to the next page when clicked', () => {
    render(
      <Pagination
        page={3}
        totalPages={5}
      />,
    )
    screen.getByRole('button', { name: 'Next' }).click()
    expect(push).toHaveBeenCalledWith('/insights/page/4')
  })

  it('shows an ellipsis when there are extra pages before the previous page', () => {
    render(
      <Pagination
        page={4}
        totalPages={6}
      />,
    )
    expect(screen.getAllByText('...').length).toBeGreaterThan(0)
  })

  it('does not show a previous-page link on page 1', () => {
    render(
      <Pagination
        page={1}
        totalPages={5}
      />,
    )
    expect(screen.queryByRole('button', { name: '0' })).toBeNull()
  })
})
