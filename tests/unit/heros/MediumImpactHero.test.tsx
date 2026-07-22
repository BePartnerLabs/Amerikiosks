import { cleanup, render, screen } from '@testing-library/react'
import type React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/components/Link', () => ({
  CMSLink: ({
    label,
    url,
    children,
    ...rest
  }: {
    label?: string
    url?: string
    children?: React.ReactNode
  }) => (
    <a
      href={url ?? '#'}
      {...rest}
    >
      {label ?? children}
    </a>
  ),
}))

vi.mock('@/components/Media', () => ({
  Media: ({ resource }: { resource: { url?: string } }) => (
    <div data-testid="media">{resource?.url}</div>
  ),
}))

vi.mock('@/components/RichText', () => ({
  default: ({ data }: { data: unknown }) => (
    <div data-testid="richtext">{JSON.stringify(data)}</div>
  ),
}))

import { MediumImpactHero } from '@/heros/MediumImpact'
import type { Page } from '@/payload-types'

type HeroProps = Page['hero']

const baseHero: HeroProps = {
  type: 'mediumImpact',
  richText: {
    root: { type: 'root', children: [], direction: null, format: '', indent: 0, version: 1 },
  },
  links: [],
  media: null,
  backgroundVideo: null,
  tags: [],
}

const breadcrumbs: Page['breadcrumbs'] = [{ label: 'For Brands', url: '/for-brands', id: '2' }]

describe('MediumImpactHero', () => {
  afterEach(cleanup)

  it('renders richText content', () => {
    render(<MediumImpactHero {...baseHero} />)
    expect(screen.getByTestId('richtext')).toBeInTheDocument()
  })

  it('renders a Home breadcrumb link and trail when breadcrumbs are present', () => {
    render(
      <MediumImpactHero
        {...baseHero}
        breadcrumbs={breadcrumbs}
      />,
    )
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByText('/ For Brands')).toBeInTheDocument()
  })

  it('does not render breadcrumb when absent', () => {
    render(<MediumImpactHero {...baseHero} />)
    expect(screen.queryByRole('link', { name: 'Home' })).toBeNull()
  })

  it('renders links as CMSLink items', () => {
    render(
      <MediumImpactHero
        {...baseHero}
        links={[{ link: { label: 'Get Started', url: '/contact', type: 'custom' } }]}
      />,
    )
    expect(screen.getByRole('link', { name: 'Get Started' })).toHaveAttribute('href', '/contact')
  })

  it('does not render tags even when present', () => {
    render(
      <MediumImpactHero
        {...baseHero}
        tags={[{ label: 'Retail' }]}
      />,
    )
    expect(screen.queryByText('Retail')).toBeNull()
  })

  it('renders the media column when media is a populated object', () => {
    render(
      <MediumImpactHero
        {...baseHero}
        media={{ id: 1, url: '/hero.jpg' } as never}
      />,
    )
    expect(screen.getByTestId('media')).toHaveTextContent('/hero.jpg')
  })

  it('does not render the media column when media is absent', () => {
    render(<MediumImpactHero {...baseHero} />)
    expect(screen.queryByTestId('media')).toBeNull()
  })

  it('renders BreadcrumbList JSON-LD when breadcrumbs are present', () => {
    const { container } = render(
      <MediumImpactHero
        {...baseHero}
        breadcrumbs={breadcrumbs}
      />,
    )
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).not.toBeNull()
    const data = JSON.parse((script as Element).innerHTML)
    expect(data['@type']).toBe('BreadcrumbList')
  })
})
