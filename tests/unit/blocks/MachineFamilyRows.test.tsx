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

import { MachineFamilyRowsBlock } from '@/blocks/MachineFamilyRows/Component'
import { MachineFamilyRowsServer } from '@/blocks/MachineFamilyRows/Server'
import type { FamilyRow } from '@/blocks/MachineFamilyRows/types'

const media = (url: string): Media =>
  ({ id: url, url, alt: '', updatedAt: '', createdAt: '' }) as unknown as Media

type HighlightItem = { title: string; description?: string | null; featured?: boolean }

const familyDoc = (
  id: string,
  slug: string,
  items: HighlightItem[] = [{ title: `${slug} highlight` }],
): MachineFamilyDoc =>
  ({
    id,
    slug,
    name: `${slug} Series`,
    thumbnail: media(`/${slug}.png`),
    highlights: { items },
  }) as unknown as MachineFamilyDoc

/** Mirrors the two calls the Server makes, keyed by collection. */
const mockCollections = (families: unknown[], machines: unknown[]) => {
  find.mockReset()
  find.mockImplementation(async ({ collection }: { collection: string }) =>
    collection === 'machine-families' ? { docs: families } : { docs: machines },
  )
}

const blockProps = {
  eyebrow: null,
  heading: 'Our lines',
  intro: null,
  countEyebrow: 'models in line',
  countEyebrowOne: 'model in line',
  ctaLabel: 'View the line',
  soonLabel: 'Coming soon',
  soonCtaLabel: 'Explore the line',
  locale: 'en' as const,
}

const row = (over: Partial<FamilyRow> = {}): FamilyRow => ({
  id: '1',
  name: 'Alpha Series',
  slug: 'alpha',
  featured: { title: '360° rapid heating', description: null },
  imageUrl: '/alpha.png',
  ctaLabel: null,
  modelCount: 2,
  leansOut: false,
  ...over,
})

afterEach(() => {
  cleanup()
  find.mockReset()
})

describe('MachineFamilyRowsServer', () => {
  it('counts models from the machines collection rather than trusting a typed number', async () => {
    mockCollections(
      [familyDoc('1', 'alpha'), familyDoc('2', 'gamma')],
      [{ family: '1' }, { family: '1' }, { family: '2' }],
    )

    const element = (await MachineFamilyRowsServer({
      heading: 'x',
    } as never)) as React.ReactElement<{
      families: FamilyRow[]
    }>

    expect(element.props.families.map((f) => [f.slug, f.modelCount])).toEqual([
      ['alpha', 2],
      ['gamma', 1],
    ])
  })

  it('leaves a family with no machines at zero, which is what drives the soon state', async () => {
    mockCollections([familyDoc('3', 'delta')], [])

    const element = (await MachineFamilyRowsServer({
      heading: 'x',
    } as never)) as React.ReactElement<{
      families: FamilyRow[]
    }>

    expect(element.props.families[0].modelCount).toBe(0)
  })

  it('groups by family id, so a machine whose relation is already populated still counts', async () => {
    mockCollections([familyDoc('1', 'alpha')], [{ family: { id: '1' } }, { family: '1' }])

    const element = (await MachineFamilyRowsServer({
      heading: 'x',
    } as never)) as React.ReactElement<{
      families: FamilyRow[]
    }>

    expect(element.props.families[0].modelCount).toBe(2)
  })

  it("takes the editor's featured characteristic, and the first one when none is flagged", async () => {
    mockCollections(
      [
        familyDoc('1', 'alpha', [{ title: 'First' }, { title: 'Flagged', featured: true }]),
        familyDoc('2', 'kappa', [{ title: 'Integrated refrigeration' }, { title: 'Second' }]),
      ],
      [],
    )

    const element = (await MachineFamilyRowsServer({
      heading: 'x',
    } as never)) as React.ReactElement<{
      families: FamilyRow[]
    }>

    expect(element.props.families.map((f) => f.featured?.title)).toEqual([
      'Flagged',
      'Integrated refrigeration',
    ])
  })

  it('drops a family with no slug or no image rather than rendering a dead row', async () => {
    const noSlug = { ...familyDoc('1', 'alpha'), slug: null } as unknown as MachineFamilyDoc
    const noImage = { ...familyDoc('2', 'gamma'), thumbnail: null } as unknown as MachineFamilyDoc
    mockCollections([noSlug, noImage, familyDoc('3', 'zeta')], [])

    const element = (await MachineFamilyRowsServer({
      heading: 'x',
    } as never)) as React.ReactElement<{
      families: FamilyRow[]
    }>

    expect(element.props.families.map((f) => f.slug)).toEqual(['zeta'])
  })

  it('renders nothing when no family survives', async () => {
    mockCollections([], [])
    expect(await MachineFamilyRowsServer({ heading: 'x' } as never)).toBeNull()
  })
})

