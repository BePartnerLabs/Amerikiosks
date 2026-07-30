import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CMSLink } from '@/components/Link'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@tanstack/react-query', () => ({
  useMutation: () => ({ mutate: vi.fn(), isPending: false, isSuccess: false, error: null }),
}))

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

  it('renders nothing for type "modal" when modalForm is not a resolved object', () => {
    const { container } = render(
      <CMSLink
        type="modal"
        modalForm={123 as never}
        label="Open"
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a trigger button wired to a matching popover drawer for type "modal"', () => {
    render(
      <CMSLink
        type="modal"
        modalForm={{ id: '1', fields: [], submitButtonLabel: 'Send' } as never}
        label="Start a Partnership"
      />,
    )
    const button = screen.getByRole('button', { name: 'Start a Partnership' })
    const popoverTarget = button.getAttribute('popovertarget')
    expect(popoverTarget).toBeTruthy()

    const drawer = document.getElementById(popoverTarget as string)
    expect(drawer).not.toBeNull()
    expect(drawer).toHaveAttribute('popover')
  })

  it('portals the drawer to document.body, isolated from ambient ancestor CSS', () => {
    render(
      <div className="ak-hero-home__content">
        <CMSLink
          type="modal"
          modalForm={{ id: '1', fields: [], submitButtonLabel: 'Send' } as never}
          label="Open"
        />
      </div>,
    )
    const button = screen.getByRole('button', { name: 'Open' })
    const drawer = document.getElementById(button.getAttribute('popovertarget') as string)
    expect(drawer?.closest('.ak-hero-home__content')).toBeNull()
    expect(drawer?.parentElement).toBe(document.body)
  })

  it('shows the linked form’s own title as the drawer heading', () => {
    render(
      <CMSLink
        type="modal"
        modalForm={
          { id: '1', title: 'Start a Partnership', fields: [], submitButtonLabel: 'Send' } as never
        }
        label="Open"
      />,
    )
    // A closed popover is excluded from the accessibility tree (getByRole
    // would fail here even though the markup is present) — assert by text.
    expect(screen.getByText('Start a Partnership').tagName).toBe('H2')
  })

  it('gives each modal CMSLink instance its own unique drawer id', () => {
    render(
      <>
        <CMSLink
          type="modal"
          modalForm={{ id: '1', fields: [], submitButtonLabel: 'Send' } as never}
          label="Open A"
        />
        <CMSLink
          type="modal"
          modalForm={{ id: '1', fields: [], submitButtonLabel: 'Send' } as never}
          label="Open B"
        />
      </>,
    )
    const targetA = screen.getByRole('button', { name: 'Open A' }).getAttribute('popovertarget')
    const targetB = screen.getByRole('button', { name: 'Open B' }).getAttribute('popovertarget')
    expect(targetA).not.toBe(targetB)
  })
})
