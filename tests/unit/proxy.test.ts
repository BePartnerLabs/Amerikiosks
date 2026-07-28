import { NextRequest, NextResponse } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next-intl/middleware', () => ({
  default: () => () => NextResponse.next(),
}))

// No redirect rows: the middleware must fall through to the i18n handling.
vi.mock('@/plugins/redirects/lookup', () => ({
  findRedirect: vi.fn(async () => null),
}))

describe('middleware (proxy.ts)', () => {
  it('the common case: no machine_id/UTM present — no cookies are set, response passes through', async () => {
    const { default: middleware } = await import('@/proxy')
    const req = new NextRequest('https://amerikiosks.com/customer-service')

    const res = await middleware(req)

    expect(res.cookies.get('machine_id')).toBeUndefined()
    expect(res.cookies.get('utm_source')).toBeUndefined()
  })

  it('captures machine_id from the query string into a cookie when present', async () => {
    const { default: middleware } = await import('@/proxy')
    const req = new NextRequest(
      'https://amerikiosks.com/customer-service/request-a-refund?machine_id=AK-0231',
    )

    const res = await middleware(req)

    expect(res.cookies.get('machine_id')?.value).toBe('AK-0231')
  })

  it('captures utm_source/utm_medium/utm_campaign when present', async () => {
    const { default: middleware } = await import('@/proxy')
    const req = new NextRequest(
      'https://amerikiosks.com/?utm_source=instagram&utm_medium=social&utm_campaign=summer',
    )

    const res = await middleware(req)

    expect(res.cookies.get('utm_source')?.value).toBe('instagram')
    expect(res.cookies.get('utm_medium')?.value).toBe('social')
    expect(res.cookies.get('utm_campaign')?.value).toBe('summer')
  })

  it('preserves whatever response next-intl middleware returned (e.g. a locale redirect)', async () => {
    vi.resetModules()
    vi.doMock('next-intl/middleware', () => ({
      default: () => () => NextResponse.redirect('https://amerikiosks.com/en/customer-service'),
    }))

    const { default: middleware } = await import('@/proxy')
    const req = new NextRequest('https://amerikiosks.com/customer-service')

    const res = await middleware(req)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('https://amerikiosks.com/en/customer-service')
  })
})
