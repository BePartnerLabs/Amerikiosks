import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { SectionHeader } from '@/components/SectionHeader'

describe('SectionHeader', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders eyebrow, heading, and subtitle when all are provided', () => {
    render(
      <SectionHeader
        eyebrow="EYEBROW"
        heading="Heading text"
        subtitle="Subtitle text"
      />,
    )
    expect(screen.getByText('EYEBROW')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Heading text')
    expect(screen.getByText('Subtitle text')).toBeInTheDocument()
  })

  it('omits eyebrow and subtitle when not provided', () => {
    render(<SectionHeader heading="Just a heading" />)
    expect(screen.queryByText('EYEBROW')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Just a heading')
  })

  it('renders **marked** segments in the heading as <strong>', () => {
    render(<SectionHeader heading="The **right moment** does more." />)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('The right moment does more.')
    const strong = heading.querySelector('strong')
    expect(strong).not.toBeNull()
    expect(strong?.textContent).toBe('right moment')
  })
})
