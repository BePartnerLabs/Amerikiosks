import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

// This test reads route source files as plain text with node:fs instead of
// importing the route modules. Importing any of these would pull in the
// whole Payload config (Local API, collections, db adapter, etc.) just to
// check for the presence of a few exports — a source-text regex is the only
// cheap way to assert this.
//
// The gotcha: `generateStaticParams` on a content route combined with this
// project's next-intl plugin setup throws `DYNAMIC_SERVER_USAGE` in
// production the first time the page needs to regenerate after a content
// edit (reproduced via `next build && next start`, not `next dev`). It was
// tried on `/machines/[family]` and `/machines/[family]/[slug]` and caused a
// production 500. See CLAUDE.md "Known gotchas" for the full writeup.
// `dynamic = 'force-static'` and `revalidate` are the other two levers that
// force static generation on a route and must stay off these routes too.

const projectRoot = path.resolve(__dirname, '../../..')
const localeDir = path.join(projectRoot, 'src/app/(frontend)/[locale]')

const contentRoutes = [
  '[slug]/page.tsx',
  'insights/[slug]/page.tsx',
  'projects/[slug]/page.tsx',
  'insights/page.tsx',
  'insights/page/[pageNumber]/page.tsx',
  'machines/[family]/page.tsx',
  'machines/[family]/[slug]/page.tsx',
]

const forbiddenPatterns: Array<{ name: string; pattern: RegExp }> = [
  {
    name: 'generateStaticParams',
    pattern:
      /export\s+(async\s+)?function\s+generateStaticParams|export\s+const\s+generateStaticParams/,
  },
  {
    name: "dynamic = 'force-static'",
    pattern: /export\s+const\s+dynamic\s*=\s*['"]force-static['"]/,
  },
  { name: 'revalidate', pattern: /export\s+const\s+revalidate\s*=/ },
]

describe('content routes must not opt into static generation', () => {
  it.each(contentRoutes)(
    '%s has none of generateStaticParams/force-static/revalidate',
    (routePath) => {
      const filePath = path.join(localeDir, routePath)
      const source = readFileSync(filePath, 'utf-8')

      for (const { name, pattern } of forbiddenPatterns) {
        expect(
          pattern.test(source),
          `${routePath} exports ${name}. This route was previously proven to throw ` +
            `DYNAMIC_SERVER_USAGE in production (this app's next-intl setup + static ` +
            `generation on content routes) — see CLAUDE.md "Known gotchas" before ` +
            `re-adding it.`,
        ).toBe(false)
      }
    },
  )
})
