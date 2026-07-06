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

import { CallToActionBlock } from '@/blocks/CallToAction/Component'

const richText = {
  root: { type: 'root', children: [], direction: null, format: '' as const, indent: 0, version: 1 },
}

describe('CallToActionBlock', () => {
  afterEach(cleanup)

  it('renders richText content', () => {
    render(
      <CallToActionBlock
        blockType="cta"
        richText={richText}
      />,
    )
    expect(screen.getByTestId('richtext')).toBeInTheDocument()
  })

  it('does not render richText wrapper when richText is absent', () => {
    const { container } = render(<CallToActionBlock blockType="cta" />)
    expect(container.querySelector('.ak-cta__text')).toBeNull()
  })

  it('renders each link as a CMSLink', () => {
    render(
      <CallToActionBlock
        blockType="cta"
        links={[
          { link: { label: 'Contact Sales', url: '/contact', type: 'custom' } },
          { link: { label: 'Learn More', url: '/learn', type: 'custom' } },
        ]}
      />,
    )
    expect(screen.getByRole('link', { name: 'Contact Sales' })).toHaveAttribute('href', '/contact')
    expect(screen.getByRole('link', { name: 'Learn More' })).toHaveAttribute('href', '/learn')
  })

  it('does not render the actions wrapper when there are no links', () => {
    const { container } = render(<CallToActionBlock blockType="cta" />)
    expect(container.querySelector('.ak-cta__actions')).toBeNull()
  })

  it('uses blockName as the section aria-label when provided', () => {
    render(
      <CallToActionBlock
        blockType="cta"
        blockName="Closing CTA"
      />,
    )
    expect(screen.getByRole('region', { name: 'Closing CTA' })).toBeInTheDocument()
  })

  it('falls back to "Call to action" as aria-label when blockName is absent', () => {
    render(<CallToActionBlock blockType="cta" />)
    expect(screen.getByRole('region', { name: 'Call to action' })).toBeInTheDocument()
  })
})
