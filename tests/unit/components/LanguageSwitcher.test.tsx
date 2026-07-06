import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const replace = vi.fn()
let paramsValue: Record<string, string> = {}

vi.mock('next/navigation', () => ({
  useParams: () => paramsValue,
}))

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
}))

vi.mock('@/i18n/routing', () => ({
  useRouter: () => ({ replace }),
}))

const translateSlug = vi.fn()
vi.mock('@/repositories', () => ({
  PagesRepository: { translateSlug: (...args: unknown[]) => translateSlug(...args) },
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryFn, enabled }: { queryFn: () => unknown; enabled: boolean }) => {
    if (!enabled) return { data: undefined }
    queryFn()
    return { data: 'para-marcas' }
  },
}))

import { LanguageSwitcher } from '@/components/LanguageSwitcher'

describe('LanguageSwitcher', () => {
  afterEach(() => {
    cleanup()
    replace.mockClear()
    translateSlug.mockClear()
    paramsValue = {}
    window.history.replaceState({}, '', '/')
  })

  it('renders EN and ES toggle buttons with EN active by default', () => {
    render(<LanguageSwitcher />)
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'ES' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('does nothing when clicking the already-active locale', () => {
    render(<LanguageSwitcher />)
    screen.getByRole('button', { name: 'EN' }).click()
    expect(replace).not.toHaveBeenCalled()
  })

  it('navigates to the machines listing pathname when on /machines', () => {
    window.history.replaceState({}, '', '/machines')
    render(<LanguageSwitcher />)
    screen.getByRole('button', { name: 'ES' }).click()
    expect(replace).toHaveBeenCalledWith({ pathname: '/machines' }, { locale: 'es' })
  })

  it('navigates to the machine detail pathname with slug when on /machines/[slug]', () => {
    window.history.replaceState({}, '', '/machines/gamma-13')
    paramsValue = { slug: 'gamma-13' }
    render(<LanguageSwitcher />)
    screen.getByRole('button', { name: 'ES' }).click()
    expect(replace).toHaveBeenCalledWith(
      { pathname: '/machines/[slug]', params: { slug: 'gamma-13' } },
      { locale: 'es' },
    )
  })

  it('navigates to the translated slug pathname for a generic page', () => {
    window.history.replaceState({}, '', '/for-brands')
    paramsValue = { slug: 'for-brands' }
    render(<LanguageSwitcher />)
    screen.getByRole('button', { name: 'ES' }).click()
    expect(replace).toHaveBeenCalledWith('/para-marcas', { locale: 'es' })
  })

  it('navigates to "/" when the current page is home', () => {
    window.history.replaceState({}, '', '/')
    paramsValue = {}
    render(<LanguageSwitcher />)
    screen.getByRole('button', { name: 'ES' }).click()
    expect(replace).toHaveBeenCalledWith('/', { locale: 'es' })
  })
})
