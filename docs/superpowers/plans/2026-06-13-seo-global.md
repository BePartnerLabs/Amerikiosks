# SEO Global Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the Payload `settings` global with tabbed SEO controls — granular robots.txt rules per user-agent, llms.txt autogeneration, and GA4 config — replacing the current binary noIndex toggle.

**Architecture:** Extend `src/Settings/config.ts` with tabs and new fields (`robotsRules` array, llms fields). Update `src/app/robots.ts` to map the array to `MetadataRoute.Robots`. Add `src/app/llms.txt/route.ts` as a Next.js Route Handler that reads Payload and generates llms.txt. Extend `revalidateSettings` hook to also invalidate robots and llms cache tags.

**Tech Stack:** Payload CMS 3 (GlobalConfig, tabs, arrays), Next.js 16 App Router (MetadataRoute.Robots, Route Handler, revalidateTag/revalidatePath), TypeScript.

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `src/Settings/config.ts` | Modify | Add tabs, `robotsRules` array, llms fields |
| `src/Settings/hooks/revalidateSettings.ts` | Modify | Add `revalidatePath('/robots.txt')` + `revalidateTag('llms-txt')` |
| `src/app/robots.ts` | Modify | Map `robotsRules` array to `MetadataRoute.Robots` |
| `src/app/llms.txt/route.ts` | Create | Route Handler generating llms.txt |
| `src/endpoints/seed/settings.ts` | Create | Seed the settings global with default SEO rules |
| `src/endpoints/seed/index.ts` | Modify | Call `seedSettings` |
| `src/migrations/<timestamp>.ts` | Create | DB migration for new fields (auto-generated) |

---

## Task 1: Extend Settings global config with tabs and new fields

**Files:**
- Modify: `src/Settings/config.ts`

- [ ] **Step 1: Replace the flat fields array with tabs**

Replace the entire contents of `src/Settings/config.ts`:

```ts
import type { GlobalConfig } from 'payload'
import { revalidateSettings } from './hooks/revalidateSettings'

export const Settings: GlobalConfig = {
  slug: 'settings',
  admin: {
    group: 'Site',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateSettings],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Indexing',
          fields: [
            {
              name: 'noIndex',
              type: 'checkbox',
              label: 'Block all crawlers',
              defaultValue: true,
              admin: {
                description:
                  'When enabled, robots.txt disallows all crawlers. Takes precedence over the rules below. Turn off when the site is ready to go public.',
              },
            },
            {
              name: 'robotsRules',
              type: 'array',
              label: 'Robots rules',
              admin: {
                description:
                  'Per-agent rules applied when "Block all crawlers" is off. Each entry maps one User-agent to allow/disallow paths.',
                condition: (data) => data?.noIndex === false,
              },
              fields: [
                {
                  name: 'userAgent',
                  type: 'text',
                  required: true,
                  defaultValue: '*',
                  label: 'User-agent',
                  admin: { placeholder: 'e.g. Googlebot, GPTBot, *' },
                },
                {
                  name: 'allow',
                  type: 'array',
                  label: 'Allow',
                  fields: [
                    {
                      name: 'path',
                      type: 'text',
                      required: true,
                      admin: { placeholder: '/' },
                    },
                  ],
                },
                {
                  name: 'disallow',
                  type: 'array',
                  label: 'Disallow',
                  fields: [
                    {
                      name: 'path',
                      type: 'text',
                      required: true,
                      admin: { placeholder: '/admin' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Analytics',
          fields: [
            {
              name: 'googleAnalyticsId',
              type: 'text',
              label: 'Google Analytics Measurement ID',
              admin: {
                description:
                  'Your GA4 Measurement ID (e.g. G-XXXXXXXXXX). Leave empty to disable analytics.',
                placeholder: 'G-XXXXXXXXXX',
              },
            },
          ],
        },
        {
          label: 'LLMs',
          fields: [
            {
              name: 'llmsEnabled',
              type: 'checkbox',
              label: 'Enable /llms.txt',
              defaultValue: false,
              admin: {
                description:
                  'When enabled, /llms.txt is publicly accessible and lists site content for AI agents.',
              },
            },
            {
              name: 'llmsSiteDescription',
              type: 'textarea',
              label: 'Site description for AI agents',
              admin: {
                description: 'Short description of the site shown at the top of llms.txt.',
                condition: (data) => data?.llmsEnabled === true,
              },
            },
            {
              name: 'llmsIncludePages',
              type: 'checkbox',
              label: 'Include pages',
              defaultValue: true,
              admin: {
                description: 'Include published pages in llms.txt.',
                condition: (data) => data?.llmsEnabled === true,
              },
            },
            {
              name: 'llmsIncludeInsights',
              type: 'checkbox',
              label: 'Include insights',
              defaultValue: true,
              admin: {
                description: 'Include published insights (posts) in llms.txt.',
                condition: (data) => data?.llmsEnabled === true,
              },
            },
          ],
        },
      ],
    },
  ],
}
```