describe('MachineFamilyRowsBlock', () => {
  it('shows the count and the normal link when the family has models', () => {
    render(
      <MachineFamilyRowsBlock
        {...blockProps}
        families={[row()]}
      />,
    )

    expect(screen.getByText('2 models in line')).toBeInTheDocument()
    expect(screen.getByText('View the line')).toBeInTheDocument()
    expect(screen.queryByText('Coming soon')).not.toBeInTheDocument()
  })

  it('uses the singular label at exactly one — the count that made this field exist', () => {
    render(
      <MachineFamilyRowsBlock
        {...blockProps}
        families={[row({ modelCount: 1 })]}
      />,
    )

    expect(screen.getByText('1 model in line')).toBeInTheDocument()
    expect(screen.queryByText('1 models in line')).not.toBeInTheDocument()
  })

  it('falls back to the plural label when no singular one is set, rather than to a bare number', () => {
    render(
      <MachineFamilyRowsBlock
        {...blockProps}
        countEyebrowOne={null}
        families={[row({ modelCount: 1 })]}
      />,
    )

    expect(screen.getByText('1 models in line')).toBeInTheDocument()
  })

  it('swaps to the soon label and a link that cannot promise models when the count is zero', () => {
    render(
      <MachineFamilyRowsBlock
        {...blockProps}
        families={[row({ modelCount: 0 })]}
      />,
    )

    expect(screen.getByText('Coming soon')).toBeInTheDocument()
    expect(screen.getByText('Explore the line')).toBeInTheDocument()
    expect(screen.queryByText('View the line')).not.toBeInTheDocument()
  })

  it('still links into the family when it has no models — that page has a hero and its characteristics', () => {
    render(
      <MachineFamilyRowsBlock
        {...blockProps}
        families={[row({ modelCount: 0 })]}
      />,
    )

    expect(screen.getByRole('link')).toHaveAttribute('href', '/machines/alpha')
  })

  it('only leans the machine out when the tight crop has arrived', () => {
    const { container, rerender } = render(
      <MachineFamilyRowsBlock
        {...blockProps}
        families={[row({ leansOut: false })]}
      />,
    )
    expect(container.querySelector('.ak-family-rows__row--leans')).toBeNull()

    rerender(
      <MachineFamilyRowsBlock
        {...blockProps}
        families={[row({ leansOut: true })]}
      />,
    )
    expect(container.querySelector('.ak-family-rows__row--leans')).not.toBeNull()
  })

  it("prefers the family's own CTA label over the block default", () => {
    render(
      <MachineFamilyRowsBlock
        {...blockProps}
        families={[row({ ctaLabel: 'Discover Alpha' })]}
      />,
    )

    expect(screen.getByText('Discover Alpha')).toBeInTheDocument()
  })

  it('renders the featured characteristic', () => {
    render(
      <MachineFamilyRowsBlock
        {...blockProps}
        families={[row({ featured: { title: '360° rapid heating', description: 'In ~50s.' } })]}
      />,
    )

    expect(screen.getByText('360° rapid heating')).toBeInTheDocument()
    expect(screen.getByText('In ~50s.')).toBeInTheDocument()
  })
})
