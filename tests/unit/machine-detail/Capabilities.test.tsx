import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Capabilities } from '@/app/(frontend)/[locale]/machines/[slug]/Capabilities'

describe('Capabilities', () => {
  afterEach(cleanup)

  it('renders heading and each bullet item', () => {
    render(
      <Capabilities
        capabilities={{
          heading: 'Built for scale. Designed for ease.',
          items: [
            { text: 'All-steel.' },
            { text: '22 touch screen.' },
            { text: 'Direct push slot.' },
          ],
        }}
        gallery={[]}
      />,
    )
    expect(screen.getByText('Built for scale. Designed for ease.')).toBeInTheDocument()
    expect(screen.getByText('All-steel.')).toBeInTheDocument()
    expect(screen.getByText('22 touch screen.')).toBeInTheDocument()
    expect(screen.getByText('Direct push slot.')).toBeInTheDocument()
  })

  it('does not render an eyebrow element', () => {
    const { container } = render(
      <Capabilities
        capabilities={{ heading: 'Heading', items: [{ text: 'Bullet.' }] }}
        gallery={[]}
      />,
    )
    expect(container.querySelector('.ak-machine-detail__capabilities-eyebrow')).toBeNull()
  })
})
