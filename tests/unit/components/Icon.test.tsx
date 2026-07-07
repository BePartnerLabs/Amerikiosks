import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Icon } from '@/components/Icon'

describe('Icon', () => {
  afterEach(cleanup)

  it('renders an svg with the icon path for a known name', () => {
    const { container } = render(<Icon name="storefront" />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg?.querySelector('path')).not.toBeNull()
  })

  it('renders nothing for an unknown icon name', () => {
    const { container } = render(<Icon name="not-a-real-icon" />)
    expect(container.querySelector('svg')).toBeNull()
  })

  it('applies the size prop to width and height', () => {
    const { container } = render(
      <Icon
        name="star"
        size={40}
      />,
    )
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('40')
    expect(svg?.getAttribute('height')).toBe('40')
  })

  it('defaults to size 24 when no size is given', () => {
    const { container } = render(<Icon name="star" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('24')
  })

  it('forwards className to the svg element', () => {
    const { container } = render(
      <Icon
        name="star"
        className="my-icon"
      />,
    )
    expect(container.querySelector('svg.my-icon')).not.toBeNull()
  })
})
