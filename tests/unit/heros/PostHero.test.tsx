import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PostHero } from '@/heros/PostHero'
import type { Insight } from '@/payload-types'

vi.mock('@/components/Media', () => ({
  Media: ({ resource }: { resource: { url?: string } }) => (
    <div data-testid="media">{resource?.url}</div>
  ),
}))

const basePost = {
  id: 1,
  title: 'My Insight',
  categories: [],
  populatedAuthors: [],
  publishedAt: null,
  heroImage: null,
} as unknown as Insight

describe('PostHero', () => {
  afterEach(cleanup)

  it('renders the title', () => {
    render(<PostHero post={basePost} />)
    expect(screen.getByRole('heading', { level: 1, name: 'My Insight' })).toBeInTheDocument()
  })

  it('renders comma-separated category titles', () => {
    const { container } = render(
      <PostHero
        post={
          {
            ...basePost,
            categories: [
              { id: 'c1', title: 'Retail' },
              { id: 'c2', title: 'Brands' },
            ],
          } as unknown as Insight
        }
      />,
    )
    expect(container.textContent).toContain('Retail')
    expect(container.textContent).toContain('Brands')
  })

  it('does not render an authors section when there are no authors', () => {
    render(<PostHero post={basePost} />)
    expect(screen.queryByText('Author')).not.toBeInTheDocument()
  })

  it('renders formatted authors when present', () => {
    render(
      <PostHero
        post={
          {
            ...basePost,
            populatedAuthors: [{ name: 'Ada' }, { name: 'Grace' }],
          } as unknown as Insight
        }
      />,
    )
    expect(screen.getByText('Author')).toBeInTheDocument()
    expect(screen.getByText('Ada and Grace')).toBeInTheDocument()
  })

  it('renders the formatted publish date when present', () => {
    render(<PostHero post={{ ...basePost, publishedAt: '2026-03-05T12:00:00' } as Insight} />)
    expect(screen.getByText('03/05/2026')).toBeInTheDocument()
  })

  it('renders the hero image via Media when present', () => {
    render(
      <PostHero
        post={{ ...basePost, heroImage: { id: 1, url: '/hero.jpg' } } as unknown as Insight}
      />,
    )
    expect(screen.getByTestId('media')).toHaveTextContent('/hero.jpg')
  })
})
