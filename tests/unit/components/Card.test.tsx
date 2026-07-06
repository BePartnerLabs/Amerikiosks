import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/components/Media', () => ({
  Media: ({ resource }: { resource?: { url?: string } }) => (
    <div data-testid="media">{resource?.url}</div>
  ),
}))

import { Card } from '@/components/Card'

describe('Card (post variant)', () => {
  afterEach(cleanup)

  it('renders the title as a link to /insights/[slug]', () => {
    render(
      <Card
        relationTo="insights"
        doc={{ slug: 'my-post', title: 'My Post', meta: {} } as never}
      />,
    )
    expect(screen.getByRole('heading', { name: 'My Post' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'My Post' })).toHaveAttribute(
      'href',
      '/insights/my-post',
    )
  })

  it('renders the meta description', () => {
    render(
      <Card
        relationTo="insights"
        doc={{ slug: 'my-post', title: 'My Post', meta: { description: 'A great post' } } as never}
      />,
    )
    expect(screen.getByText('A great post')).toBeInTheDocument()
  })

  it('renders a placeholder when there is no meta image', () => {
    const { container } = render(
      <Card
        relationTo="insights"
        doc={{ slug: 'my-post', title: 'My Post', meta: {} } as never}
      />,
    )
    expect(container.querySelector('.ak-post-card__placeholder')).not.toBeNull()
  })

  it('renders Media when a meta image is populated', () => {
    render(
      <Card
        relationTo="insights"
        doc={
          {
            slug: 'my-post',
            title: 'My Post',
            meta: { image: { id: 1, url: '/cover.jpg' } },
          } as never
        }
      />,
    )
    expect(screen.getByTestId('media')).toHaveTextContent('/cover.jpg')
  })

  it('adds the featured modifier class when featured is true', () => {
    const { container } = render(
      <Card
        relationTo="insights"
        featured
        doc={{ slug: 'my-post', title: 'My Post', meta: {} } as never}
      />,
    )
    expect(container.querySelector('.ak-post-card--featured')).not.toBeNull()
  })
})

describe('Card (manual variants)', () => {
  afterEach(cleanup)

  it('renders an icon card with its icon and title', () => {
    render(
      <Card
        variant="icon"
        icon="inventory_2"
        title="High Capacity"
      />,
    )
    expect(screen.getByText('inventory_2')).toBeInTheDocument()
    expect(screen.getByText('High Capacity')).toBeInTheDocument()
  })

  it('renders a pillar card eyebrow only for the pillar variant', () => {
    render(
      <Card
        variant="pillar"
        eyebrow="PLACEMENT"
        title="Place with intent"
      />,
    )
    expect(screen.getByText('PLACEMENT')).toBeInTheDocument()
  })

  it('does not render the eyebrow for a non-pillar variant', () => {
    render(
      <Card
        variant="icon"
        eyebrow="PLACEMENT"
        icon="star"
        title="Place with intent"
      />,
    )
    expect(screen.queryByText('PLACEMENT')).toBeNull()
  })

  it('renders a link with label and arrow for icon variant when link is provided', () => {
    render(
      <Card
        variant="icon"
        icon="star"
        title="Explore"
        link={{ href: '/explore', label: 'Learn more' }}
      />,
    )
    expect(screen.getByRole('link', { name: /Learn more/ })).toHaveAttribute('href', '/explore')
  })

  it('adds the linked modifier class only for icon variant with a link', () => {
    const { container } = render(
      <Card
        variant="icon"
        icon="star"
        title="Explore"
        link={{ href: '/explore', label: 'Learn more' }}
      />,
    )
    expect(container.querySelector('.ak-card-grid__card--linked')).not.toBeNull()
  })

  it('renders body content when provided', () => {
    render(
      <Card
        variant="compact"
        title="Compact"
        body={<span data-testid="body">Body content</span>}
      />,
    )
    expect(screen.getByTestId('body')).toBeInTheDocument()
  })
})
