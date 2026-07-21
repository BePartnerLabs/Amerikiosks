import { describe, expect, it } from 'vitest'
import {
  CONSENT_COOKIE_MAX_AGE,
  CONSENT_COOKIE_NAME,
  parseConsentCookie,
  serializeConsentCookie,
} from '@/utilities/consent'

describe('consent utility', () => {
  it('exposes the cookie name and a 1-year max-age', () => {
    expect(CONSENT_COOKIE_NAME).toBe('ak_consent')
    expect(CONSENT_COOKIE_MAX_AGE).toBe(31536000)
  })

  it('returns null when the raw cookie value is undefined', () => {
    expect(parseConsentCookie(undefined)).toBeNull()
  })

  it('returns null when the raw cookie value is not valid JSON', () => {
    expect(parseConsentCookie('not-json')).toBeNull()
  })

  it('returns null when analytics is missing or not a boolean', () => {
    expect(
      parseConsentCookie(
        JSON.stringify({ timestamp: '2026-01-01T00:00:00.000Z', consentId: 'abc' }),
      ),
    ).toBeNull()
    expect(
      parseConsentCookie(
        JSON.stringify({
          analytics: 'yes',
          timestamp: '2026-01-01T00:00:00.000Z',
          consentId: 'abc',
        }),
      ),
    ).toBeNull()
  })

  it('returns null when timestamp is missing or not a string', () => {
    expect(parseConsentCookie(JSON.stringify({ analytics: true, consentId: 'abc' }))).toBeNull()
  })

  it('returns null when consentId is missing or not a string', () => {
    expect(
      parseConsentCookie(
        JSON.stringify({ analytics: true, timestamp: '2026-01-01T00:00:00.000Z' }),
      ),
    ).toBeNull()
  })

  it('parses a valid cookie value', () => {
    const value = JSON.stringify({
      analytics: true,
      timestamp: '2026-01-01T00:00:00.000Z',
      consentId: 'abc-123',
    })
    expect(parseConsentCookie(value)).toEqual({
      analytics: true,
      timestamp: '2026-01-01T00:00:00.000Z',
      consentId: 'abc-123',
    })
  })

  it('serializes accepted analytics consent with an ISO timestamp', () => {
    const raw = serializeConsentCookie(true, 'abc-123')
    const parsed = parseConsentCookie(raw)
    expect(parsed?.analytics).toBe(true)
    expect(parsed?.consentId).toBe('abc-123')
    expect(() => new Date(parsed?.timestamp ?? '')).not.toThrow()
    expect(new Date(parsed?.timestamp ?? '').toISOString()).toBe(parsed?.timestamp)
  })

  it('serializes rejected analytics consent', () => {
    const raw = serializeConsentCookie(false, 'abc-123')
    expect(parseConsentCookie(raw)?.analytics).toBe(false)
  })

  it('round-trips through serialize then parse', () => {
    const raw = serializeConsentCookie(true, 'abc-123')
    expect(parseConsentCookie(raw)).not.toBeNull()
  })

  it('parses a URI-encoded cookie value exactly as ConsentManager writes it', () => {
    const raw = serializeConsentCookie(true, 'abc-123')
    const encoded = encodeURIComponent(raw)
    const timestamp = JSON.parse(raw).timestamp

    expect(parseConsentCookie(encoded)).toEqual({
      analytics: true,
      timestamp,
      consentId: 'abc-123',
    })
  })

  it('returns null (not throw) for a malformed percent-encoded value', () => {
    expect(() => parseConsentCookie('%')).not.toThrow()
    expect(parseConsentCookie('%')).toBeNull()
    expect(parseConsentCookie('%E0%A4%A')).toBeNull()
  })
})
