import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { SimpleHero } from '@/heros/Simple'

const richText = (headingText: string, eyebrowText: string) => ({
  root: {
    type: 'root' as const,
    version: 1 as const,
    direction: null,
    format: '' as const,
    indent: 0,
    children: [
      {
        type: 'paragraph' as const,
        version: 1 as const,
        children: [{ type: 'text' as const, version: 1 as const, text: eyebrowText }],
      },
      {
        type: 'heading' as const,
        tag: 'h1' as const,
        version: 1 as const,
        children: [{ type: 'text' as const, version: 1 as const, text: headingText }],
      },
    ],
  },
})

describe('SimpleHero', () => {
  afterEach(() => cleanup())

  it('renders the richText heading', () => {
    render(
      <SimpleHero
        type="simple"
        richText={richText('Find the right kiosk for your space.', 'EXPLORE OUR MODELS')}
      />,
    )
    expect(
      screen.getByRole('heading', { level: 1, name: 'Find the right kiosk for your space.' }),
    ).toBeInTheDocument()
    expect(screen.getByText('EXPLORE OUR MODELS')).toBeInTheDocument()
  })

  it('renders tags when provided', () => {
    render(
      <SimpleHero
        type="simple"
        richText={richText('Title', 'Eyebrow')}
        tags={[{ label: 'Full Size', id: 'tag-1' }]}
      />,
    )
    expect(screen.getByText('Full Size')).toBeInTheDocument()
  })

  it('does not render a breadcrumb even if breadcrumbs are passed', () => {
    render(
      <SimpleHero
        type="simple"
        richText={richText('Title', 'Eyebrow')}
        breadcrumbs={[{ label: 'Machines', url: '/machines', id: 'bc-1' }]}
      />,
    )
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
  })
})
