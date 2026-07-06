import { describe, expect, it, vi } from 'vitest'

vi.mock('next-intl/server', () => ({
  getRequestConfig: (fn: unknown) => fn,
}))

const { default: getRequestConfigImpl } = await import('@/i18n/request')

describe('i18n request config', () => {
  it('uses the requested locale when it is supported', async () => {
    const result = await getRequestConfigImpl({
      requestLocale: Promise.resolve('es'),
    } as never)
    expect(result.locale).toBe('es')
    expect(result.messages).toBeDefined()
  })

  it('falls back to the default locale when requestLocale is unsupported', async () => {
    const result = await getRequestConfigImpl({
      requestLocale: Promise.resolve('fr'),
    } as never)
    expect(result.locale).toBe('en')
  })

  it('falls back to the default locale when requestLocale resolves to undefined', async () => {
    const result = await getRequestConfigImpl({
      requestLocale: Promise.resolve(undefined),
    } as never)
    expect(result.locale).toBe('en')
  })
})
