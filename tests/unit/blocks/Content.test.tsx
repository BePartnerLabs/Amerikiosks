import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/components/Link', () => ({
  CMSLink: ({ label, url }: { label?: string; url?: string }) => <a href={url}>{label}</a>,
}))

vi.mock('@/components/RichText', () => ({
  default: ({ data }: { data: unknown }) => (
    <div data-testid="richtext">{JSON.stringify(data)}</div>
  ),
}))

import { ContentBlock } from '@/blocks/Content/Component'

const richText = {
  root: { type: 'root', children: [], direction: null, format: '' as const, indent: 0, version: 1 },
}

describe('ContentBlock', () => {
  afterEach(cleanup)

  it('renders nothing extra when there are no columns', () => {
    const { container } = render(<ContentBlock blockType="content" />)
    expect(container.querySelectorAll('.ak-content__col')).toHaveLength(0)
  })

  it('renders one column per entry with the correct size class', () => {
    const { container } = render(
      <ContentBlock
        blockType="content"
        columns={[
          { size: 'half', richText },
          { size: 'full', richText },
        ]}
      />,
    )
    const cols = container.querySelectorAll('.ak-content__col')
    expect(cols).toHaveLength(2)
    expect(cols[0]?.className).toContain('ak-content__col--half')
    expect(cols[1]?.className).toContain('ak-content__col--full')
  })

  it('renders richText inside each column when present', () => {
    render(
      <ContentBlock
        blockType="content"
        columns={[{ size: 'full', richText }]}
      />,
    )
    expect(screen.getByTestId('richtext')).toBeInTheDocument()
  })

  it('renders a CMSLink when enableLink is true', () => {
    render(
      <ContentBlock
        blockType="content"
        columns={[
          {
            size: 'full',
            enableLink: true,
            link: { label: 'Read more', url: '/more', type: 'custom' },
          },
        ]}
      />,
    )
    expect(screen.getByRole('link', { name: 'Read more' })).toHaveAttribute('href', '/more')
  })

  it('does not render a link when enableLink is false', () => {
    render(
      <ContentBlock
        blockType="content"
        columns={[{ size: 'full', enableLink: false }]}
      />,
    )
    expect(screen.queryByRole('link')).toBeNull()
  })
})