- [ ] **Step 2: Regenerate Payload types**

```bash
pnpm generate:types
```

Expected: `src/payload-types.ts` updated — `Setting` interface now includes `robotsRules`, `llmsEnabled`, `llmsSiteDescription`, `llmsIncludePages`, `llmsIncludeInsights`.

- [ ] **Step 3: Create DB migration**

```bash
pnpm payload migrate:create
```

Expected: new file created at `src/migrations/<timestamp>.ts`.

- [ ] **Step 4: Run migration**

```bash
pnpm payload migrate
```

Expected: `Migrated: <timestamp>`.

- [ ] **Step 5: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/Settings/config.ts src/payload-types.ts src/migrations/
git commit -m "feat(settings): add SEO tabs — indexing rules, analytics, llms config"
```

---

## Task 2: Update revalidateSettings hook

**Files:**
- Modify: `src/Settings/hooks/revalidateSettings.ts`

- [ ] **Step 1: Add robots and llms revalidation**

Replace the file contents:

```ts
import { revalidatePath, revalidateTag } from 'next/cache'
import type { GlobalAfterChangeHook } from 'payload'

export const revalidateSettings: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating settings')
    revalidateTag('global_settings', 'max')
    revalidatePath('/robots.txt')
    revalidateTag('llms-txt')
  }

  return doc
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/Settings/hooks/revalidateSettings.ts
git commit -m "feat(settings): revalidate robots.txt and llms-txt on settings change"
```

---

## Task 3: Update robots.ts to use robotsRules array

**Files:**
- Modify: `src/app/robots.ts`

- [ ] **Step 1: Write the test first**

Create `tests/unit/app/robots.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({
  getPayload: vi.fn(),
}))
vi.mock('@/utilities/getURL', () => ({
  getServerSideURL: () => 'https://amerikiosks.com',
}))

import { getPayload } from 'payload'

const mockGetPayload = vi.mocked(getPayload)

async function importRobots() {
  const mod = await import('@/app/robots')
  return mod.default
}

