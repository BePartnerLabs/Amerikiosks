import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))

const findGlobalMock = vi.fn()
vi.mock('payload', () => ({ getPayload: async () => ({ findGlobal: findGlobalMock }) }))

// The real thing caches; here it just runs the work so the test observes the
// call rather than a cache entry.
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
}))

import { getCachedGlobal } from '@/utilities/getGlobals'

beforeEach(() => {
  findGlobalMock.mockResolvedValue({})
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('getCachedGlobal', () => {
  // The bug behind #199: these globals render the public site, so they must be
  // read with a visitor's permissions. The Local API defaults to `true`, which
  // skips field-level access entirely.
  it('reads with overrideAccess: false', async () => {
    await getCachedGlobal('footer', 1, 'es')()
    expect(findGlobalMock).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'footer', depth: 1, overrideAccess: false }),
    )
  })

  it('passes the locale through and falls back to English', async () => {
    await getCachedGlobal('header', 1, 'es')()
    expect(findGlobalMock).toHaveBeenCalledWith(
      expect.objectContaining({ locale: 'es', fallbackLocale: 'en' }),
    )
  })

  it('defaults to depth 0 and English', async () => {
    await getCachedGlobal('settings')()
    expect(findGlobalMock).toHaveBeenCalledWith(expect.objectContaining({ depth: 0, locale: 'en' }))
  })

  // Belt to the field-access braces: a modal CTA at depth 1 arrives with the
  // whole Form document populated, and that object reaches a client component —
  // so it would land in the RSC payload of every page.
  it('strips the Monday wiring out of what it returns', async () => {
    findGlobalMock.mockResolvedValue({
      contactCtaForm: {
        id: 9,
        title: 'Contact',
        integrationTarget: 'monday',
        externalId: '4024508641',
        mondayGroupId: 'topics',
        fields: [{ name: 'email', externalId: 'email' }],
      },
    })

    const result = (await getCachedGlobal('footer', 1)()) as unknown as {
      contactCtaForm: Record<string, unknown> & { fields: Record<string, unknown>[] }
    }

    expect(result.contactCtaForm).not.toHaveProperty('integrationTarget')
    expect(result.contactCtaForm).not.toHaveProperty('externalId')
    expect(result.contactCtaForm).not.toHaveProperty('mondayGroupId')
    expect(result.contactCtaForm.fields[0]).not.toHaveProperty('externalId')
    // …while everything the drawer renders survives.
    expect(result.contactCtaForm.title).toBe('Contact')
    expect(result.contactCtaForm.fields[0].name).toBe('email')
  })
})
