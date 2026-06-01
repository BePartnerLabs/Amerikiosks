import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}))

vi.mock('@/components/Logo/Logo', () => ({
  Logo: () => <svg aria-label="Amerikiosks" />,
}))

vi.mock('@/components/Link', () => ({
  CMSLink: ({ url, label, children, className }: { url?: string; label?: string; children?: React.ReactNode; className?: string }) => (
    <a href={url ?? '#'} className={className}>{label ?? children}</a>
  ),
}))

import { FooterContent } from '@/Footer/FooterContent'
import type { Footer } from '@/payload-types'

const baseFooter: Partial<Footer> = {
  brandDescription: 'Premium retail automation.',
  columns: [
    {
      id: 'col-1',
      label: 'Solutions',
      links: [
        { id: 'l1', link: { type: 'custom', url: '/solutions', label: 'All Solutions' } },
      ],
    },
  ],
  contactEmail: 'hello@amerikiosks.com',
  contactCta: 'Start a Partnership',
  contactCtaUrl: '/start-a-partnership',
}

describe('FooterContent', () => {
  afterEach(cleanup)

  it('renders the logo', () => {
    render(<FooterContent footer={baseFooter} />)
    expect(screen.getByLabelText('Amerikiosks')).toBeInTheDocument()
  })

  it('renders brand description', () => {
    render(<FooterContent footer={baseFooter} />)
    expect(screen.getByText('Premium retail automation.')).toBeInTheDocument()
  })

  it('renders nav column label', () => {
    render(<FooterContent footer={baseFooter} />)
    expect(screen.getByText('Solutions')).toBeInTheDocument()
  })

  it('renders nav column link', () => {
    render(<FooterContent footer={baseFooter} />)
    expect(screen.getByText('All Solutions')).toBeInTheDocument()
  })

  it('nav link has GA4 footer_link_click attribute', () => {
    render(<FooterContent footer={baseFooter} />)
    const li = screen.getByText('All Solutions').closest('li')
    expect(li).toHaveAttribute('data-ga-event', 'footer_link_click')
    expect(li).toHaveAttribute('data-ga-section', 'footer')
  })

  it('renders contact email', () => {
    render(<FooterContent footer={baseFooter} />)
    expect(screen.getByText('hello@amerikiosks.com')).toBeInTheDocument()
  })

  it('contact email has mailto href', () => {
    render(<FooterContent footer={baseFooter} />)
    expect(screen.getByText('hello@amerikiosks.com').closest('a')).toHaveAttribute('href', 'mailto:hello@amerikiosks.com')
  })

  it('contact email li has GA4 footer_contact_click attribute', () => {
    render(<FooterContent footer={baseFooter} />)
    const li = screen.getByText('hello@amerikiosks.com').closest('li')
    expect(li).toHaveAttribute('data-ga-event', 'footer_contact_click')
    expect(li).toHaveAttribute('data-ga-section', 'footer')
  })

  it('renders contact CTA link', () => {
    render(<FooterContent footer={baseFooter} />)
    const cta = screen.getByText('Start a Partnership')
    expect(cta.closest('a')).toHaveAttribute('href', '/start-a-partnership')
  })

  it('contact CTA li has GA4 footer_contact_click attribute', () => {
    render(<FooterContent footer={baseFooter} />)
    const li = screen.getByText('Start a Partnership').closest('li')
    expect(li).toHaveAttribute('data-ga-event', 'footer_contact_click')
  })

  it('renders Schema.org JSON-LD script', () => {
    const { container } = render(<FooterContent footer={baseFooter} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).not.toBeNull()
    const data = JSON.parse(script!.innerHTML)
    expect(data['@type']).toBe('WPFooter')
  })

  it('renders copyright with current year', () => {
    render(<FooterContent footer={baseFooter} />)
    expect(screen.getByText(`© ${new Date().getFullYear()} Amerikiosks`)).toBeInTheDocument()
  })

  it('renders nothing in contact column when both contactEmail and contactCta are absent', () => {
    const { container } = render(<FooterContent footer={{ ...baseFooter, contactEmail: undefined, contactCta: undefined }} />)
    expect(container.querySelector('.ak-footer__col-heading')?.textContent).not.toBe('Contact')
  })

  it('renders footer landmark', () => {
    render(<FooterContent footer={baseFooter} />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
