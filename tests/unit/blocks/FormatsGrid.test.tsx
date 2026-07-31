import { cleanup, render, screen } from '@testing-library/react'
import type React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FormatsGridBlock } from '@/blocks/FormatsGrid/Component'
import type { FormatsGridBlock as FormatsGridBlockType, Machine, Media } from '@/payload-types'

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

const makeMedia = (url: string): Media =>
  ({ id: url, url, alt: 'machine image', updatedAt: '', createdAt: '' }) as unknown as Media

const makeMachine = (slug: string, name: string): Machine =>
  ({
    id: slug,
    slug,
    name,
    tagline: `${name} tagline`,
    image: makeMedia(`/${slug}.jpg`),
    tags: [{ label: 'full-size', id: 't1' }],
    family: { id: 'fam-1', slug: 'gamma', name: 'Gamma' },
    layout: [],
    updatedAt: '',
    createdAt: '',
  }) as unknown as Machine

const base: FormatsGridBlockType & { resolvedMachines: Machine[] } = {
  blockType: 'formatsGrid',
  blockName: 'Formats Grid',
  id: 'fg-1',
  heading: 'Formats built around your brand moment.',
  eyebrow: 'FORMATS',
  resolvedMachines: [
    makeMachine('full-size', 'Full-size branded machine'),
    makeMachine('compact', 'Compact footprint machine'),
  ],
}

describe('FormatsGridBlock', () => {
  afterEach(cleanup)

  it('renders section landmark with aria-label from heading', () => {
    render(<FormatsGridBlock {...base} />)
    expect(screen.getByRole('region', { name: /formats built/i })).toBeInTheDocument()
  })

  it('renders heading', () => {
    render(<FormatsGridBlock {...base} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Formats built around your brand moment.',
    )
  })

  it('renders eyebrow text', () => {
    render(<FormatsGridBlock {...base} />)
    expect(screen.getByText('FORMATS')).toBeInTheDocument()
  })

  it('renders a card link for each machine', () => {
    render(<FormatsGridBlock {...base} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', '/machines/gamma/full-size')
    expect(links[1]).toHaveAttribute('href', '/machines/gamma/compact')
  })

  it('renders machine name as card title', () => {
    render(<FormatsGridBlock {...base} />)
    expect(screen.getByText('Full-size branded machine')).toBeInTheDocument()
    expect(screen.getByText('Compact footprint machine')).toBeInTheDocument()
  })

  it('renders images with machine name as alt text', () => {
    render(<FormatsGridBlock {...base} />)
    const imgs = screen.getAllByRole('img')
    expect(imgs[0]).toHaveAttribute('alt', 'Full-size branded machine')
    expect(imgs[1]).toHaveAttribute('alt', 'Compact footprint machine')
  })

  it('renders GA4 attributes on block root', () => {
    const { container } = render(<FormatsGridBlock {...base} />)
    const section = container.querySelector('section')
    expect(section?.getAttribute('data-ga-block')).toBe('formats_grid')
    expect(section?.getAttribute('data-ga-section')).toBe('Formats Grid')
  })

  it('renders ga-event on each card link', () => {
    render(<FormatsGridBlock {...base} />)
    const links = screen.getAllByRole('link')
    for (const link of links) {
      expect(link.getAttribute('data-ga-event')).toBe('machine_card_click')
    }
  })

  it('renders nothing when heading is missing', () => {
    const { container } = render(
      <FormatsGridBlock
        {...base}
        heading={undefined as unknown as string}
      />,
    )
    expect(container.firstChild).toBeNull()
  })
})
