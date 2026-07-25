import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { StatementBlock } from '@/blocks/Statement/Component'

describe('StatementBlock', () => {
  afterEach(cleanup)

  it('renders the statement text', () => {
    render(
      <StatementBlock
        blockType="statement"
        statement="The right brand, in the right place, at the right moment."
      />,
    )
    expect(
      screen.getByText('The right brand, in the right place, at the right moment.'),
    ).toBeInTheDocument()
  })

  it('renders bold segments as <strong>', () => {
    render(
      <StatementBlock
        blockType="statement"
        statement="The right **brand**, in the right **place**."
      />,
    )
    expect(screen.getByText('brand').tagName).toBe('STRONG')
    expect(screen.getByText('place').tagName).toBe('STRONG')
  })

  it('renders the eyebrow when provided', () => {
    render(
      <StatementBlock
        blockType="statement"
        eyebrow="Our Philosophy"
        statement="Statement text."
      />,
    )
    expect(screen.getByText('Our Philosophy')).toBeInTheDocument()
  })

  it('does not render an eyebrow when absent', () => {
    const { container } = render(
      <StatementBlock
        blockType="statement"
        statement="Statement text."
      />,
    )
    expect(container.querySelector('.ak-section-header__eyebrow')).toBeNull()
  })

  it('renders the subheading when provided', () => {
    render(
      <StatementBlock
        blockType="statement"
        statement="Statement text."
        subheading="Supporting line."
      />,
    )
    expect(screen.getByText('Supporting line.')).toBeInTheDocument()
  })

  it('renders nothing when statement is absent', () => {
    const { container } = render(
      <StatementBlock
        blockType="statement"
        statement={undefined as never}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('uses blockName as the section aria-label when provided', () => {
    render(
      <StatementBlock
        blockType="statement"
        blockName="Brand Philosophy"
        statement="Statement text."
      />,
    )
    expect(screen.getByRole('region', { name: 'Brand Philosophy' })).toBeInTheDocument()
  })

  it('falls back to the eyebrow as aria-label when blockName is absent', () => {
    render(
      <StatementBlock
        blockType="statement"
        eyebrow="Our Philosophy"
        statement="Statement text."
      />,
    )
    expect(screen.getByRole('region', { name: 'Our Philosophy' })).toBeInTheDocument()
  })
})
