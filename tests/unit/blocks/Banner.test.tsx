import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/components/RichText', () => ({
  default: ({ data }: { data: unknown }) => (
    <div data-testid="richtext">{JSON.stringify(data)}</div>
  ),
}))

import { BannerBlock } from '@/blocks/Banner/Component'

const content = {
  root: { type: 'root', children: [], direction: null, format: '' as const, indent: 0, version: 1 },
}

describe('BannerBlock', () => {
  afterEach(cleanup)

  it('renders the richText content', () => {
    render(
      <BannerBlock
        blockType="banner"
        content={content}
        style="info"
      />,
    )
    expect(screen.getByTestId('richtext')).toBeInTheDocument()
  })

  it('applies the style modifier class', () => {
    const { container } = render(
      <BannerBlock
        blockType="banner"
        content={content}
        style="error"
      />,
    )
    expect(container.querySelector('.ak-banner--error')).not.toBeNull()
  })

  it('defaults to the "info" style when style is absent', () => {
    const { container } = render(
      <BannerBlock
        blockType="banner"
        content={content}
        style={undefined as never}
      />,
    )
    expect(container.querySelector('.ak-banner--info')).not.toBeNull()
  })
})
