import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@/i18n/routing', () => ({
  Link: ({
    href,
    children,
    ...rest
  }: {
    href: unknown
  } & React.ComponentPropsWithoutRef<'a'>) => {
    const params = (href as { params?: { slug?: string } } | undefined)?.params
    const resolved = typeof href === 'string' ? href : `/machines/${params?.slug}`
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
  thumbnail: { id: slug, url: `/${slug}.jpg`, width: 800, height: 600 },
})

describe('RelatedMachines', () => {
  it('excludes the current family and renders sibling families', async () => {
    find.mockResolvedValue({
      docs: [makeFamily('delta', 'Delta'), makeFamily('kappa', 'Kappa')],
    })

    const { RelatedMachines } = await import(
      '@/app/(frontend)/[locale]/machines/[slug]/RelatedMachines'
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
    expect(screen.getByRole('link', { name: 'View all models' })).toHaveAttribute(
      'href',
      '/machines',
    )
  })
})
