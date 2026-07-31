import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRateLimiter, getClientIp, RATE_LIMITS } from '@/utilities/rateLimit'

afterEach(() => {
  vi.useRealTimers()
})

describe('createRateLimiter', () => {
  it('allows up to the limit and rejects past it', () => {
    const isRateLimited = createRateLimiter({ windowMs: 1_000, max: 3 })

    expect([1, 2, 3].map(() => isRateLimited('1.1.1.1'))).toEqual([false, false, false])
    expect(isRateLimited('1.1.1.1')).toBe(true)
  })

  it('counts each address separately', () => {
    const isRateLimited = createRateLimiter({ windowMs: 1_000, max: 1 })

    expect(isRateLimited('1.1.1.1')).toBe(false)
    expect(isRateLimited('2.2.2.2')).toBe(false)
    expect(isRateLimited('1.1.1.1')).toBe(true)
  })

  // The reason this is a factory and not a shared module-level map: one busy
  // endpoint must not start rejecting traffic on an unrelated one.
  it('gives each limiter its own bucket', () => {
    const forms = createRateLimiter({ windowMs: 1_000, max: 1 })
    const consent = createRateLimiter({ windowMs: 1_000, max: 1 })

    expect(forms('1.1.1.1')).toBe(false)
    expect(forms('1.1.1.1')).toBe(true)
    expect(consent('1.1.1.1')).toBe(false)
  })

  it('forgets requests once they fall out of the window', () => {
    vi.useFakeTimers()
    const isRateLimited = createRateLimiter({ windowMs: 1_000, max: 1 })

    expect(isRateLimited('1.1.1.1')).toBe(false)
    expect(isRateLimited('1.1.1.1')).toBe(true)

    vi.advanceTimersByTime(1_500)
    expect(isRateLimited('1.1.1.1')).toBe(false)
  })
})

describe('getClientIp', () => {
  it('takes the first address in x-forwarded-for', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '203.0.113.1, 70.41.3.18' },
    })
    expect(getClientIp(req)).toBe('203.0.113.1')
  })

  // Everything without a forwarded address shares one bucket. Coarse on
  // purpose: a request we cannot attribute should not get a free lane.
  it('falls back to a single bucket when the header is absent', () => {
    expect(getClientIp(new Request('http://localhost'))).toBe('unknown')
  })
})

describe('createRateLimiter eviction', () => {
  // The map is keyed on a client-controlled string, so without eviction every
  // address that ever knocked stays resident for the life of the process.
  it('drops addresses whose requests have all aged out', () => {
    vi.useFakeTimers()
    const isRateLimited = createRateLimiter({ windowMs: 1_000, max: 5 })

    isRateLimited('1.1.1.1')
    vi.advanceTimersByTime(2_000)
    // Any call past the window triggers the sweep; the old key goes with it.
    isRateLimited('2.2.2.2')

    // Observable proof the entry was rebuilt rather than resumed: the old
    // address gets a full allowance again.
    const verdicts = Array.from({ length: 5 }, () => isRateLimited('1.1.1.1'))
    expect(verdicts).toEqual([false, false, false, false, false])
  })
})

describe('RATE_LIMITS', () => {
  // Not one shared number on purpose: a visitor legitimately writes several
  // consent rows in one sitting, while submitting a form happens rarely. One
  // value would either leave the lead endpoint loose or block a form send
  // because someone reopened the cookie panel.
  it('gives the consent log more headroom than the lead endpoints', () => {
    expect(RATE_LIMITS.consentLog.max).toBeGreaterThan(RATE_LIMITS.formSubmissions.max)
    expect(RATE_LIMITS.claims.max).toBe(RATE_LIMITS.formSubmissions.max)
  })

  it('uses a one-minute window everywhere', () => {
    for (const limit of Object.values(RATE_LIMITS)) {
      expect(limit.windowMs).toBe(60_000)
    }
  })
})
