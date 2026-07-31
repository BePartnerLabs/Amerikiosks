import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...rest
  }: {
    href: unknown
  } & React.ComponentPropsWithoutRef<'a'>) => {
    const params = (href as { params?: { slug?: string; family?: string } } | undefined)?.params
    const resolved = typeof href === 'string' ? href : `/machines/${params?.family ?? params?.slug}`
    return (
      <a
        href={resolved}
        {...rest}
      >
        {children}
      </a>
    )
  },
}))

const find = vi.fn()
vi.mock('payload', () => ({ getPayload: vi.fn().mockResolvedValue({ find }) }))

const makeFamily = (slug: string, name: string) => ({
  id: slug,
  slug,
  name,
  tagline: `${name} tagline`,
  thumbnail: { id: slug, url: `/${slug}.jpg`, width: 800, height: 600 },
})

describe('RelatedMachines', () => {
  it('excludes the current family and renders sibling families', async () => {
    find.mockResolvedValue({
      docs: [makeFamily('delta', 'Delta'), makeFamily('kappa', 'Kappa')],
    })

    const { RelatedMachines } = await import(
      '@/app/(frontend)/[locale]/machines/[family]/[slug]/RelatedMachines'
    )
    const ui = await RelatedMachines({ currentFamilyId: 5, locale: 'en' })
    render(ui)

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'machine-families',
        where: { id: { not_equals: 5 } },
        limit: 5,
      }),
    )
    expect(screen.getByText('Delta')).toBeInTheDocument()
    expect(screen.getByText('Kappa')).toBeInTheDocument()
    // Reuses the home page's ModelLinesBlock carousel — each family panel
    // links to its own /machines/[family] page; there's no aggregate link.
    expect(screen.getByRole('link', { name: /Delta/ })).toHaveAttribute('href', '/machines/delta')

    // The dynamic import above pulls in a whole route component (Payload
    // config, next-intl, the block tree). On a cold transform that alone runs
    // past vitest's 5s default, which made this fail intermittently — always
    // at ~5.1-5.6s, never on an assertion. The budget was the problem, not the
    // test.
  }, 20_000)
})
