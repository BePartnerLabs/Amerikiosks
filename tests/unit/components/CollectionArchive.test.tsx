import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/components/Card', () => ({
  Card: ({ doc, featured }: { doc: { title: string }; featured?: boolean }) => (
    <div data-testid={featured ? 'featured-card' : 'card'}>{doc.title}</div>
  ),
}))

import { CollectionArchive } from '@/components/CollectionArchive'

describe('CollectionArchive', () => {
  afterEach(cleanup)

  it('renders nothing when posts is empty', () => {
    const { container } = render(<CollectionArchive posts={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the first post as featured', () => {
    render(
      <CollectionArchive posts={[{ title: 'First' } as never, { title: 'Second' } as never]} />,
    )
    expect(screen.getByTestId('featured-card')).toHaveTextContent('First')
  })

  it('renders the remaining posts in the grid', () => {
    render(
      <CollectionArchive
        posts={[
          { title: 'First' } as never,
          { title: 'Second' } as never,
          { title: 'Third' } as never,
        ]}
      />,
    )
    const cards = screen.getAllByTestId('card')
    expect(cards).toHaveLength(2)
    expect(cards[0]).toHaveTextContent('Second')
    expect(cards[1]).toHaveTextContent('Third')
  })

  it('does not render the grid wrapper when there is only one post', () => {
    const { container } = render(<CollectionArchive posts={[{ title: 'Only' } as never]} />)
    expect(container.querySelector('.ak-collection-archive__grid')).toBeNull()
  })
})
