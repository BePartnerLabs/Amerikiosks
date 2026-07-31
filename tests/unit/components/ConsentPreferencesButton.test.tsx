import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key,
}))

import { ConsentPreferencesButton } from '@/components/ConsentBanner/ConsentPreferencesButton'

describe('ConsentPreferencesButton', () => {
  afterEach(cleanup)

  it('renders a button with the reopen aria-label', () => {
    render(<ConsentPreferencesButton onClick={() => {}} />)
    expect(screen.getByRole('button', { name: 'reopenAriaLabel' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<ConsentPreferencesButton onClick={onClick} />)
    fireEvent.click(screen.getByRole('button', { name: 'reopenAriaLabel' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
