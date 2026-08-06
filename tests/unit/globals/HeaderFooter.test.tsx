import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/script', () => ({
  default: (props: React.ComponentPropsWithoutRef<'script'>) => {
    const { id, dangerouslySetInnerHTML, ...rest } = props
    return (
      <script
        id={id}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: test-only passthrough of a mocked component's own prop
        dangerouslySetInnerHTML={dangerouslySetInnerHTML}
        {...rest}
      />
    )
  },
}))

vi.mock('next-intl/server', () => ({
  getLocale: vi.fn().mockResolvedValue('en'),
}))

const getCachedGlobal = vi.fn()
vi.mock('@/utilities/getGlobals', () => ({ getCachedGlobal }))

vi.mock('@/Header/Component.client', () => ({
  HeaderClient: ({ data }: { data: { navItems?: unknown[] } }) => (
    <div data-testid="header-client">{JSON.stringify(data)}</div>
  ),
}))

vi.mock('@/Footer/FooterContent', () => ({
  FooterContent: ({ footer }: { footer: unknown }) => (
    <div data-testid="footer-content">{JSON.stringify(footer)}</div>
  ),
}))

describe('Header', () => {
  afterEach(() => {
    cleanup()
    getCachedGlobal.mockReset()
  })

  it('fetches the header global for the current locale and renders HeaderClient', async () => {
    const headerData = { navItems: [{ id: '1' }] }
    getCachedGlobal.mockReturnValue(() => Promise.resolve(headerData))

    const { Header } = await import('@/Header/Component')
    const ui = await Header()
    render(ui)

    // Depth 2, not 1: a nav item can open a form whose richText links to another
    // page, and at depth 1 that nested link stays a bare id — which throws in
    // RichText and takes down every page, since the header is in the root layout.
    expect(getCachedGlobal).toHaveBeenCalledWith('header', 2, 'en')
    expect(screen.getByTestId('header-client')).toHaveTextContent('"1"')
  })

  it('renders a SiteNavigationElement JSON-LD script', async () => {
    getCachedGlobal.mockReturnValue(() => Promise.resolve({}))

    const { Header } = await import('@/Header/Component')
    const ui = await Header()
    const { container } = render(ui)

    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).not.toBeNull()
    const data = JSON.parse((script as Element).innerHTML)
    expect(data['@type']).toBe('SiteNavigationElement')
  })
})

describe('Footer', () => {
  afterEach(() => {
    cleanup()
    getCachedGlobal.mockReset()
  })

  it('fetches the footer global for the current locale and renders FooterContent', async () => {
    const footerData = { columns: [] }
    getCachedGlobal.mockReturnValue(() => Promise.resolve(footerData))

    const { Footer } = await import('@/Footer/Component')
    const ui = await Footer()
    render(ui)

    expect(getCachedGlobal).toHaveBeenCalledWith('footer', 1, 'en')
    expect(screen.getByTestId('footer-content')).toBeInTheDocument()
  })

  it('falls back to an empty object when the footer global is null', async () => {
    getCachedGlobal.mockReturnValue(() => Promise.resolve(null))

    const { Footer } = await import('@/Footer/Component')
    const ui = await Footer()
    render(ui)

    expect(screen.getByTestId('footer-content')).toHaveTextContent('{}')
  })
})
