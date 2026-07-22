import { cleanup, render, screen } from '@testing-library/react'
import type React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

interface MockLinkProps
  extends React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  > {
  children: React.ReactNode
  href: string
}

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: MockLinkProps) => (
    <a
      href={href}
      {...props}
    >
      {children}
    </a>
  ),
}))

import { Pagination } from '@/components/Pagination'

describe('Pagination', () => {
  afterEach(() => {
    cleanup()
  })

  it('disables Previous on the first page', () => {
    render(
      <Pagination
        page={1}
        totalPages={5}
      />,
    )
    const prevLink = screen.getByRole('link', { name: /previous page/i })
    expect(prevLink).toHaveAttribute('aria-disabled', 'true')
    expect(prevLink).toHaveAttribute('href', '#')
  })

  it('disables Next on the last page', () => {
    render(
      <Pagination
        page={5}
        totalPages={5}
      />,
    )
    const nextLink = screen.getByRole('link', { name: /next page/i })
    expect(nextLink).toHaveAttribute('aria-disabled', 'true')
    expect(nextLink).toHaveAttribute('href', '#')
  })

  it('marks the current page as active', () => {
    render(
      <Pagination
        page={3}
        totalPages={5}
      />,
    )
    expect(screen.getByRole('link', { name: '3' })).toHaveAttribute('aria-current', 'page')
  })

  it('navigates to the previous page with correct href', () => {
    render(
      <Pagination
        page={3}
        totalPages={5}
      />,
    )
    const prevPageLink = screen.getByRole('link', { name: '2' })
    expect(prevPageLink).toHaveAttribute('href', '/insights/page/2')
  })

  it('navigates to the next page with correct href', () => {
    render(
      <Pagination
        page={3}
        totalPages={5}
      />,
    )
    const nextPageLink = screen.getByRole('link', { name: '4' })
    expect(nextPageLink).toHaveAttribute('href', '/insights/page/4')
  })

  it('shows an ellipsis when there are extra pages before the previous page', () => {
    render(
      <Pagination
        page={4}
        totalPages={6}
      />,
    )
    expect(screen.getAllByText('…').length).toBeGreaterThan(0)
  })

  it('does not show a previous-page link on page 1', () => {
    render(
      <Pagination
        page={1}
        totalPages={5}
      />,
    )
    expect(screen.queryByRole('link', { name: '0' })).toBeNull()
  })
})
