import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const refresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

import { ConsentManager } from '@/components/ConsentBanner/ConsentManager'

function getCookieValue(name: string): string | undefined {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=')
}

describe('ConsentManager', () => {
  afterEach(() => {
    cleanup()
    refresh.mockClear()
    document.cookie = 'ak_consent=; path=/; max-age=0'
  })

  it('shows the banner and no floating button when there is no prior consent', () => {
    render(<ConsentManager initialConsent={null} />)
    expect(screen.getByRole('region', { name: 'ariaLabel' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'reopenAriaLabel' })).not.toBeInTheDocument()
  })

  it('shows the floating button and no banner when consent was already decided', () => {
    render(
      <ConsentManager
        initialConsent={{ analytics: true, timestamp: '2026-01-01T00:00:00.000Z' }}
      />,
    )
    expect(screen.queryByRole('region', { name: 'ariaLabel' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'reopenAriaLabel' })).toBeInTheDocument()
  })

  it('writes an accepted consent cookie and refreshes the router on "accept all"', () => {
    render(<ConsentManager initialConsent={null} />)
    fireEvent.click(screen.getByRole('button', { name: 'acceptAll' }))

    const raw = getCookieValue('ak_consent')
    expect(raw).toBeDefined()
    expect(JSON.parse(decodeURIComponent(raw as string)).analytics).toBe(true)
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('writes a rejected consent cookie on "reject"', () => {
    render(<ConsentManager initialConsent={null} />)
    fireEvent.click(screen.getByRole('button', { name: 'reject' }))

    const raw = getCookieValue('ak_consent')
    expect(JSON.parse(decodeURIComponent(raw as string)).analytics).toBe(false)
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('expands to preferences, toggles analytics off, and saves that choice', () => {
    render(<ConsentManager initialConsent={null} />)
    fireEvent.click(screen.getByRole('button', { name: 'preferences' }))
    fireEvent.click(screen.getByRole('switch', { name: 'analyticsLabel' }))
    fireEvent.click(screen.getByRole('button', { name: 'save' }))

    const raw = getCookieValue('ak_consent')
    expect(JSON.parse(decodeURIComponent(raw as string)).analytics).toBe(false)
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('reopens the banner in expanded mode when the floating button is clicked', () => {
    render(
      <ConsentManager
        initialConsent={{ analytics: false, timestamp: '2026-01-01T00:00:00.000Z' }}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'reopenAriaLabel' }))

    expect(screen.getByRole('region', { name: 'ariaLabel' })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'analyticsLabel' })).toBeInTheDocument()
  })
})
