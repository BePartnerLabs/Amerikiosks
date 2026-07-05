import { act, cleanup, render, screen } from '@testing-library/react'
import type React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MachinesListingClient } from '@/blocks/MachinesListing/Component'
import type { Machine } from '@/payload-types'

const replace = vi.fn()
let searchParamsValue = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParamsValue,
}))

vi.mock('@/i18n/routing', () => ({
  Link: ({
    href,
    children,
    ...rest
  }: {
    href: { pathname: string; params?: Record<string, string> }
  } & React.ComponentPropsWithoutRef<'a'>) => (
    <a
      href={`/machines/${href.params?.slug}`}
      {...rest}
    >
      {children}
    </a>
  ),
}))

vi.mock('@/utilities/useInView', () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
}))

const makeMachine = (slug: string, name: string, tag: string): Machine =>
  ({
    id: slug,
    slug,
    name,
    tagline: `${name} tagline`,
    image: { id: slug, url: `/${slug}.jpg`, width: 800, height: 600 },
    tags: [{ label: tag, id: `${slug}-tag` }],
    layout: [],
    updatedAt: '',
    createdAt: '',
  }) as unknown as Machine

const machines = [
  makeMachine('full-size', 'Full-size branded machine', 'full-size'),
  makeMachine('compact', 'Compact footprint machine', 'compact'),
  makeMachine('campaign', 'Campaign activation unit', 'campaign'),
]

describe('MachinesListingClient', () => {
  afterEach(() => {
    cleanup()
    replace.mockClear()
    searchParamsValue = new URLSearchParams()
  })

  it('renders all machines when no tag filter is active and itemsPerPage is large', () => {
    render(
      <MachinesListingClient
        machines={machines}
        allTags={['full-size', 'compact', 'campaign']}
        itemsPerPage={12}
      />,
    )
    expect(screen.getByText('Full-size branded machine')).toBeInTheDocument()
    expect(screen.getByText('Compact footprint machine')).toBeInTheDocument()
    expect(screen.getByText('Campaign activation unit')).toBeInTheDocument()
  })

  it('renders only machines matching the active tag query param', () => {
    searchParamsValue = new URLSearchParams('tag=compact')
    render(
      <MachinesListingClient
        machines={machines}
        allTags={['full-size', 'compact', 'campaign']}
        itemsPerPage={12}
      />,
    )
    expect(screen.queryByText('Full-size branded machine')).not.toBeInTheDocument()
    expect(screen.getByText('Compact footprint machine')).toBeInTheDocument()
  })

  it('paginates the filtered list according to itemsPerPage', () => {
    render(
      <MachinesListingClient
        machines={machines}
        allTags={['full-size', 'compact', 'campaign']}
        itemsPerPage={2}
      />,
    )
    expect(screen.getByText('Full-size branded machine')).toBeInTheDocument()
    expect(screen.getByText('Compact footprint machine')).toBeInTheDocument()
    expect(screen.queryByText('Campaign activation unit')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
  })

  it('navigates to page 2 when its pagination control is clicked', () => {
    render(
      <MachinesListingClient
        machines={machines}
        allTags={['full-size', 'compact', 'campaign']}
        itemsPerPage={2}
      />,
    )
    act(() => {
      screen.getByRole('button', { name: '2' }).click()
    })
    expect(screen.getByText('Campaign activation unit')).toBeInTheDocument()
    expect(screen.queryByText('Full-size branded machine')).not.toBeInTheDocument()
  })

  it('resets to page 1 when the tag filter changes', () => {
    render(
      <MachinesListingClient
        machines={machines}
        allTags={['full-size', 'compact', 'campaign']}
        itemsPerPage={2}
      />,
    )
    act(() => {
      screen.getByRole('button', { name: '2' }).click()
    })
    act(() => {
      screen.getByRole('button', { name: 'Compact' }).click()
    })
    expect(screen.getByText('Compact footprint machine')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument()
  })

  it('syncs the URL with the selected tag when a filter chip is clicked', () => {
    render(
      <MachinesListingClient
        machines={machines}
        allTags={['full-size', 'compact', 'campaign']}
        itemsPerPage={12}
      />,
    )
    act(() => {
      screen.getByRole('button', { name: 'Compact' }).click()
    })
    expect(replace).toHaveBeenCalledWith(expect.stringContaining('tag=compact'), { scroll: false })
  })
})
