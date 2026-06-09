import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { AudienceShowcaseBlock } from '@/blocks/AudienceShowcase/Component'
import type {
  AudienceShowcaseBlock as AudienceShowcaseBlockType,
  Media,
  Page,
} from '@/payload-types'

const makePage = (slug: string, title: string): Page =>
  ({
    id: slug,
    slug,
    title,
    hero: { type: 'none' },
    layout: [],
    meta: {},
    updatedAt: '',
    createdAt: '',
  }) as unknown as Page

const makeMedia = (url: string): Media =>
  ({ id: url, url, alt: '', updatedAt: '', createdAt: '' }) as unknown as Media

const base: AudienceShowcaseBlockType = {
  blockType: 'audienceShowcase',
  blockName: 'Audience Showcase — Home',
  id: 'as-1',
  heading: 'One platform.\nFour ways to show up with purpose.',
  eyebrow: "WHO IT'S FOR",
  items: [
    {
      id: 'item-1',
      page: makePage('for-brands', 'For Brands'),
      image: makeMedia('/brands.jpg'),
      cta: 'Explore brand programs',
    },
    {
      id: 'item-2',
      page: makePage('for-venues', 'For Venues'),
      image: makeMedia('/venues.jpg'),
      cta: 'Explore venue revenue',
    },
  ],
}

describe('AudienceShowcaseBlock', () => {
  afterEach(cleanup)

  it('renders section landmark with aria-label from heading', () => {
    render(<AudienceShowcaseBlock {...base} />)
    expect(screen.getByRole('region', { name: /one platform/i })).toBeInTheDocument()
  })

  it('renders heading', () => {
    render(<AudienceShowcaseBlock {...base} />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('renders eyebrow', () => {
    render(<AudienceShowcaseBlock {...base} />)
    expect(screen.getByText("WHO IT'S FOR")).toBeInTheDocument()
  })

  it('renders a card link for each item', () => {
    render(<AudienceShowcaseBlock {...base} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
  })

  it('uses page title as card label when no label override', () => {
    render(<AudienceShowcaseBlock {...base} />)
    expect(screen.getByText('For Brands')).toBeInTheDocument()
    expect(screen.getByText('For Venues')).toBeInTheDocument()
  })

  it('uses label override when provided', () => {
    const withOverride: AudienceShowcaseBlockType = {
      ...base,
      items: [
        {
          id: 'item-1',
          page: makePage('for-brands', 'For Brands'),
          image: makeMedia('/brands.jpg'),
          label: 'Brands',
          cta: 'Go',
        },
      ],
    }
    render(<AudienceShowcaseBlock {...withOverride} />)
    expect(screen.getByText('Brands')).toBeInTheDocument()
    expect(screen.queryByText('For Brands')).toBeNull()
  })

  it('renders ga analytics attributes', () => {
    const { container } = render(<AudienceShowcaseBlock {...base} />)
    const section = container.querySelector('section')
    expect(section?.getAttribute('data-ga-block')).toBe('audience_showcase')
    expect(section?.getAttribute('data-ga-section')).toBe('Audience Showcase — Home')
  })

  it('renders card links with ga-event attribute', () => {
    render(<AudienceShowcaseBlock {...base} />)
    const links = screen.getAllByRole('link')
    for (const link of links) {
      expect(link.getAttribute('data-ga-event')).toBe('audience_card_click')
    }
  })
})
