import { cleanup, render, screen } from '@testing-library/react'
import type React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

// Resolved against the real es.json rather than echoing the key back. The point
// of the footer i18n fix is that the Spanish strings exist and are reachable —
// a mock returning "footer.contact" would pass even if the key were missing.
vi.mock('next-intl', async () => {
  const es = (await import('@/messages/es.json')).default as unknown as Record<
    string,
    Record<string, string>
  >
  return {
    useTranslations: (namespace: string) => (key: string, values?: Record<string, string>) => {
      let value = es[namespace]?.[key] ?? `${namespace}.${key}`
      for (const [name, replacement] of Object.entries(values ?? {})) {
        value = value.replace(`{${name}}`, replacement)
      }
      return value
    },
  }
})

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a
      href={href}
      {...rest}
    >
      {children}
    </a>
  ),
}))

vi.mock('@/components/Logo/Logo', () => ({
  Logo: () => <svg aria-label="Amerikiosks" />,
}))

vi.mock('@/components/Link', () => ({
  CMSLink: ({
    url,
    label,
    children,
    className,
  }: {
    url?: string
    label?: string
    children?: React.ReactNode
    className?: string
  }) => (
    <a
      href={url ?? '#'}
      className={className}
    >
      {label ?? children}
    </a>
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
      links: [{ id: 'l1', link: { type: 'custom', url: '/solutions', label: 'All Solutions' } }],
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
    expect(screen.getByText('hello@amerikiosks.com').closest('a')).toHaveAttribute(
      'href',
      'mailto:hello@amerikiosks.com',
    )
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
    const data = JSON.parse((script as Element).innerHTML)
    expect(data['@type']).toBe('WPFooter')
  })

  // `footer.rights` was translated in both locales but nothing rendered it.
  it('renders copyright with current year and the localized rights notice', () => {
    render(<FooterContent footer={baseFooter} />)
    expect(
      screen.getByText(`© ${new Date().getFullYear()} Amerikiosks. Todos los derechos reservados.`),
    ).toBeInTheDocument()
  })

  it('uses the editable contact heading when one is set', () => {
    render(<FooterContent footer={{ ...baseFooter, contactHeading: 'Hablemos' }} />)
    expect(screen.getByText('Hablemos')).toBeInTheDocument()
  })

  // The bug this fixes: the heading was the literal string "Contact" in JSX, so
  // it stayed English in /es beside three translated column headings.
  it('falls back to the localized default when no contact heading is set', () => {
    render(<FooterContent footer={baseFooter} />)
    expect(screen.getByText('Contacto')).toBeInTheDocument()
  })

  it('renders nothing in contact column when both contactEmail and contactCta are absent', () => {
    const { container } = render(
      <FooterContent footer={{ ...baseFooter, contactEmail: undefined, contactCta: undefined }} />,
    )
    expect(container.querySelector('.ak-footer__col-heading')?.textContent).not.toBe('Contacto')
  })

  it('renders footer landmark', () => {
    render(<FooterContent footer={baseFooter} />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
