import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    onClick,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a
      href={href}
      onClick={onClick}
      {...rest}
    >
      {children}
    </a>
  ),
}))

// ── Fixtures ─────────────────────────────────────────────────────────────────

import { MobileMenu } from '@/Header/MobileMenu'
import type { Header } from '@/payload-types'

const plainItem: NonNullable<Header['navItems']>[number] = {
  id: 'item-1',
  link: { type: 'custom', url: '/about', label: 'About' },
  hasMegaMenu: false,
}

const megaItem: NonNullable<Header['navItems']>[number] = {
  id: 'item-2',
  link: { type: 'custom', url: '/solutions', label: 'Solutions' },
  hasMegaMenu: true,
  megaMenu: {
    panelLabel: 'SOLUTIONS',
    panelHeadline: 'Our solutions',
    rightTitle: 'Solutions',
    panelDescription: 'Everything we offer',
    items: [
      {
        id: 'sub-1',
        title: 'Retail Experiences',
        description: 'desc',
        icon: 'storefront',
        link: { type: 'custom', url: '/solutions/retail' },
      },
    ],
  },
}

const baseData: Header = {
  id: 1,
  navItems: [plainItem, megaItem],
  cta: { url: '/demo', label: 'Get a Demo' },
  updatedAt: '',
  createdAt: '',
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('MobileMenu', () => {
  beforeEach(() => {
    document.body.style.overflow = ''
  })

  afterEach(() => {
    cleanup()
    document.body.style.overflow = ''
  })

  it('renders the hamburger button', () => {
    render(<MobileMenu data={baseData} />)
    expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument()
  })

  it('sheet is hidden before opening', () => {
    render(<MobileMenu data={baseData} />)
    const sheet = document.getElementById('ak-mobile-sheet')
    expect(sheet?.classList.contains('ak-mobile-sheet--open')).toBe(false)
  })

  it('opens the sheet on hamburger click', () => {
    render(<MobileMenu data={baseData} />)
    fireEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
    const sheet = document.getElementById('ak-mobile-sheet')
    expect(sheet?.classList.contains('ak-mobile-sheet--open')).toBe(true)
  })

  it('sets aria-expanded on hamburger when open', () => {
    render(<MobileMenu data={baseData} />)
    const btn = screen.getByRole('button', { name: /open navigation menu/i })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
  })

  it('locks body scroll when open', () => {
    render(<MobileMenu data={baseData} />)
    fireEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('closes the sheet on close button click', () => {
    render(<MobileMenu data={baseData} />)
    fireEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
    fireEvent.click(screen.getByRole('button', { name: /close navigation menu/i }))
    const sheet = document.getElementById('ak-mobile-sheet')
    expect(sheet?.classList.contains('ak-mobile-sheet--open')).toBe(false)
  })

  it('restores body scroll on close', () => {
    render(<MobileMenu data={baseData} />)
    fireEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
    fireEvent.click(screen.getByRole('button', { name: /close navigation menu/i }))
    expect(document.body.style.overflow).toBe('')
  })

  it('renders plain nav items as links', () => {
    render(<MobileMenu data={baseData} />)
    fireEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument()
  })

  it('renders mega items as buttons', () => {
    render(<MobileMenu data={baseData} />)
    fireEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
    expect(screen.getByRole('button', { name: /solutions/i })).toBeInTheDocument()
  })

  it('slides to sub-panel on mega item click', () => {
    render(<MobileMenu data={baseData} />)
    fireEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
    fireEvent.click(screen.getByRole('button', { name: /solutions/i }))
    const panels = document.querySelector('.ak-mobile-sheet__panels')
    expect(panels?.classList.contains('ak-mobile-sheet__panels--sub')).toBe(true)
  })

  it('shows sub-item title in sub-panel', () => {
    render(<MobileMenu data={baseData} />)
    fireEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
    fireEvent.click(screen.getByRole('button', { name: /solutions/i }))
    expect(screen.getByText('Retail Experiences')).toBeInTheDocument()
  })

  it('back button returns to main panel', () => {
    render(<MobileMenu data={baseData} />)
    fireEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
    fireEvent.click(screen.getByRole('button', { name: /solutions/i }))
    fireEvent.click(screen.getByRole('button', { name: /back to main menu/i }))
    const panels = document.querySelector('.ak-mobile-sheet__panels')
    expect(panels?.classList.contains('ak-mobile-sheet__panels--sub')).toBe(false)
  })

  it('renders CTA link in sheet', () => {
    render(<MobileMenu data={baseData} />)
    fireEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
    expect(screen.getByRole('link', { name: /get a demo/i })).toBeInTheDocument()
  })

  it('hamburger has GA4 data attributes', () => {
    render(<MobileMenu data={baseData} />)
    const btn = screen.getByRole('button', { name: /open navigation menu/i })
    expect(btn).toHaveAttribute('data-ga-event', 'mobile_menu_open')
    expect(btn).toHaveAttribute('data-ga-section', 'header')
  })

  it('CTA has GA4 data attributes', () => {
    render(<MobileMenu data={baseData} />)
    fireEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
    const cta = screen.getByRole('link', { name: /get a demo/i })
    expect(cta).toHaveAttribute('data-ga-event', 'cta_click')
    expect(cta).toHaveAttribute('data-ga-section', 'header')
  })

  it('renders nothing for CTA when url is empty', () => {
    const dataWithoutCta: Header = { ...baseData, cta: { label: '', url: '' } }
    render(<MobileMenu data={dataWithoutCta} />)
    fireEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
    expect(screen.queryByRole('link', { name: /get a demo/i })).not.toBeInTheDocument()
  })
})
