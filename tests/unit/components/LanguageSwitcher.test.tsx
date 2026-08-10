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

vi.mock('@/i18n/navigation', () => ({
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

  // El listado dejó de ser ruta de código: ahora es un documento de `pages`, así
  // que sale por el flujo genérico de translate-slug como cualquier otra página.
  // Un caso especial aquí volvería a clavar un slug que el editor puede renombrar
  // desde /admin.
  it('translates the machines listing like any other page', () => {
    window.history.replaceState({}, '', '/machines')
    paramsValue = { slug: 'machines' }
    render(<LanguageSwitcher />)
    screen.getByRole('button', { name: 'ES' }).click()
    // Consulta el slug hermano en vez de asumirlo, que es lo que lo distingue
    // del caso especial que había antes. El valor sale del mock de useQuery.
    expect(translateSlug).toHaveBeenCalledWith('machines', 'en', 'es')
    expect(replace).toHaveBeenCalledWith('/para-marcas', { locale: 'es' })
  })

  it('navigates to the family pathname when on /machines/[family]', () => {
    window.history.replaceState({}, '', '/machines/gamma')
    paramsValue = { family: 'gamma' }
    render(<LanguageSwitcher />)
    screen.getByRole('button', { name: 'ES' }).click()
    expect(replace).toHaveBeenCalledWith(
      { pathname: '/machines/[family]', params: { family: 'gamma' } },
      { locale: 'es' },
    )
  })

  it('navigates to the machine detail pathname with family and slug when on /machines/[family]/[slug]', () => {
    window.history.replaceState({}, '', '/machines/gamma/gamma-13')
    paramsValue = { family: 'gamma', slug: 'gamma-13' }
    render(<LanguageSwitcher />)
    screen.getByRole('button', { name: 'ES' }).click()
    expect(replace).toHaveBeenCalledWith(
      { pathname: '/machines/[family]/[slug]', params: { family: 'gamma', slug: 'gamma-13' } },
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
