import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))
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

const find = vi.fn()
vi.mock('payload', () => ({ getPayload: vi.fn().mockResolvedValue({ find }) }))

const makeMachine = (slug: string, name: string) => ({
  id: slug,
  slug,
  name,
  tagline: `${name} tagline`,
  image: { id: slug, url: `/${slug}.jpg`, width: 800, height: 600 },
  tags: [],
})

describe('RelatedMachines', () => {
  it('excludes the current machine and renders up to 3 others', async () => {
    find.mockResolvedValue({
      docs: [makeMachine('compact', 'Compact'), makeMachine('campaign', 'Campaign')],
    })

    const { RelatedMachines } = await import(
      '@/app/(frontend)/[locale]/machines/[slug]/RelatedMachines'
    )
    const ui = await RelatedMachines({ currentSlug: 'gamma-13', locale: 'en' })
    render(ui)

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'machines',
        where: { slug: { not_equals: 'gamma-13' } },
        limit: 3,
      }),
    )
    expect(screen.getByText('Compact')).toBeInTheDocument()
    expect(screen.getByText('Campaign')).toBeInTheDocument()
  })
})
