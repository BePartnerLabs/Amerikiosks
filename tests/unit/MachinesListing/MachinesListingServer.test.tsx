import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next-intl/server', () => ({ getLocale: vi.fn().mockResolvedValue('en') }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))
vi.mock('@/utilities/useInView', () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
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

const find = vi.fn()
vi.mock('payload', () => ({ getPayload: vi.fn().mockResolvedValue({ find }) }))

const makeMachine = (slug: string, name: string, tag: string) => ({
  id: slug,
  slug,
  name,
  tagline: `${name} tagline`,
  image: { id: slug, url: `/${slug}.jpg`, width: 800, height: 600 },
  tags: [{ label: tag, id: `${slug}-tag` }],
})

describe('MachinesListingServer', () => {
  it('fetches the machines collection and renders only present format tags', async () => {
    find.mockResolvedValue({
      docs: [
        makeMachine('full-size', 'Full-size branded machine', 'full-size'),
        makeMachine('compact', 'Compact footprint machine', 'compact'),
      ],
    })

    const { MachinesListingServer } = await import('@/blocks/MachinesListing/Server')
    const ui = await MachinesListingServer({
      itemsPerPage: 12,
      blockType: 'machinesListing',
    } as Parameters<typeof MachinesListingServer>[0])
    render(ui)

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'machines', locale: 'en' }),
    )
    expect(screen.getByRole('button', { name: 'Full Size' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Compact' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Campaign' })).not.toBeInTheDocument()
  })
})
