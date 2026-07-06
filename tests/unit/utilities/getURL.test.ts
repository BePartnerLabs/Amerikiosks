import { afterEach, describe, expect, it, vi } from 'vitest'
import { getClientSideURL, getServerSideURL } from '@/utilities/getURL'

describe('getServerSideURL', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('prefers NEXT_PUBLIC_SERVER_URL when set', () => {
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://amerikiosks.com')
    expect(getServerSideURL()).toBe('https://amerikiosks.com')
  })

  it('falls back to VERCEL_PROJECT_PRODUCTION_URL when NEXT_PUBLIC_SERVER_URL is unset', () => {
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', '')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'amerikiosks.vercel.app')
    expect(getServerSideURL()).toBe('https://amerikiosks.vercel.app')
  })

  it('falls back to localhost when neither env var is set', () => {
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', '')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '')
    expect(getServerSideURL()).toBe('http://localhost:3000')
  })
})

describe('getClientSideURL', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('returns the current window origin when running in a DOM environment', () => {
    expect(getClientSideURL()).toBe(window.location.origin)
  })

  it('falls back to VERCEL_PROJECT_PRODUCTION_URL when canUseDOM is false', async () => {
    vi.doMock('@/utilities/canUseDOM', () => ({ default: false }))
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'amerikiosks.vercel.app')

    const { getClientSideURL: getClientSideURLNonDOM } = await import('@/utilities/getURL')
    expect(getClientSideURLNonDOM()).toBe('https://amerikiosks.vercel.app')
  })

  it('falls back to NEXT_PUBLIC_SERVER_URL when canUseDOM is false and no Vercel URL is set', async () => {
    vi.doMock('@/utilities/canUseDOM', () => ({ default: false }))
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://amerikiosks.com')

    const { getClientSideURL: getClientSideURLNonDOM } = await import('@/utilities/getURL')
    expect(getClientSideURLNonDOM()).toBe('https://amerikiosks.com')
  })
})
