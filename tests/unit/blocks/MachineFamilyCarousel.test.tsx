import { cleanup, render, screen } from '@testing-library/react'
import type React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { MachineFamily as MachineFamilyDoc, Media } from '@/payload-types'

vi.mock('@payload-config', () => ({ default: {} }))

const { find } = vi.hoisted(() => ({ find: vi.fn() }))
vi.mock('payload', () => ({ getPayload: vi.fn().mockResolvedValue({ find }) }))
vi.mock('next-intl/server', () => ({ getLocale: vi.fn().mockResolvedValue('en') }))

vi.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...rest
  }: {
    href: { pathname: string; params?: Record<string, string> }
  } & React.ComponentPropsWithoutRef<'a'>) => (
    <a
      href={`/machines/${href.params?.family}`}
      {...rest}
    >
      {children}
    </a>
  ),
}))

import { MachineFamilyCarouselBlock } from '@/blocks/MachineFamilyCarousel/Component'
import { MachineFamilyCarouselServer } from '@/blocks/MachineFamilyCarousel/Server'
import type { CarouselFamily } from '@/blocks/MachineFamilyCarousel/types'

const media = (url: string): Media =>
  ({ id: url, url, alt: '', updatedAt: '', createdAt: '' }) as unknown as Media

const familyDoc = (id: string, slug: string, over: Record<string, unknown> = {}) =>
  ({
    id,
    slug,
    name: `${slug} Series`,
    thumbnail: media(`/${slug}.png`),
    ...over,
  }) as unknown as MachineFamilyDoc

const card = (over: Partial<CarouselFamily> = {}): CarouselFamily => ({
  id: '1',
  name: 'Alpha Series',
  slug: 'alpha',
  imageUrl: '/alpha.png',
  ...over,
})

afterEach(() => {
  cleanup()
  find.mockReset()
})

describe('MachineFamilyCarouselServer', () => {
  it('prefers the tight crop and falls back to the thumbnail per family', async () => {
    find.mockResolvedValue({
      docs: [
        familyDoc('1', 'alpha', { rowImage: media('/alpha-tight.png') }),
        familyDoc('2', 'gamma'),
      ],
    })

    const el = (await MachineFamilyCarouselServer({
      heading: 'x',
    } as never)) as React.ReactElement<{
      families: CarouselFamily[]
    }>

    expect(el.props.families.map((f) => f.imageUrl)).toEqual(['/alpha-tight.png', '/gamma.png'])
  })

  it('drops a family with no slug or no image rather than leaving an empty card', async () => {
    find.mockResolvedValue({
      docs: [
        { ...familyDoc('1', 'alpha'), slug: null },
        { ...familyDoc('2', 'gamma'), thumbnail: null, rowImage: null },
        familyDoc('3', 'zeta'),
      ],
    })

    const el = (await MachineFamilyCarouselServer({
      heading: 'x',
    } as never)) as React.ReactElement<{
      families: CarouselFamily[]
    }>

    expect(el.props.families.map((f) => f.slug)).toEqual(['zeta'])
  })

  it('renders nothing when no family survives', async () => {
    find.mockResolvedValue({ docs: [] })
    expect(await MachineFamilyCarouselServer({ heading: 'x' } as never)).toBeNull()
  })
})

describe('MachineFamilyCarouselBlock', () => {
  const props = { eyebrow: null, heading: 'Our lines', intro: null, locale: 'en' as const }

  it('shows the family name and nothing else — the detail belongs to the rows below', () => {
    const { container } = render(
      <MachineFamilyCarouselBlock
        {...props}
        families={[card()]}
      />,
    )

    expect(screen.getAllByText('Alpha Series').length).toBeGreaterThan(0)
    // No badge, no characteristic, no CTA: this block is the index.
    expect(container.textContent).not.toMatch(/model|Coming soon|View the line/)
  })

  it('marks the duplicated copy inert, so it is out of the tab order and the a11y tree', () => {
    const { container } = render(
      <MachineFamilyCarouselBlock
        {...props}
        families={[card()]}
      />,
    )

    // Asserted on the attribute rather than on the accessibility tree: jsdom
    // does not implement what `inert` does to focus or to the a11y tree, so
    // `getAllByRole` would find both copies here and pass for the wrong reason
    // in a real browser. What this pins is that the attribute is emitted at
    // all — the browser behaviour it buys has to be checked in a browser.
    const clones = container.querySelector('.ak-family-carousel__clones')
    expect(clones).not.toBeNull()
    expect(clones?.hasAttribute('inert')).toBe(true)

    // And the visible copy is the one that carries a real link.
    expect(container.querySelectorAll('a[href="/machines/alpha"]').length).toBe(2)
  })

  it('names the track with the heading', () => {
    render(
      <MachineFamilyCarouselBlock
        {...props}
        families={[card()]}
      />,
    )

    expect(screen.getByRole('list', { name: 'Our lines' })).toBeInTheDocument()
  })
})
