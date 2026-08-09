import { cleanup, render, screen } from '@testing-library/react'
import type React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Machine, MachineFamily, Media } from '@/payload-types'

vi.mock('@payload-config', () => ({ default: {} }))

const { find } = vi.hoisted(() => ({ find: vi.fn() }))
vi.mock('payload', () => ({ getPayload: vi.fn().mockResolvedValue({ find }) }))
vi.mock('next-intl/server', () => ({
  getLocale: vi.fn().mockResolvedValue('en'),
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

vi.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...rest
  }: {
    href: { pathname: string; params?: Record<string, string> }
  } & React.ComponentPropsWithoutRef<'a'>) => (
    <a
      href={`/machines/${href.params?.family}/${href.params?.slug}`}
      {...rest}
    >
      {children}
    </a>
  ),
}))

import { MachineModelsServer } from '@/blocks/MachineModels/Server'

const makeMedia = (url: string): Media =>
  ({ id: url, url, alt: '', updatedAt: '', createdAt: '' }) as unknown as Media

const machine = (slug: string, familySlug: string, familyName: string): Machine =>
  ({
    id: slug,
    slug,
    name: slug.toUpperCase(),
    family: { id: familySlug, slug: familySlug, name: familyName } as unknown as MachineFamily,
    image: makeMedia(`/${slug}.png`),
    specs: [
      { label: 'Height', value: '78"' },
      { label: 'Width', value: '41"' },
      { label: 'Capacity', value: '120' },
      { label: 'Ignored fourth', value: 'x' },
    ],
    updatedAt: '',
    createdAt: '',
  }) as unknown as Machine

const render_ = async (props: Record<string, unknown> = {}) => {
  const ui = await MachineModelsServer({
    blockType: 'machineModels',
    heading: 'Every model we build',
    ...props,
  } as never)
  return ui
}

describe('MachineModelsServer', () => {
  afterEach(() => {
    cleanup()
    find.mockReset()
  })

  it('builds each URL from the card’s own family, not an ambient one', async () => {
    find.mockResolvedValue({
      docs: [machine('a-10', 'alpha', 'Alpha Series'), machine('z-1', 'zeta', 'Zeta Series')],
    })

    render((await render_()) as React.ReactElement)

    expect(screen.getByRole('link', { name: /A-10/ })).toHaveAttribute(
      'href',
      '/machines/alpha/a-10',
    )
    expect(screen.getByRole('link', { name: /Z-1/ })).toHaveAttribute('href', '/machines/zeta/z-1')
  })

  it('labels every card with its family, since the list is flat', async () => {
    find.mockResolvedValue({
      docs: [machine('a-10', 'alpha', 'Alpha Series'), machine('z-1', 'zeta', 'Zeta Series')],
    })

    render((await render_()) as React.ReactElement)

    expect(screen.getByText('Alpha Series')).toBeInTheDocument()
    expect(screen.getByText('Zeta Series')).toBeInTheDocument()
  })

  it('shows at most three specs per card', async () => {
    find.mockResolvedValue({ docs: [machine('a-10', 'alpha', 'Alpha Series')] })

    render((await render_()) as React.ReactElement)

    expect(screen.getByText('Capacity')).toBeInTheDocument()
    expect(screen.queryByText('Ignored fourth')).not.toBeInTheDocument()
  })

  it('narrows to one line when the editor picks a family', async () => {
    find.mockResolvedValue({
      docs: [machine('a-10', 'alpha', 'Alpha Series'), machine('z-1', 'zeta', 'Zeta Series')],
    })

    render((await render_({ family: 'alpha' })) as React.ReactElement)

    expect(screen.getByText('Alpha Series')).toBeInTheDocument()
    expect(screen.queryByText('Zeta Series')).not.toBeInTheDocument()
  })

  it('renders nothing rather than an empty carousel', async () => {
    find.mockResolvedValue({ docs: [] })
    expect(await render_()).toBeNull()
  })
})

describe('MachineModels structured data', () => {
  afterEach(() => {
    cleanup()
    find.mockReset()
  })

  it('emits an ItemList of Products so generative engines can cite the catalogue', async () => {
    find.mockResolvedValue({ docs: [machine('a-10', 'alpha', 'Alpha Series')] })

    const { container } = render((await render_()) as React.ReactElement)
    const script = container.querySelector('script[type="application/ld+json"]')
    const data = JSON.parse(script?.textContent ?? '{}')

    expect(data['@type']).toBe('ItemList')
    expect(data.itemListElement).toHaveLength(1)
    const product = data.itemListElement[0].item
    expect(product['@type']).toBe('Product')
    expect(product.name).toBe('A-10')
    expect(product.url).toContain('/machines/alpha/a-10')
    expect(product.additionalProperty).toHaveLength(3)
  })
})
