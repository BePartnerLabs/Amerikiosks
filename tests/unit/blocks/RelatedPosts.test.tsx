import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/components/Card', () => ({
  Card: ({ doc }: { doc: { id: number; title: string } }) => (
    <div data-testid="card">{doc.title}</div>
  ),
}))

vi.mock('@/components/RichText', () => ({
  default: ({ data }: { data: unknown }) => (
    <div data-testid="richtext">{JSON.stringify(data)}</div>
  ),
}))

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'

const introContent = {
  root: { type: 'root', children: [], direction: null, format: '' as const, indent: 0, version: 1 },
}

describe('RelatedPosts', () => {
  afterEach(cleanup)

  it('renders a Card for each doc', () => {
    render(
      <RelatedPosts
        docs={[{ id: 1, title: 'First' } as never, { id: 2, title: 'Second' } as never]}
      />,
    )
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('skips docs that are unpopulated string references', () => {
    render(<RelatedPosts docs={['some-id' as never, { id: 2, title: 'Second' } as never]} />)
    expect(screen.getAllByTestId('card')).toHaveLength(1)
  })

  it('renders nothing in the grid when docs is undefined', () => {
    const { container } = render(<RelatedPosts />)
    expect(container.querySelectorAll('[data-testid="card"]')).toHaveLength(0)
  })

  it('renders intro content when provided', () => {
    render(<RelatedPosts introContent={introContent} />)
    expect(screen.getByTestId('richtext')).toBeInTheDocument()
  })

  it('does not render the intro wrapper when introContent is absent', () => {
    const { container } = render(<RelatedPosts docs={[]} />)
    expect(container.querySelector('.ak-related-posts__intro')).toBeNull()
  })
})
