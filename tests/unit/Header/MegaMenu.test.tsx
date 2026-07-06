import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MegaMenu } from '@/Header/Nav/MegaMenu'

describe('MegaMenu', () => {
  afterEach(cleanup)

  it('renders the left panel content', () => {
    render(
      <MegaMenu
        id="mega-1"
        data={
          {
            panelLabel: 'SOLUTIONS',
            panelHeadline: 'Retail automation for every space',
            panelDescription: 'Choose the right format for your venue.',
            items: [],
          } as never
        }
      />,
    )
    expect(screen.getByText('SOLUTIONS')).toBeInTheDocument()
    expect(screen.getByText('Retail automation for every space')).toBeInTheDocument()
    expect(screen.getByText('Choose the right format for your venue.')).toBeInTheDocument()
  })

  it('resolves a custom URL link', () => {
    render(
      <MegaMenu
        id="mega-1"
        data={
          {
            panelLabel: 'SOLUTIONS',
            panelHeadline: 'Headline',
            items: [{ id: '1', title: 'Contact', link: { type: 'custom', url: '/contact' } }],
          } as never
        }
      />,
    )
    expect(screen.getByRole('link', { name: /Contact/ })).toHaveAttribute('href', '/contact')
  })

  it('resolves a reference link to a page by slug', () => {
    render(
      <MegaMenu
        id="mega-1"
        data={
          {
            panelLabel: 'SOLUTIONS',
            panelHeadline: 'Headline',
            items: [
              {
                id: '1',
                title: 'For Brands',
                link: {
                  type: 'reference',
                  reference: { relationTo: 'pages', value: { slug: 'for-brands' } },
                },
              },
            ],
          } as never
        }
      />,
    )
    expect(screen.getByRole('link', { name: /For Brands/ })).toHaveAttribute('href', '/for-brands')
  })

  it('resolves a reference link to an insight under /posts', () => {
    render(
      <MegaMenu
        id="mega-1"
        data={
          {
            panelLabel: 'SOLUTIONS',
            panelHeadline: 'Headline',
            items: [
              {
                id: '1',
                title: 'Case Study',
                link: {
                  type: 'reference',
                  reference: { relationTo: 'insights', value: { slug: 'my-post' } },
                },
              },
            ],
          } as never
        }
      />,
    )
    expect(screen.getByRole('link', { name: /Case Study/ })).toHaveAttribute(
      'href',
      '/posts/my-post',
    )
  })

  it('falls back to "#" when the link is missing', () => {
    render(
      <MegaMenu
        id="mega-1"
        data={
          {
            panelLabel: 'SOLUTIONS',
            panelHeadline: 'Headline',
            items: [{ id: '1', title: 'Broken', link: undefined as never }],
          } as never
        }
      />,
    )
    expect(screen.getByRole('link', { name: /Broken/ })).toHaveAttribute('href', '#')
  })

  it('opens custom links with newTab in a new tab', () => {
    render(
      <MegaMenu
        id="mega-1"
        data={
          {
            panelLabel: 'SOLUTIONS',
            panelHeadline: 'Headline',
            items: [
              { id: '1', title: 'External', link: { type: 'custom', url: '/x', newTab: true } },
            ],
          } as never
        }
      />,
    )
    expect(screen.getByRole('link', { name: /External/ })).toHaveAttribute('target', '_blank')
  })

  it('renders right panel title/subtitle when provided', () => {
    render(
      <MegaMenu
        id="mega-1"
        data={
          {
            panelLabel: 'SOLUTIONS',
            panelHeadline: 'Headline',
            rightTitle: 'Featured',
            rightSubtitle: 'Our top pick',
            items: [],
          } as never
        }
      />,
    )
    expect(screen.getByText('Featured')).toBeInTheDocument()
    expect(screen.getByText('Our top pick')).toBeInTheDocument()
  })
})
