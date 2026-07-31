import { cleanup, render, screen } from '@testing-library/react'
import type React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

// The whole point of these cases: render as if the visitor is on an /es page.
vi.mock('next-intl', () => ({
  useLocale: () => 'es',
  useTranslations: () => (key: string) => key,
}))

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

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

vi.mock('@/components/Media', () => ({ Media: () => <div /> }))

import { CMSLink } from '@/components/Link'
import { Pagination } from '@/components/Pagination'
import type { Page } from '@/payload-types'

afterEach(cleanup)

// `localePrefix: 'as-needed'` means an un-prefixed path resolves to EN, and CMS
// slugs are translated — so the missing prefix was not a cosmetic issue, it was
// a 404. This is what took the consent text's privacy-policy link down in ES.
describe('links rendered from an /es page', () => {
  it('prefixes an internal page reference', () => {
    render(
      <CMSLink
        type="reference"
        label="Política"
        reference={{
          relationTo: 'pages',
          value: { slug: 'politica-de-privacidad' } as Page,
        }}
      />,
    )

    expect(screen.getByRole('link', { name: 'Política' })).toHaveAttribute(
      'href',
      '/es/politica-de-privacidad',
    )
  })

  it('prefixes an insights reference under its collection path', () => {
    render(
      <CMSLink
        type="reference"
        label="Insight"
        reference={{ relationTo: 'insights', value: { slug: 'un-articulo' } as never }}
      />,
    )

    expect(screen.getByRole('link', { name: 'Insight' })).toHaveAttribute(
      'href',
      '/es/insights/un-articulo',
    )
  })

  // The hand-typed workaround editors were told to use while this was broken.
  it('does not double-prefix a custom URL that already has the locale', () => {
    render(
      <CMSLink
        type="custom"
        label="Manual"
        url="/es/politica-de-privacidad"
      />,
    )

    expect(screen.getByRole('link', { name: 'Manual' })).toHaveAttribute(
      'href',
      '/es/politica-de-privacidad',
    )
  })

  it('leaves an external URL untouched', () => {
    render(
      <CMSLink
        type="custom"
        label="Externo"
        url="https://example.com/x"
      />,
    )

    expect(screen.getByRole('link', { name: 'Externo' })).toHaveAttribute(
      'href',
      'https://example.com/x',
    )
  })

  // Paging from /es used to walk the visitor into the English archive.
  it('prefixes pagination links', () => {
    render(
      <Pagination
        page={2}
        totalPages={3}
      />,
    )

    const links = screen.getAllByRole('link').map((a) => a.getAttribute('href'))
    expect(links).toContain('/es/insights/page/1')
    expect(links).toContain('/es/insights/page/3')
    expect(links.some((h) => h?.startsWith('/insights/'))).toBe(false)
  })
})
