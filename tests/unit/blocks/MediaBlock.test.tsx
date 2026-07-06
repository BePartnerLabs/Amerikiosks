import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/components/Media', () => ({
  Media: ({ resource }: { resource?: { url?: string } | null }) => (
    <div data-testid="media">{resource?.url}</div>
  ),
}))

vi.mock('@/components/RichText', () => ({
  default: ({ data }: { data: unknown }) => (
    <div data-testid="richtext">{JSON.stringify(data)}</div>
  ),
}))

import { MediaBlock } from '@/blocks/MediaBlock/Component'

describe('MediaBlock', () => {
  afterEach(cleanup)

  it('renders Media when a media resource is provided', () => {
    render(
      <MediaBlock
        blockType="mediaBlock"
        media={{ id: 1, url: '/image.jpg' } as never}
      />,
    )
    expect(screen.getByTestId('media')).toHaveTextContent('/image.jpg')
  })

  it('renders nothing for media/caption when media is absent', () => {
    const { container } = render(
      <MediaBlock
        blockType="mediaBlock"
        media={null as never}
      />,
    )
    expect(container.querySelector('.ak-media-block__media')).toBeNull()
    expect(container.querySelector('.ak-media-block__caption')).toBeNull()
  })

  it('renders the caption when the populated media object has one', () => {
    render(
      <MediaBlock
        blockType="mediaBlock"
        media={
          {
            id: 1,
            url: '/image.jpg',
            caption: {
              root: {
                type: 'root',
                children: [],
                direction: null,
                format: '',
                indent: 0,
                version: 1,
              },
            },
          } as never
        }
      />,
    )
    expect(screen.getByTestId('richtext')).toBeInTheDocument()
  })

  it('renders Media when only a staticImage is provided', () => {
    render(
      <MediaBlock
        blockType="mediaBlock"
        media={null as never}
        staticImage={{ src: '/static.jpg', width: 10, height: 10 } as never}
      />,
    )
    expect(screen.getByTestId('media')).toBeInTheDocument()
  })
})
