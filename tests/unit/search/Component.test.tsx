import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key,
}))

vi.mock('@/utilities/useDebounce', () => ({
  useDebounce: (value: string) => value,
}))

import { Search } from '@/search/Component'

describe('Search', () => {
  afterEach(() => {
    cleanup()
    push.mockClear()
  })

  it('navigates to /search with no query on mount', () => {
    render(<Search />)
    expect(push).toHaveBeenCalledWith('/search')
  })

  it('navigates to /search?q=<value> when the input changes', () => {
    render(<Search />)
    fireEvent.change(screen.getByPlaceholderText('placeholder'), { target: { value: 'kiosk' } })
    expect(push).toHaveBeenCalledWith('/search?q=kiosk')
  })

  it('prevents default form submission', () => {
    render(<Search />)
    const form = screen.getByRole('button', { name: 'submit' }).closest('form') as HTMLFormElement
    const event = new Event('submit', { bubbles: true, cancelable: true })
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
    form.dispatchEvent(event)
    expect(preventDefaultSpy).toHaveBeenCalled()
  })
})
