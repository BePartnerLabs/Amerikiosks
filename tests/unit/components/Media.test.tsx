import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Media } from '@/components/Media'

describe('Media', () => {
  afterEach(cleanup)

  it('renders an image for a resource without a video mimeType', () => {
    const { container } = render(
      <Media
        resource={
          { id: 1, url: '/photo.jpg', mimeType: 'image/jpeg', width: 800, height: 600 } as never
        }
      />,
    )
    expect(container.querySelector('img')).not.toBeNull()
  })

  it('renders a video for a resource with a video mimeType', () => {
    const { container } = render(
      <Media resource={{ id: 1, filename: 'clip.mp4', mimeType: 'video/mp4' } as never} />,
    )
    expect(container.querySelector('video')).not.toBeNull()
  })

  it('wraps content in the given htmlElement with the className', () => {
    const { container } = render(
      <Media
        resource={
          { id: 1, url: '/photo.jpg', mimeType: 'image/jpeg', width: 800, height: 600 } as never
        }
        htmlElement="section"
        className="my-class"
      />,
    )
    const section = container.querySelector('section.my-class')
    expect(section).not.toBeNull()
  })

  it('renders without a wrapper element when htmlElement is null', () => {
    const { container } = render(
      <Media
        resource={
          { id: 1, url: '/photo.jpg', mimeType: 'image/jpeg', width: 800, height: 600 } as never
        }
        htmlElement={null}
      />,
    )
    expect(container.querySelector('div')).toBeNull()
    expect(container.querySelector('img')).not.toBeNull()
  })
})
