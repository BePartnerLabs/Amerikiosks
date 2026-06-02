import { cleanup, render, screen } from '@testing-library/react'
import Image from 'next/image'
import type React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/providers/HeaderTheme', () => ({
  useHeaderTheme: () => ({ setHeaderTheme: vi.fn(), headerTheme: null }),
}))

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
  Media: ({ resource }: { resource: { url?: string; alt?: string } }) => (
    <Image
      src={resource?.url ?? ''}
      alt={resource?.alt ?? ''}
      width={1920}
      height={1080}
      unoptimized
    />
  ),
}))

vi.mock('@/components/RichText', () => ({
  default: ({ data }: { data: unknown }) => (
    <div data-testid="richtext">{JSON.stringify(data)}</div>
  ),
}))

import { HighImpactHero } from '@/heros/HighImpact'
import type { Page } from '@/payload-types'

type HeroProps = Page['hero']

const baseHero: HeroProps = {
  type: 'highImpact',
  richText: {
    root: { type: 'root', children: [], direction: null, format: '', indent: 0, version: 1 },
  },
  links: [{ link: { type: 'custom', url: '/demo', label: 'Get a Demo', appearance: 'default' } }],
  media: {
    id: 1,
    url: '/hero.jpg',
    alt: 'Airport hero image',
    updatedAt: '',
    createdAt: '',
    filename: 'hero.jpg',
    mimeType: 'image/jpeg',
    filesize: 1000,
    width: 1920,
    height: 1080,
  },
  backgroundVideo: null,
}

describe('HighImpactHero', () => {
  afterEach(cleanup)

  it('renders section landmark', () => {
    render(<HighImpactHero {...baseHero} />)
    expect(screen.getByRole('region', { name: /hero/i })).toBeInTheDocument()
  })

  it('renders hero media image', () => {
    render(<HighImpactHero {...baseHero} />)
    expect(screen.getByAltText('Airport hero image')).toBeInTheDocument()
  })

  it('renders richText content', () => {
    render(<HighImpactHero {...baseHero} />)
    expect(screen.getByTestId('richtext')).toBeInTheDocument()
  })

  it('renders CTA link', () => {
    render(<HighImpactHero {...baseHero} />)
    expect(screen.getByRole('link', { name: /get a demo/i })).toBeInTheDocument()
  })

  it('CTA li has GA4 hero_cta_click attribute', () => {
    render(<HighImpactHero {...baseHero} />)
    const li = screen.getByRole('link', { name: /get a demo/i }).closest('li')
    expect(li).toHaveAttribute('data-ga-event', 'hero_cta_click')
    expect(li).toHaveAttribute('data-ga-section', 'hero_high_impact')
  })

  it('does not render video when backgroundVideo is null', () => {
    const { container } = render(<HighImpactHero {...baseHero} />)
    expect(container.querySelector('video')).toBeNull()
  })

  it('renders video when backgroundVideo is provided', () => {
    const heroWithVideo: HeroProps = {
      ...baseHero,
      backgroundVideo: {
        id: 2,
        url: '/hero.mp4',
        updatedAt: '',
        createdAt: '',
        filename: 'hero.mp4',
        mimeType: 'video/mp4',
        filesize: 5000,
      },
    }
    const { container } = render(<HighImpactHero {...heroWithVideo} />)
    expect(container.querySelector('video')).not.toBeNull()
    expect(container.querySelector('source')).toHaveAttribute('src', '/hero.mp4')
  })

  it('video has aria-hidden when present', () => {
    const heroWithVideo: HeroProps = {
      ...baseHero,
      backgroundVideo: {
        id: 2,
        url: '/hero.mp4',
        updatedAt: '',
        createdAt: '',
        filename: 'hero.mp4',
        mimeType: 'video/mp4',
        filesize: 5000,
      },
    }
    const { container } = render(<HighImpactHero {...heroWithVideo} />)
    expect(container.querySelector('video')).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders Schema.org JSON-LD script', () => {
    const { container } = render(<HighImpactHero {...baseHero} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).not.toBeNull()
    const data = JSON.parse(script?.innerHTML)
    expect(data['@type']).toBe('WebPageElement')
  })

  it('renders no CTA list when links is empty', () => {
    render(
      <HighImpactHero
        {...baseHero}
        links={[]}
      />,
    )
    expect(screen.queryByRole('list')).toBeNull()
  })
})
