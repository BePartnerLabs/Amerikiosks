import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="lang-switcher" />,
}))

vi.mock('@/components/Logo/Logo', () => ({
  Logo: () => <div data-testid="logo" />,
}))

vi.mock('@/Header/Nav', () => ({
  HeaderNav: () => <nav data-testid="header-nav" />,
}))

vi.mock('@/Header/MobileMenu', () => ({
  MobileMenu: () => <div data-testid="mobile-menu" />,
}))

import { HeaderClient } from '@/Header/Component.client'
import type { Header as HeaderType } from '@/payload-types'

describe('HeaderClient', () => {
  afterEach(cleanup)

  it('renders the logo, nav, language switcher, and mobile menu', () => {
    render(<HeaderClient data={{ navItems: [] } as unknown as HeaderType} />)
    expect(screen.getByTestId('logo')).toBeInTheDocument()
    expect(screen.getByTestId('header-nav')).toBeInTheDocument()
    expect(screen.getByTestId('lang-switcher')).toBeInTheDocument()
  })

  it('links the logo to the homepage', () => {
    render(<HeaderClient data={{ navItems: [] } as unknown as HeaderType} />)
    expect(screen.getByRole('link', { name: 'Go to homepage' })).toHaveAttribute('href', '/')
  })

  it('renders the desktop CTA link when data.cta.url is set', () => {
    render(
      <HeaderClient
        data={
          {
            navItems: [],
            cta: { label: 'Start a Partnership', url: '/contact' },
          } as unknown as HeaderType
        }
      />,
    )
    expect(screen.getByRole('link', { name: 'Start a Partnership' })).toHaveAttribute(
      'href',
      '/contact',
    )
  })

  it('does not render the desktop CTA link when data.cta is absent', () => {
    render(<HeaderClient data={{ navItems: [] } as unknown as HeaderType} />)
    expect(screen.queryByRole('link', { name: /Start a Partnership/ })).toBeNull()
  })
})
