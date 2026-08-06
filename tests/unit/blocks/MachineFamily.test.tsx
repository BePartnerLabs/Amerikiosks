import { cleanup, render, screen } from '@testing-library/react'
import type React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Machine, MachineFamily as MachineFamilyDoc, Media } from '@/payload-types'

vi.mock('@payload-config', () => ({ default: {} }))

const { find, findByID } = vi.hoisted(() => ({ find: vi.fn(), findByID: vi.fn() }))
vi.mock('payload', () => ({ getPayload: vi.fn().mockResolvedValue({ find, findByID }) }))
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

import { MachineFamilyBlock } from '@/blocks/MachineFamily/Component'
import { MachineFamilyServer } from '@/blocks/MachineFamily/Server'
import type { FamilySection } from '@/blocks/MachineFamily/types'

const makeMedia = (url: string): Media =>
  ({ id: url, url, alt: '', updatedAt: '', createdAt: '' }) as unknown as Media

const familyDoc = (slug: string): MachineFamilyDoc =>
  ({
    id: slug,
    slug,
    name: `${slug} Series`,
    tagline: 'A tagline',
    description: 'A description',
    ctaLabel: 'Explore our models',
    thumbnail: makeMedia(`/${slug}-front.png`),
    hoverThumbnail: makeMedia(`/${slug}-side.png`),
    highlights: { heading: 'The headline', items: [{ title: 'Lead feature' }] },
    updatedAt: '',
    createdAt: '',
  }) as unknown as MachineFamilyDoc

const machineIn = (familySlug: string, slug: string): Machine =>
  ({
    id: slug,
    slug,
    name: slug,
    family: { id: familySlug, slug: familySlug, name: familySlug },
    image: makeMedia(`/${slug}.png`),
    updatedAt: '',
    createdAt: '',
  }) as unknown as Machine

const section = (over: Partial<FamilySection> = {}): FamilySection => ({
  name: 'Alpha Series',
  slug: 'alpha',
  headline: 'Hot food, fast',
  description: 'A description',
  ctaLabel: 'Explore our Alpha Models',
  frontUrl: '/alpha-front.png',
  turnUrl: '/alpha-side.png',
  highlights: [{ title: 'Lead feature', description: 'Lead text', imageUrl: null }],
  machineShots: [],
  modelCount: 3,
  ...over,
})

describe('MachineFamilyServer', () => {
  afterEach(() => {
    cleanup()
    find.mockReset()
    findByID.mockReset()
  })

  it('counts only the machines belonging to this family', async () => {
    findByID.mockResolvedValue(familyDoc('alpha'))
    find.mockResolvedValue({
      docs: [machineIn('alpha', 'a-1'), machineIn('delta', 'd-1'), machineIn('alpha', 'a-2')],
    })

    const ui = await MachineFamilyServer({
      blockType: 'machineFamily',
      family: 1,
      showModelCount: true,
      countEyebrow: 'Models in line',
    } as never)
    render(ui as React.ReactElement)

    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders nothing when the family has no characteristics to show', async () => {
    findByID.mockResolvedValue({
      ...familyDoc('gamma'),
      highlights: { items: [] },
    })
    find.mockResolvedValue({ docs: [] })

    const ui = await MachineFamilyServer({ blockType: 'machineFamily', family: 1 } as never)
    expect(ui).toBeNull()
  })
})

describe('MachineFamilyBlock', () => {
  afterEach(cleanup)

  it('links to its own family page using the label from the collection', () => {
    render(<MachineFamilyBlock section={section()} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/machines/alpha')
    expect(link).toHaveTextContent('Explore our Alpha Models')
  })

  it('hides the model count when the editor turns it off', () => {
    render(
      <MachineFamilyBlock
        section={section()}
        showModelCount={false}
      />,
    )

    expect(screen.queryByText('3')).not.toBeInTheDocument()
  })

  it('falls back to the family renders for tiles whose highlight has no image', () => {
    const { container } = render(
      <MachineFamilyBlock
        section={section({
          highlights: [
            { title: 'Lead', description: null, imageUrl: null },
            { title: 'Second', description: null, imageUrl: null },
          ],
        })}
      />,
    )

    const sources = Array.from(container.querySelectorAll('img')).map(
      (img) => img.getAttribute('src') ?? '',
    )
    expect(sources.join(' ')).toContain('alpha-side.png')
  })
})
