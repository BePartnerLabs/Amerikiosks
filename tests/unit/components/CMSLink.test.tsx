import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { CMSLink } from '@/components/Link'

describe('CMSLink', () => {
  afterEach(cleanup)

  it('renders nothing when there is no resolvable href', () => {
    const { container } = render(<CMSLink label="Broken" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a custom URL link with the label', () => {
    render(
      <CMSLink
        type="custom"
        url="/contact"
        label="Contact"
      />,
    )
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact')
  })

  it('resolves a reference to a page without a relationTo path prefix', () => {
    render(
      <CMSLink
        type="reference"
        reference={{ relationTo: 'pages', value: { slug: 'for-brands' } as never }}
        label="For Brands"
      />,
    )
    expect(screen.getByRole('link', { name: 'For Brands' })).toHaveAttribute('href', '/for-brands')
  })

  it('resolves a reference to an insight with the /insights path prefix', () => {
    render(
      <CMSLink
        type="reference"
        reference={{ relationTo: 'insights', value: { slug: 'my-post' } as never }}
        label="My Post"
      />,
    )
    expect(screen.getByRole('link', { name: 'My Post' })).toHaveAttribute(
      'href',
      '/insights/my-post',
    )
  })

  it('applies target=_blank and rel when newTab is true', () => {
    render(
      <CMSLink
        type="custom"
        url="/x"
        label="External"
        newTab
      />,
    )
    const linkEl = screen.getByRole('link', { name: 'External' })
    expect(linkEl).toHaveAttribute('target', '_blank')
    expect(linkEl).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('uses a plain (unstyled) link for appearance "inline"', () => {
    render(
      <CMSLink
        type="custom"
        url="/x"
        label="Plain"
        appearance="inline"
      />,
    )
    expect(screen.getByRole('link', { name: 'Plain' }).className).toBe('')
  })

  it('applies the primary button class for appearance "default"', () => {
    render(
      <CMSLink
        type="custom"
        url="/x"
        label="Primary"
        appearance="default"
      />,
    )
    expect(screen.getByRole('link', { name: 'Primary' }).className).toContain('bp-btn--primary')
  })

  it('applies the outline button class for appearance "outline"', () => {
    render(
      <CMSLink
        type="custom"
        url="/x"
        label="Outline"
        appearance="outline"
      />,
    )
    expect(screen.getByRole('link', { name: 'Outline' }).className).toContain('bp-btn--outline')
  })

  it('appends a custom className alongside the button class', () => {
    render(
      <CMSLink
        type="custom"
        url="/x"
        label="Styled"
        appearance="default"
        className="extra-class"
      />,
    )
    expect(screen.getByRole('link', { name: 'Styled' }).className).toContain('extra-class')
  })
})
