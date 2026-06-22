import { act, cleanup, render, screen } from '@testing-library/react'
import type React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MachinesClient } from '@/app/(frontend)/[locale]/machines/MachinesClient'
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
]

describe('MachinesClient', () => {
  afterEach(() => {
    cleanup()
    replace.mockClear()
    searchParamsValue = new URLSearchParams()
  })

  it('renders all machines when no tag filter is active', () => {
    render(
      <MachinesClient
        machines={machines}
        allTags={['full-size', 'compact']}
      />,
    )
    expect(screen.getByText('Full-size branded machine')).toBeInTheDocument()
    expect(screen.getByText('Compact footprint machine')).toBeInTheDocument()
  })

  it('renders only machines matching the active tag query param', () => {
    searchParamsValue = new URLSearchParams('tag=compact')
    render(
      <MachinesClient
        machines={machines}
        allTags={['full-size', 'compact']}
      />,
    )
    expect(screen.queryByText('Full-size branded machine')).not.toBeInTheDocument()
    expect(screen.getByText('Compact footprint machine')).toBeInTheDocument()
  })

  it('shows an empty state when no machine matches the active tag', () => {
    searchParamsValue = new URLSearchParams('tag=premium')
    render(
      <MachinesClient
        machines={machines}
        allTags={['full-size', 'compact']}
      />,
    )
    expect(screen.getByText('No machines found for this tag.')).toBeInTheDocument()
  })

  it('syncs the URL with the selected tag when a filter chip is clicked', () => {
    render(
      <MachinesClient
        machines={machines}
        allTags={['full-size', 'compact']}
      />,
    )
    act(() => {
      screen.getByRole('button', { name: 'Compact' }).click()
    })
    expect(replace).toHaveBeenCalledWith(expect.stringContaining('tag=compact'), { scroll: false })
  })
})
