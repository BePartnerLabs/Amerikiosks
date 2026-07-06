import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/components/Link', () => ({
  CMSLink: ({ label, url }: { label?: string | null; url?: string | null }) => (
    <a href={url ?? '#'}>{label}</a>
  ),
}))

vi.mock('@/Header/Nav/MegaMenu', () => ({
  MegaMenu: () => <div data-testid="mega-menu" />,
}))

import { HeaderNav } from '@/Header/Nav'
import type { Header as HeaderType } from '@/payload-types'

describe('HeaderNav', () => {
  afterEach(cleanup)

  it('renders a plain link for a nav item without a mega menu', () => {
    render(
      <HeaderNav
        data={
          {
            navItems: [{ id: '1', link: { label: 'Solutions', url: '/solutions' } }],
          } as unknown as HeaderType
        }
      />,
    )
    expect(screen.getByRole('link', { name: 'Solutions' })).toHaveAttribute('href', '/solutions')
    expect(screen.queryByTestId('mega-menu')).toBeNull()
  })

  it('renders a mega menu toggle button when hasMegaMenu is true', () => {
    render(
      <HeaderNav
        data={
          {
            navItems: [
              {
                id: '1',
                link: { label: 'Solutions', url: '/solutions' },
                hasMegaMenu: true,
                megaMenu: {},
              },
            ],
          } as unknown as HeaderType
        }
      />,
    )
    expect(screen.getByRole('button', { name: /Solutions/ })).toBeInTheDocument()
    expect(screen.getByTestId('mega-menu')).toBeInTheDocument()
  })

  it('starts with aria-expanded false and updates on toggle', () => {
    render(
      <HeaderNav
        data={
          {
            navItems: [
              {
                id: '1',
                link: { label: 'Solutions', url: '/solutions' },
                hasMegaMenu: true,
                megaMenu: {},
              },
            ],
          } as unknown as HeaderType
        }
      />,
    )
    const button = screen.getByRole('button', { name: /Solutions/ })
    expect(button).toHaveAttribute('aria-expanded', 'false')

    const panel = document.getElementById('megamenu-1') as HTMLElement
    vi.spyOn(panel, 'matches').mockReturnValue(true)
    fireEvent(panel, new Event('toggle'))

    expect(screen.getByRole('button', { name: /Solutions/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('renders nothing when navItems is empty', () => {
    render(<HeaderNav data={{ navItems: [] } as unknown as HeaderType} />)
    expect(screen.queryAllByRole('link')).toHaveLength(0)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })
})
