import { afterEach, describe, expect, it, vi } from 'vitest'
import { hasSessionCookie, isGatedPath, parseGatedPaths } from '@/utilities/gatedPaths'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('parseGatedPaths', () => {
  it('splits, trims and normalises a leading slash', () => {
    expect(parseGatedPaths('/es, machines ')).toEqual(['/es', '/machines'])
  })

  it('drops a trailing slash but keeps the root', () => {
    expect(parseGatedPaths('/machines/')).toEqual(['/machines'])
    expect(parseGatedPaths('/')).toEqual(['/'])
  })

  it('is empty for blank values, so nothing is gated by default', () => {
    expect(parseGatedPaths('')).toEqual([])
    expect(parseGatedPaths(' , ,')).toEqual([])
  })

  // Reads the env when called with no argument. Stubbed rather than relying on
  // the ambient value: whoever runs the suite may well have GATED_PATHS set,
  // and a test that passes only on a clean shell is not a test.
  it('falls back to the environment', () => {
    vi.stubEnv('GATED_PATHS', '/es,/machines')
    expect(parseGatedPaths()).toEqual(['/es', '/machines'])

    vi.stubEnv('GATED_PATHS', '')
    expect(parseGatedPaths()).toEqual([])
  })
})

describe('isGatedPath', () => {
  const gated = ['/es', '/machines']

  it.each(['/es', '/es/', '/es/faq', '/es/maquinas/gamma', '/machines', '/machines/vending'])(
    'gates %s',
    (path) => {
      expect(isGatedPath(path, gated)).toBe(true)
    },
  )

  // Matching on a segment boundary, not a bare prefix. The roadmap already
  // records this exact trap for proxy.ts's own matcher: a future slug starting
  // with a gated word would be caught by accident.
  it.each(['/estadisticas', '/machines-catalog', '/faq', '/'])('leaves %s alone', (path) => {
    expect(isGatedPath(path, gated)).toBe(false)
  })

  it('gates nothing when the list is empty', () => {
    expect(isGatedPath('/es/faq', [])).toBe(false)
  })
})

describe('hasSessionCookie', () => {
  it('recognises the Payload session cookie', () => {
    expect(hasSessionCookie(['payload-token'])).toBe(true)
    expect(hasSessionCookie(['ak_consent', 'payload-token'])).toBe(true)
  })

  it('is false without it', () => {
    expect(hasSessionCookie([])).toBe(false)
    expect(hasSessionCookie(['ak_consent', 'utm_source'])).toBe(false)
  })

  // Worth stating in a test: presence is all this checks. It hides unreviewed
  // copy; it is not access control, and a fabricated cookie passes.
  it('checks presence only, by design', () => {
    expect(hasSessionCookie(['payload-token'])).toBe(true)
  })
})
