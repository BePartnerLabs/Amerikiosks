import { config as loadEnv } from 'dotenv'
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

// revalidateTag only works inside a live Next.js request context — the
// redirects collection's afterChange hook calls it, so it must be stubbed
// here (same as tests/unit/hooks/revalidateRedirects.test.ts).
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))

// Loaded explicitly (not just `dotenv/config` in vitest.setup.ts, which only
// reads `.env`) so this Local-API test can run against the local podman-compose
// Postgres via .env.local, same as `pnpm dev`. Payload's config and the seed
// function are imported dynamically inside beforeAll — a static top-level
// import would be hoisted above this loadEnv() call (ESM import hoisting),
// so payload.config.ts would read process.env.PAYLOAD_SECRET before it exists.
loadEnv({ path: '.env.local' })

// Requires a real Postgres connection (via podman-compose + .env.local).
// CI has no database service, so this suite is skipped there rather than
// failing on Payload init.
describe.skipIf(!process.env.DATABASE_URL)('seedRedirects (Local API integration)', () => {
  let payload: Payload

  beforeAll(async () => {
    const { getPayload } = await import('payload')
    const { default: config } = await import('@/payload.config')
    payload = await getPayload({ config })
    // Payload init (DB connection + schema check) can take longer than the
    // 10s default when this file runs alongside the full unit test suite.
  }, 30000)

  afterAll(async () => {
    await payload?.destroy()
  })

  it('creates all 13 migration redirects, idempotently', async () => {
    const { seedRedirects } = await import('@/endpoints/seed/redirects')
    const { createLocalReq } = await import('payload')
    const req = await createLocalReq({}, payload)
    await seedRedirects(payload, req)
    // running it twice must not create duplicates (update-if-exists)
    await seedRedirects(payload, req)

    const result = await payload.find({
      collection: 'redirects',
      where: { from: { in: ['/our-history', '/our-history/', '/cart/'] } },
      limit: 10,
    })

    expect(result.docs).toHaveLength(3)
    const ourHistory = result.docs.find((d) => d.from === '/our-history')
    expect(ourHistory?.to).toMatchObject({ type: 'custom', url: '/our-story' })
  })
})
