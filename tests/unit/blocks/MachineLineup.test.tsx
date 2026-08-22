import { cleanup, render, screen } from '@testing-library/react'
import type React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { MachineFamily, Media } from '@/payload-types'

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

import { MachineLineupBlock } from '@/blocks/MachineLineup/Component'
import { MachineLineupServer } from '@/blocks/MachineLineup/Server'
import type { LineupFamily } from '@/blocks/MachineLineup/types'

const makeMedia = (url: string): Media =>
  ({ id: url, url, alt: '', updatedAt: '', createdAt: '' }) as unknown as Media

type HighlightItem = { title: string; description?: string | null; featured?: boolean | null }

const makeFamily = (slug: string, items: HighlightItem[]): MachineFamily =>
  ({
    id: slug,
    slug,
    name: `${slug} Series`,
    tagline: `${slug} tagline`,
    thumbnail: makeMedia(`/${slug}-front.png`),
    hoverThumbnail: makeMedia(`/${slug}-side.png`),
    heroLineupImage: makeMedia(`/${slug}-lineup.png`),
    highlights: { items },
    updatedAt: '',
    createdAt: '',
  }) as unknown as MachineFamily

const makeSection = (slug: string, tagline: string): LineupFamily => ({
  id: slug,
  name: `${slug} Series`,
  slug,
  frontUrl: `/${slug}-front.png`,
  turnUrl: `/${slug}-side.png`,
  tagline,
})

describe('MachineLineupServer', () => {
  afterEach(() => {
    cleanup()
    find.mockReset()
  })

  it('leads with the family, not with one of its characteristics', async () => {
    find.mockResolvedValue({
      docs: [makeFamily('alpha', [{ title: 'Hot food fast', featured: true }])],
    })

    const ui = await MachineLineupServer({ blockType: 'machineLineup' } as never)
    render(ui as React.ReactElement)

    // The rows below this scene lead with the characteristic. If this block did
    // too, the page said the same thing twice, one under the other.
    expect(screen.getAllByText('alpha Series').length).toBeGreaterThan(0)
    expect(screen.queryByText('Hot food fast')).not.toBeInTheDocument()
  })

  it('carries the tagline as the scene body', async () => {
    find.mockResolvedValue({ docs: [makeFamily('delta', [{ title: 'Ignored here' }])] })

    const ui = await MachineLineupServer({ blockType: 'machineLineup' } as never)
    render(ui as React.ReactElement)

    expect(screen.getAllByText('delta tagline').length).toBeGreaterThan(0)
  })

  it('shows one machine, not the composed line render', async () => {
    find.mockResolvedValue({ docs: [makeFamily('gamma', [{ title: 'Anything' }])] })

    const ui = await MachineLineupServer({ blockType: 'machineLineup' } as never)
    const { container } = render(ui as React.ReactElement)

    const sources = Array.from(container.querySelectorAll('img')).map(
      (img) => img.getAttribute('src') ?? '',
    )
    expect(sources.join(' ')).toContain('gamma-front.png')
    expect(sources.join(' ')).not.toContain('gamma-lineup.png')
  })

  it('renders nothing when no family has a usable render', async () => {
    find.mockResolvedValue({
      docs: [{ id: 'x', slug: 'zeta', name: 'Zeta', highlights: { items: [] } }],
    })

    const ui = await MachineLineupServer({ blockType: 'machineLineup' } as never)
    expect(ui).toBeNull()
  })
})

describe('MachineLineupBlock', () => {
  afterEach(cleanup)

  it('renders every family — the point of removing the selector', () => {
    render(
      <MachineLineupBlock
        intro={null}
        families={[
          makeSection('alpha', 'Hot food fast'),
          makeSection('delta', 'Cold drinks'),
          makeSection('zeta', 'Compact footprint'),
        ]}
      />,
    )

    // The family name is the heading now, not an eyebrow above one. The active
    // family also appears in the link, so scope to the step titles.
    const titles = Array.from(document.querySelectorAll('.ak-lineup__title')).map(
      (node) => node.textContent,
    )
    expect(titles).toEqual(['alpha Series', 'delta Series', 'zeta Series'])
    expect(screen.getByText('Hot food fast')).toBeInTheDocument()
    expect(screen.getByText('Cold drinks')).toBeInTheDocument()
    expect(screen.getByText('Compact footprint')).toBeInTheDocument()
  })

  it('offers a real link to the family page, so scroll is not the only way through', () => {
    render(
      <MachineLineupBlock
        intro={null}
        families={[makeSection('alpha', 'Hot food fast')]}
      />,
    )

    expect(screen.getByRole('link')).toHaveAttribute('href', '/machines/alpha')
  })
})

describe('MachineLineup structured data', () => {
  afterEach(() => {
    cleanup()
    find.mockReset()
  })

  it('carries the CollectionPage graph the deleted route used to emit', async () => {
    find.mockResolvedValue({
      docs: [
        makeFamily('alpha', [{ title: 'Hot food fast', featured: true }]),
        makeFamily('zeta', [{ title: 'Cold drinks' }]),
      ],
    })

    const ui = await MachineLineupServer({ blockType: 'machineLineup' } as never)
    const { container } = render(ui as React.ReactElement)
    const script = container.querySelector('script[type="application/ld+json"]')
    const data = JSON.parse(script?.textContent ?? '{}')

    expect(data['@type']).toBe('CollectionPage')
    expect(data.hasPart).toHaveLength(2)
    expect(data.hasPart.map((part: { url: string }) => part.url).join(' ')).toContain(
      '/machines/alpha',
    )
  })
})
