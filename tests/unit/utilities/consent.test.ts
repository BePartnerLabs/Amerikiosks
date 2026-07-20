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
    expect(parseConsentCookie(JSON.stringify({ timestamp: '2026-01-01T00:00:00.000Z' }))).toBeNull()
    expect(
      parseConsentCookie(
        JSON.stringify({ analytics: 'yes', timestamp: '2026-01-01T00:00:00.000Z' }),
      ),
    ).toBeNull()
  })

  it('returns null when timestamp is missing or not a string', () => {
    expect(parseConsentCookie(JSON.stringify({ analytics: true }))).toBeNull()
  })

  it('parses a valid cookie value', () => {
    const value = JSON.stringify({ analytics: true, timestamp: '2026-01-01T00:00:00.000Z' })
    expect(parseConsentCookie(value)).toEqual({
      analytics: true,
      timestamp: '2026-01-01T00:00:00.000Z',
    })
  })

  it('serializes accepted analytics consent with an ISO timestamp', () => {
    const raw = serializeConsentCookie(true)
    const parsed = parseConsentCookie(raw)
    expect(parsed?.analytics).toBe(true)
    expect(() => new Date(parsed?.timestamp ?? '')).not.toThrow()
    expect(new Date(parsed?.timestamp ?? '').toISOString()).toBe(parsed?.timestamp)
  })

  it('serializes rejected analytics consent', () => {
    const raw = serializeConsentCookie(false)
    expect(parseConsentCookie(raw)?.analytics).toBe(false)
  })

  it('round-trips through serialize then parse', () => {
    const raw = serializeConsentCookie(true)
    expect(parseConsentCookie(raw)).not.toBeNull()
  })
})
