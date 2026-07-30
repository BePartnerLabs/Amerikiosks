import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

// Resolved against the real es.json so the aria-label assertions below prove
// the Spanish string exists, not just that a key was looked up.
vi.mock('next-intl', async () => {
  const es = (await import('@/messages/es.json')).default as unknown as Record<
    string,
    Record<string, string>
  >
  return {
    useTranslations: (namespace: string) => (key: string, values?: Record<string, string>) => {
      let value = es[namespace]?.[key] ?? `${namespace}.${key}`
      for (const [name, replacement] of Object.entries(values ?? {})) {
        value = value.replace(`{${name}}`, replacement)
      }
      return value
    },
  }
})

import { type SocialLink, SocialLinks } from '@/components/SocialLinks'

afterEach(cleanup)

const links = [
  { id: '1', platform: 'instagram', url: 'https://www.instagram.com/amerikiosks' },
  { id: '2', platform: 'linkedin', url: 'https://www.linkedin.com/company/amerikiosks' },
] as SocialLink[]

describe('SocialLinks', () => {
  it('renders one link per profile', () => {
    render(
      <SocialLinks
        links={links}
        variant="footer"
      />,
    )

    expect(screen.getAllByRole('link')).toHaveLength(2)
    // Localized now — the label used to be a hardcoded English template.
    expect(screen.getByLabelText('Amerikiosks en Instagram')).toHaveAttribute(
      'href',
      'https://www.instagram.com/amerikiosks',
    )
  })

  it('opens profiles in a new tab without leaking the referrer', () => {
    render(
      <SocialLinks
        links={links}
        variant="footer"
      />,
    )

    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
  })

  it('prefers the editor-supplied label over the generated one', () => {
    render(
      <SocialLinks
        links={[{ ...links[0], label: 'Seguinos en Instagram' }] as SocialLink[]}
        variant="footer"
      />,
    )

    expect(screen.getByLabelText('Seguinos en Instagram')).toBeInTheDocument()
  })

  it('renders nothing when there are no profiles', () => {
    const { container } = render(
      <SocialLinks
        links={[]}
        variant="footer"
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('skips rows the editor left half-filled', () => {
    render(
      <SocialLinks
        links={[links[0], { id: '3', platform: 'linkedin' }] as SocialLink[]}
        variant="footer"
      />,
    )

    expect(screen.getAllByRole('link')).toHaveLength(1)
  })
})
