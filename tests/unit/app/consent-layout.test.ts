import { describe, expect, it } from 'vitest'
import { parseConsentCookie } from '@/utilities/consent'

// Mirrors the boolean layout.tsx computes from `gaId` + the parsed cookie.
function shouldLoadGA4(gaId: string | undefined, rawCookie: string | undefined): boolean {
  const consent = parseConsentCookie(rawCookie)
  return Boolean(gaId) && consent?.analytics === true
}

describe('GA4 consent gating logic', () => {
  it('does not load GA4 when there is no gaId configured', () => {
    expect(
      shouldLoadGA4(
        undefined,
        JSON.stringify({ analytics: true, timestamp: 'x', consentId: 'abc' }),
      ),
    ).toBe(false)
  })

  it('does not load GA4 when consent has not been decided', () => {
    expect(shouldLoadGA4('G-TEST', undefined)).toBe(false)
  })

  it('does not load GA4 when analytics was rejected', () => {
    expect(
      shouldLoadGA4(
        'G-TEST',
        JSON.stringify({ analytics: false, timestamp: 'x', consentId: 'abc' }),
      ),
    ).toBe(false)
  })

  it('loads GA4 when a gaId is configured and analytics was accepted', () => {
    expect(
      shouldLoadGA4(
        'G-TEST',
        JSON.stringify({ analytics: true, timestamp: 'x', consentId: 'abc' }),
      ),
    ).toBe(true)
  })
})
