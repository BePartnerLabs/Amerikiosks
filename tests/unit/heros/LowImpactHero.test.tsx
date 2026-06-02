import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/components/RichText', () => ({
  default: ({ data }: { data: unknown }) => (
    <div data-testid="richtext">{JSON.stringify(data)}</div>
  ),
}))

import { LowImpactHero } from '@/heros/LowImpact'
import type { Page } from '@/payload-types'

type HeroProps = Page['hero']

const baseHero: HeroProps = {
  type: 'lowImpact',
  richText: {
    root: { type: 'root', children: [], direction: null, format: '', indent: 0, version: 1 },
  },
  links: [],
  media: null,
  backgroundVideo: null,
  breadcrumb: 'Home / Case Studies',
  tags: [{ label: 'Retail' }, { label: 'Venues' }],
}

describe('LowImpactHero', () => {
  afterEach(cleanup)

  it('renders section landmark', () => {
    render(<LowImpactHero {...baseHero} />)
    expect(screen.getByRole('region')).toBeInTheDocument()
  })

  it('renders breadcrumb text', () => {
    render(<LowImpactHero {...baseHero} />)
    expect(screen.getByText('Home / Case Studies')).toBeInTheDocument()
  })

  it('renders richText content', () => {
    render(<LowImpactHero {...baseHero} />)
    expect(screen.getByTestId('richtext')).toBeInTheDocument()
  })

  it('renders tag pills', () => {
    render(<LowImpactHero {...baseHero} />)
    expect(screen.getByText('Retail')).toBeInTheDocument()
    expect(screen.getByText('Venues')).toBeInTheDocument()
  })

  it('does not render tags list when tags is empty', () => {
    render(
      <LowImpactHero
        {...baseHero}
        tags={[]}
      />,
    )
    expect(screen.queryByText('Retail')).toBeNull()
  })

  it('does not render breadcrumb when absent', () => {
    render(
      <LowImpactHero
        {...baseHero}
        breadcrumb={null}
      />,
    )
    expect(screen.queryByText('Home / Case Studies')).toBeNull()
  })

  it('renders BreadcrumbList JSON-LD script when breadcrumb present', () => {
    const { container } = render(<LowImpactHero {...baseHero} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).not.toBeNull()
    const data = JSON.parse((script as Element).innerHTML)
    expect(data['@type']).toBe('BreadcrumbList')
    expect(data.itemListElement).toHaveLength(2)
    expect(data.itemListElement[0].name).toBe('Home')
    expect(data.itemListElement[1].name).toBe('Case Studies')
  })

  it('does not render JSON-LD when breadcrumb is absent', () => {
    const { container } = render(
      <LowImpactHero
        {...baseHero}
        breadcrumb={null}
      />,
    )
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).toBeNull()
  })

  it('accent bar is present in the DOM', () => {
    const { container } = render(<LowImpactHero {...baseHero} />)
    expect(container.querySelector('.ak-hero-page__accent')).not.toBeNull()
  })
})