describe('robots()', () => {
  it('blocks all when noIndex is true', async () => {
    mockGetPayload.mockResolvedValue({
      findGlobal: vi.fn().mockResolvedValue({ noIndex: true, robotsRules: [] }),
    } as any)
    const robots = await importRobots()
    const result = await robots()
    expect(result).toEqual({ rules: [{ userAgent: '*', disallow: '/' }] })
  })

  it('allows all with sitemap when noIndex false and no rules', async () => {
    mockGetPayload.mockResolvedValue({
      findGlobal: vi.fn().mockResolvedValue({ noIndex: false, robotsRules: [] }),
    } as any)
    const robots = await importRobots()
    const result = await robots()
    expect(result).toEqual({
      rules: [{ userAgent: '*', allow: '/' }],
      sitemap: 'https://amerikiosks.com/sitemap.xml',
    })
  })

  it('maps robotsRules to MetadataRoute.Robots when noIndex false', async () => {
    mockGetPayload.mockResolvedValue({
      findGlobal: vi.fn().mockResolvedValue({
        noIndex: false,
        robotsRules: [
          { userAgent: 'Googlebot', allow: [{ path: '/' }], disallow: [] },
          { userAgent: 'GPTBot', allow: [], disallow: [{ path: '/' }] },
        ],
      }),
    } as any)
    const robots = await importRobots()
    const result = await robots()
    expect(result).toEqual({
      rules: [
        { userAgent: 'Googlebot', allow: ['/'], disallow: [] },
        { userAgent: 'GPTBot', allow: [], disallow: ['/'] },
      ],
      sitemap: 'https://amerikiosks.com/sitemap.xml',
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test:int tests/unit/app/robots.test.ts
```

Expected: FAIL — current `robots.ts` doesn't map rules array.

- [ ] **Step 3: Update robots.ts**

Replace `src/app/robots.ts`:

```ts
import config from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import type { Setting } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

type RobotsRule = NonNullable<Setting['robotsRules']>[number]

function mapRule(rule: RobotsRule): MetadataRoute.Robots['rules'][number] {
  return {
    userAgent: rule.userAgent ?? '*',
    allow: (rule.allow ?? []).map((a) => a.path).filter(Boolean) as string[],
    disallow: (rule.disallow ?? []).map((d) => d.path).filter(Boolean) as string[],
  }
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'settings' })

  if (settings?.noIndex !== false) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    }
  }

  const rules = settings.robotsRules ?? []

  if (rules.length === 0) {
    return {
      rules: [{ userAgent: '*', allow: '/' }],
      sitemap: `${getServerSideURL()}/sitemap.xml`,
    }
  }

  return {
    rules: rules.map(mapRule),
    sitemap: `${getServerSideURL()}/sitemap.xml`,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test:int tests/unit/app/robots.test.ts
```

Expected: 3 tests passing.

- [ ] **Step 5: Run full test suite**

```bash
pnpm test:int
```

Expected: all tests passing.

- [ ] **Step 6: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/app/robots.ts tests/unit/app/robots.test.ts
git commit -m "feat(robots): map robotsRules array from settings to MetadataRoute.Robots"
```

---

## Task 4: Create /llms.txt Route Handler

**Files:**
- Create: `src/app/llms.txt/route.ts`

- [ ] **Step 1: Write the test**

Create `tests/unit/app/llms.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: vi.fn() }))
vi.mock('@/utilities/getURL', () => ({
  getServerSideURL: () => 'https://amerikiosks.com',
}))
vi.mock('next/cache', () => ({ unstable_cache: (fn: any) => fn }))

import { getPayload } from 'payload'

const mockGetPayload = vi.mocked(getPayload)

async function callGET() {
  const mod = await import('@/app/llms.txt/route')
  return mod.GET()
}

describe('GET /llms.txt', () => {
  it('returns 404 when llmsEnabled is false', async () => {
    mockGetPayload.mockResolvedValue({
      findGlobal: vi.fn().mockResolvedValue({ llmsEnabled: false }),
      find: vi.fn(),
    } as any)
    const res = await callGET()
    expect(res.status).toBe(404)
  })

  it('returns text/plain with correct headers when enabled', async () => {
    mockGetPayload.mockResolvedValue({
      findGlobal: vi.fn().mockResolvedValue({
        llmsEnabled: true,
        llmsSiteDescription: 'Branded kiosk experiences.',
        llmsIncludePages: true,
        llmsIncludeInsights: false,
      }),
      find: vi.fn().mockResolvedValue({ docs: [{ title: 'Home', slug: '', meta: {} }] }),
    } as any)
    const res = await callGET()
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/plain')
    const body = await res.text()
    expect(body).toContain('# Amerikiosks')
    expect(body).toContain('Branded kiosk experiences.')
    expect(body).toContain('## Pages')
    expect(body).toContain('Home')
    expect(body).not.toContain('## Insights')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test:int tests/unit/app/llms.test.ts
```

Expected: FAIL — file doesn't exist yet.

- [ ] **Step 3: Create the route handler**

Create `src/app/llms.txt/route.ts`:

```ts
import config from '@payload-config'
import { getPayload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'settings' })

  if (!settings?.llmsEnabled) {
    return new Response(null, { status: 404 })
  }

  const baseUrl = getServerSideURL()
  const lines: string[] = []

  lines.push('# Amerikiosks')
  lines.push('')
  if (settings.llmsSiteDescription) {
    lines.push(`> ${settings.llmsSiteDescription}`)
    lines.push('')
  }

  if (settings.llmsIncludePages !== false) {
    const pages = await payload.find({
      collection: 'pages',
      where: { _status: { equals: 'published' } },
      depth: 0,
      limit: 200,
      overrideAccess: false,
    })

    if (pages.docs.length > 0) {
      lines.push('## Pages')
      lines.push('')
      for (const page of pages.docs) {
        const slug = (page.breadcrumbs as { url?: string }[] | undefined)?.at(-1)?.url ?? `/${page.slug}`
        const url = `${baseUrl}${slug}`
        const description = (page.meta as { description?: string } | undefined)?.description
        const entry = description ? `- [${page.title}](${url}): ${description}` : `- [${page.title}](${url})`
        lines.push(entry)
      }
      lines.push('')
    }
  }

  if (settings.llmsIncludeInsights !== false) {
    const insights = await payload.find({
      collection: 'insights',
      where: { _status: { equals: 'published' } },
      depth: 0,
      limit: 200,
      overrideAccess: false,
    })

    if (insights.docs.length > 0) {
      lines.push('## Insights')
      lines.push('')
      for (const insight of insights.docs) {
        const url = `${baseUrl}/insights/${insight.slug}`
        const description = (insight.meta as { description?: string } | undefined)?.description
        const entry = description
          ? `- [${insight.title}](${url}): ${description}`
          : `- [${insight.title}](${url})`
        lines.push(entry)
      }
      lines.push('')
    }
  }

  return new Response(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test:int tests/unit/app/llms.test.ts
```

Expected: 2 tests passing.

- [ ] **Step 5: Run full test suite**

```bash
pnpm test:int
```

Expected: all tests passing.

- [ ] **Step 6: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/app/llms.txt/route.ts tests/unit/app/llms.test.ts
git commit -m "feat(llms): add /llms.txt route handler generated from Payload content"
```

---

## Task 5: Add settings seed

**Files:**
- Create: `src/endpoints/seed/settings.ts`
- Modify: `src/endpoints/seed/index.ts`

- [ ] **Step 1: Create the seed file**

Create `src/endpoints/seed/settings.ts`:

```ts
import type { Payload, PayloadRequest } from 'payload'

export const seedSettings = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding settings...')

  await payload.updateGlobal({
    slug: 'settings',
    data: {
      noIndex: true,
      robotsRules: [
        {
          userAgent: 'Googlebot',
          allow: [{ path: '/' }],
          disallow: [],
        },
        {
          userAgent: 'Bingbot',
          allow: [{ path: '/' }],
          disallow: [],
        },
        {
          userAgent: 'GPTBot',
          allow: [],
          disallow: [{ path: '/' }],
        },
        {
          userAgent: 'Claude-Web',
          allow: [],
          disallow: [{ path: '/' }],
        },
        {
          userAgent: 'CCBot',
          allow: [],
          disallow: [{ path: '/' }],
        },
        {
          userAgent: 'anthropic-ai',
          allow: [],
          disallow: [{ path: '/' }],
        },
        {
          userAgent: 'Bytespider',
          allow: [],
          disallow: [{ path: '/' }],
        },
      ],
      llmsEnabled: true,
      llmsSiteDescription:
        'Amerikiosks deploys branded vending experiences in premium venues — airports, stadiums, hotels — without the overhead of traditional retail. This site covers brand programs, venue solutions, and how the platform works.',
      llmsIncludePages: true,
      llmsIncludeInsights: true,
    },
    overrideAccess: true,
    req,
  })

  payload.logger.info('— Settings seeded.')
}
```

- [ ] **Step 2: Register in seed index**

Modify `src/endpoints/seed/index.ts`:

```ts
import type { Payload, PayloadRequest } from 'payload'

import { seedFooter } from './footer'
import { seedHeader } from './header'
import { seedPosts } from './insights'
import { seedPages } from './pages'
import { seedPartners } from './partners'
import { seedSettings } from './settings'

export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  await seedSettings(payload, req)
  const postIds = await seedPosts(payload, req)
  await seedPages(payload, req, { postIds })
  await seedHeader(payload, req)
  await seedFooter(payload, req)
  await seedPartners(payload, req)

  payload.logger.info('Seeded database successfully!')
}
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Run full test suite**

```bash
pnpm test:int
```

Expected: all tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/endpoints/seed/settings.ts src/endpoints/seed/index.ts
git commit -m "feat(seed): seed settings global with default robots rules and llms config"
```

---

## Task 6: Push and open PR

- [ ] **Step 1: Push branch**

```bash
git push -u origin feat/seo-global
```

- [ ] **Step 2: Open PR**

```bash
gh pr create \
  --title "feat(seo): SEO global — granular robots.txt rules + llms.txt autogeneration" \
  --body "## Summary
- Extends Settings global with 3 tabs: Indexing, Analytics, LLMs
- robots.txt now maps per-agent allow/disallow rules from the admin
- /llms.txt route handler auto-generates from published pages and insights
- revalidateSettings hook invalidates robots and llms cache on save
- Seed pre-loads Googlebot/Bingbot allow rules + AI bot disallow rules

## Test plan
- [ ] Run \`pnpm payload migrate\` — migration applies cleanly
- [ ] Open /admin/globals/settings — three tabs visible
- [ ] Toggle noIndex off — robotsRules array appears
- [ ] Set llmsEnabled on — /llms.txt returns 200 with correct content
- [ ] Set llmsEnabled off — /llms.txt returns 404
- [ ] Change settings in admin — robots.txt and llms.txt revalidate
- [ ] \`pnpm test:int\` — all tests passing

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

---

## Self-Review

**Spec coverage:**
- ✅ noIndex → Task 1
- ✅ robotsRules array per agent → Task 1 + Task 3
- ✅ Analytics tab (googleAnalyticsId) → Task 1
- ✅ llms fields → Task 1
- ✅ /llms.txt route → Task 4
- ✅ 404 when disabled → Task 4
- ✅ Cache-Control header → Task 4
- ✅ revalidation for robots + llms → Task 2
- ✅ Seed with AI bot rules → Task 5
- ✅ DB migration → Task 1

**Type consistency:** `Setting['robotsRules']` is used in `robots.ts` (Task 3) — generated by `pnpm generate:types` in Task 1 before Task 3 runs. ✅

**No placeholders:** All steps have complete code. ✅
