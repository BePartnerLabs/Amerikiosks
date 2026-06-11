# InsightsShowcase Block Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an `InsightsShowcaseBlock` that auto-fetches the 4 most recent featured insights and renders them as a hero article + 3 cards grid on the home page.

**Architecture:** Add a `featured` boolean to the Insights collection (sidebar checkbox). Create a new async server block component that queries `payload.find({ where: { featured: { equals: true } }, sort: '-publishedAt', limit: 4 })`, renders the first result as a large 2-col featured row, and the next 3 as image cards. Register in Pages layout builder and home seed.

**Tech Stack:** Next.js App Router, Payload CMS 3 Local API, TypeScript, CSS custom properties (`--ak-*` / `--bp-*`)

---

## File Map

| Action | File |
|--------|------|
| Modify | `src/collections/Insights/index.ts` — add `featured` checkbox field |
| Create | `src/blocks/InsightsShowcase/config.ts` — Payload block definition |
| Create | `src/blocks/InsightsShowcase/Component.tsx` — async server component |
| Create | `src/blocks/InsightsShowcase/styles.css` — layout + card styles |
| Modify | `src/collections/Pages/index.ts` — register block in layout builder |
| Modify | `src/blocks/RenderBlocks.tsx` — register component renderer |
| Modify | `src/endpoints/seed/insights.ts` — mark first insight as featured |
| Modify | `src/endpoints/seed/pages/home.ts` — replace archive block with insightsShowcase |
| Run | `pnpm payload migrate:create` → `pnpm generate:types` → `pnpm generate:importmap` |

---

### Task 0: DS compliance review before writing styles

**Files:** (read-only research, no file changes)

- [ ] **Step 1: Check DS AGENTS reference for relevant tokens and components**

Fetch the DS agents reference to confirm which tokens apply to cards, links, section headers, and images:

```
URL: https://ds.bepartnerlabs.com/AGENTS.md
```

Look for: card component tokens, link styles, image patterns, spacing scale.

- [ ] **Step 2: Check if a card component exists in the DS**

```
URL: https://ds.bepartnerlabs.com/components/card/
```

If a canonical card component exists, copy its markup verbatim and use it as the base for `ak-insights-showcase__card`. Apply Level 2 overrides (`--card-*`) only where the DS default differs from the design.

- [ ] **Step 3: Confirm token usage rules**

Per project rules (CLAUDE.md):
- Use `--bp-*` for base tokens (spacing, radius, text sizes) — never redeclare these
- Use `--ak-*` for brand tokens (colors, shadows) — read from `src/app/(frontend)/tokens.css`
- Use `--<component>-*` for Level 2 overrides on the component selector
- Never use `--ak-*` directly in CSS property values — always go through a `--_*` local var

Check `src/app/(frontend)/tokens.css` to confirm color tokens (`--ak-color-heading`, `--ak-color-border`, `--ak-color-surface`, `--ak-card-shadow-subtle`) are defined before using them.

```bash
grep -E "ak-color-heading|ak-color-border|ak-color-surface|ak-card-shadow-subtle" src/app/\(frontend\)/tokens.css
```

Expected: all four tokens present. If any are missing, use the hardcoded HSLA values from the design as the fallback in `var(--token, fallback)`.

- [ ] **Step 4: No commit needed — research only**

Proceed to Task 1 with confirmed token names and any DS markup to reuse.

---

### Task 1: Add `featured` field to Insights collection

**Files:**
- Modify: `src/collections/Insights/index.ts`

- [ ] **Step 1: Add the `featured` checkbox field in the sidebar section**

In `src/collections/Insights/index.ts`, find the `publishedAt` field (around line 166) and add the `featured` field directly before it:

```ts
{
  name: 'featured',
  type: 'checkbox',
  defaultValue: false,
  admin: {
    position: 'sidebar',
    description: 'Show this insight in the Insights Showcase block on the home page.',
  },
},
```

- [ ] **Step 2: Create the DB migration**

```bash
cd /Users/bepartnerlabs/Projects/BePartnerLabs/clients/Amerikiosks/website/amerikiosks
pnpm payload migrate:create --name add_insights_featured
```

Expected: creates `src/migrations/YYYYMMDD_HHMMSS_add_insights_featured.ts` and updates `src/migrations/index.ts`.

- [ ] **Step 3: Regenerate types and import map**

```bash
pnpm generate:types && pnpm generate:importmap
```

Expected: `src/payload-types.ts` now has `featured?: boolean | null` on the `Insight` interface.

- [ ] **Step 4: Commit**

```bash
git add src/collections/Insights/index.ts src/migrations/ src/payload-types.ts src/app/\(payload\)/admin/importMap.js
git commit -m "feat(insights): add featured checkbox field"
```

---

### Task 2: Create InsightsShowcase block config

**Files:**
- Create: `src/blocks/InsightsShowcase/config.ts`

- [ ] **Step 1: Create the config file**

```ts
// src/blocks/InsightsShowcase/config.ts
import type { Block } from 'payload'

export const InsightsShowcase: Block = {
  slug: 'insightsShowcase',
  interfaceName: 'InsightsShowcaseBlock',
  imageURL: '/block-previews/insights-showcase.png',
  imageAltText: 'Insights Showcase — featured hero + 3 cards',
  labels: { singular: 'Insights Showcase', plural: 'Insights Showcases' },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      admin: { description: 'Small label above heading, e.g. "INSIGHTS"' },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
    },
  ],
}
```

- [ ] **Step 2: Commit**

```bash
git add src/blocks/InsightsShowcase/config.ts
git commit -m "feat(insights-showcase): add Payload block config"
```

---

### Task 3: Register block in Pages collection and RenderBlocks

**Files:**
- Modify: `src/collections/Pages/index.ts`
- Modify: `src/blocks/RenderBlocks.tsx`

- [ ] **Step 1: Add import and block to Pages layout builder**

In `src/collections/Pages/index.ts`, add the import at the top with the other block imports:

```ts
import { InsightsShowcase } from '../../blocks/InsightsShowcase/config'
```

Then add `InsightsShowcase` to the blocks array (after `AudienceShowcase`):

```ts
blocks: [
  CallToAction,
  Content,
  MediaBlock,
  Archive,
  FormBlock,
  CardGrid,
  TrustStrip,
  AudienceShowcase,
  InsightsShowcase,
],
```

- [ ] **Step 2: Regenerate types**

```bash
pnpm generate:types
```

Expected: `InsightsShowcaseBlock` interface appears in `src/payload-types.ts` with `eyebrow`, `heading`, `blockType`, `blockName`, `id`.

- [ ] **Step 3: Add stub to RenderBlocks (will wire Component later)**

In `src/blocks/RenderBlocks.tsx`, add a temporary import placeholder — we'll update this in Task 4 after creating the component. For now just verify the file compiles after the config registration:

```bash
cd /Users/bepartnerlabs/Projects/BePartnerLabs/clients/Amerikiosks/website/amerikiosks
pnpm tsc --noEmit 2>&1 | grep -i "insightsShowcase\|InsightsShowcase" | head -10
```

Expected: no errors related to InsightsShowcase (the block isn't wired in RenderBlocks yet, that's fine).

- [ ] **Step 4: Commit**

```bash
git add src/collections/Pages/index.ts src/payload-types.ts
git commit -m "feat(insights-showcase): register block in Pages layout builder"
```

---

### Task 4: Build the Component and styles

**Files:**
- Create: `src/blocks/InsightsShowcase/Component.tsx`
- Create: `src/blocks/InsightsShowcase/styles.css`

- [ ] **Step 1: Create the CSS**

```css
/* src/blocks/InsightsShowcase/styles.css */

/* ─── Section wrapper ─────────────────────────────────────────── */
.ak-insights-showcase__inner {
  padding-block: var(--bp-space-16, 4rem);
  display: flex;
  flex-direction: column;
  gap: var(--bp-space-10, 2.5rem);
}

.ak-insights-showcase__header {
  text-align: center;
}

/* ─── Featured row ────────────────────────────────────────────── */
.ak-insights-showcase__featured {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--bp-space-8, 2rem);
  align-items: center;
  border-bottom: 1px solid var(--ak-color-border);
  padding-bottom: var(--bp-space-10, 2.5rem);
}

.ak-insights-showcase__featured-img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: var(--bp-radius-lg, 0.75rem);
  overflow: hidden;
}

.ak-insights-showcase__featured-img {
  object-fit: cover;
}

.ak-insights-showcase__featured-body {
  display: flex;
  flex-direction: column;
  gap: var(--bp-space-4, 1rem);
}

.ak-insights-showcase__featured-title {
  margin: 0;
  font-size: clamp(1.25rem, 2.5vw + 0.5rem, 1.75rem);
  font-weight: 700;
  color: var(--ak-color-heading);
  line-height: 1.25;
}

.ak-insights-showcase__featured-excerpt {
  margin: 0;
  font-size: var(--bp-text-sm, 0.875rem);
  line-height: 1.6;
  color: hsla(213, 96%, 11%, 0.68);
}

/* ─── Cards row ───────────────────────────────────────────────── */
.ak-insights-showcase__cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--bp-space-6, 1.5rem);
}

.ak-insights-showcase__card {
  display: flex;
  flex-direction: column;
  gap: var(--bp-space-3, 0.75rem);
  border: 1px solid var(--ak-color-border);
  border-radius: var(--bp-radius-lg, 0.75rem);
  overflow: hidden;
  background-color: var(--ak-color-surface);
  box-shadow: var(--ak-card-shadow-subtle);
}

.ak-insights-showcase__card-img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
}

.ak-insights-showcase__card-img {
  object-fit: cover;
}

.ak-insights-showcase__card-content {
  display: flex;
  flex-direction: column;
  gap: var(--bp-space-2, 0.5rem);
  padding: var(--bp-space-4, 1rem) var(--bp-space-4, 1rem) var(--bp-space-5, 1.25rem);
}

.ak-insights-showcase__card-title {
  margin: 0;
  font-size: var(--bp-text-base, 1rem);
  font-weight: 700;
  color: hsla(213, 96%, 11%, 1);
  line-height: 1.3;
}

.ak-insights-showcase__card-excerpt {
  margin: 0;
  font-size: var(--bp-text-sm, 0.875rem);
  line-height: 1.6;
  color: hsla(213, 96%, 11%, 0.68);
}

/* ─── Know more link ──────────────────────────────────────────── */
.ak-insights-showcase__link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--bp-text-sm, 0.875rem);
  font-weight: 500;
  color: var(--ak-color-heading);
  text-decoration: none;
  margin-top: auto;
}

.ak-insights-showcase__link:hover {
  opacity: 0.75;
}

.ak-insights-showcase__link-arrow {
  font-size: 14px;
  line-height: 1;
  font-variation-settings: "opsz" 14;
}

/* ─── Responsive ──────────────────────────────────────────────── */
@media (max-width: 64rem) {
  .ak-insights-showcase__cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 48rem) {
  .ak-insights-showcase__featured {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 40rem) {
  .ak-insights-showcase__cards {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Create the Component**

```tsx
// src/blocks/InsightsShowcase/Component.tsx
import configPromise from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type React from 'react'
import { SectionHeader } from '@/components/SectionHeader'
import type { InsightsShowcaseBlock as InsightsShowcaseBlockProps, Media } from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import './styles.css'

export const InsightsShowcaseBlock: React.FC<InsightsShowcaseBlockProps> = async ({
  eyebrow,
  heading,
  blockName,
  blockType,
}) => {
  const payload = await getPayload({ config: configPromise })
  const locale = (await getLocale()) as 'en' | 'es'

  const { docs } = await payload.find({
    collection: 'insights',
    where: { featured: { equals: true }, _status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 4,
    depth: 1,
    overrideAccess: false,
    locale,
    fallbackLocale: 'en',
    select: {
      title: true,
      slug: true,
      heroImage: true,
      meta: true,
    },
  })

  if (!heading || docs.length === 0) return null

  const [featured, ...cards] = docs

  const heroImg =
    featured.heroImage && typeof featured.heroImage === 'object'
      ? (featured.heroImage as Media)
      : null
  const heroExcerpt = featured.meta?.description ?? null
  const heroHref = `/${locale}/insights/${featured.slug}`

  return (
    <section
      className="ak-insights-showcase"
      aria-label={heading}
      data-ga-block={toSnakeCase(blockType)}
      data-ga-section={blockName ?? undefined}
    >
      <div className="bp-content-grid">
        <div className="breakout ak-insights-showcase__inner">
          <div className="ak-insights-showcase__header">
            <SectionHeader eyebrow={eyebrow} heading={heading} align="center" />
          </div>

          {/* Featured article */}
          <div className="ak-insights-showcase__featured">
            {heroImg?.url && (
              <div className="ak-insights-showcase__featured-img-wrap">
                <Image
                  src={heroImg.url}
                  alt={heroImg.alt ?? featured.title}
                  fill
                  className="ak-insights-showcase__featured-img"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            )}
            <div className="ak-insights-showcase__featured-body">
              <h2 className="ak-insights-showcase__featured-title">{featured.title}</h2>
              {heroExcerpt && (
                <p className="ak-insights-showcase__featured-excerpt">{heroExcerpt}</p>
              )}
              <Link
                href={heroHref}
                className="ak-insights-showcase__link"
                data-ga-event="insights_featured_click"
                data-ga-label={featured.title}
              >
                Know more
                <span
                  className="ak-insights-showcase__link-arrow material-symbols-outlined"
                  aria-hidden="true"
                >
                  arrow_forward_ios
                </span>
              </Link>
            </div>
          </div>

          {/* Secondary cards */}
          {cards.length > 0 && (
            <div className="ak-insights-showcase__cards">
              {cards.map((insight) => {
                const img =
                  insight.heroImage && typeof insight.heroImage === 'object'
                    ? (insight.heroImage as Media)
                    : null
                const excerpt = insight.meta?.description ?? null
                const href = `/${locale}/insights/${insight.slug}`

                return (
                  <div key={insight.id} className="ak-insights-showcase__card">
                    {img?.url && (
                      <div className="ak-insights-showcase__card-img-wrap">
                        <Image
                          src={img.url}
                          alt={img.alt ?? insight.title}
                          fill
                          className="ak-insights-showcase__card-img"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="ak-insights-showcase__card-content">
                      <p className="ak-insights-showcase__card-title">{insight.title}</p>
                      {excerpt && (
                        <p className="ak-insights-showcase__card-excerpt">{excerpt}</p>
                      )}
                      <Link
                        href={href}
                        className="ak-insights-showcase__link"
                        data-ga-event="insights_card_click"
                        data-ga-label={insight.title}
                      >
                        Know more
                        <span
                          className="ak-insights-showcase__link-arrow material-symbols-outlined"
                          aria-hidden="true"
                        >
                          arrow_forward_ios
                        </span>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Wire component in RenderBlocks**

In `src/blocks/RenderBlocks.tsx`, add the import:

```ts
import { InsightsShowcaseBlock } from '@/blocks/InsightsShowcase/Component'
```

Add the entry to `blockComponents`:

```ts
insightsShowcase: InsightsShowcaseBlock,
```

- [ ] **Step 4: Type-check**

```bash
pnpm tsc --noEmit 2>&1 | grep -i "insights" | head -20
```

Expected: no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/blocks/InsightsShowcase/ src/blocks/RenderBlocks.tsx
git commit -m "feat(insights-showcase): add Component and styles"
```

---

### Task 5: Update seed data

**Files:**
- Modify: `src/endpoints/seed/insights.ts` — mark all 4 insights as `featured: true`
- Modify: `src/endpoints/seed/pages/home.ts` — replace `archive` block with `insightsShowcase`

- [ ] **Step 1: Mark insights as featured in seed**

In `src/endpoints/seed/insights.ts`, update the `data` object inside the `seedPosts` function to include `featured: true`:

```ts
const data = {
  title: post.title,
  slug: post.slug,
  _status: 'published' as const,
  heroImage: heroImage.id,
  content: simpleRichText(post.excerpt),
  publishedAt: new Date().toISOString(),
  featured: true,
  meta: { image: heroImage.id, description: post.excerpt },
}
```

Note: also add `description: post.excerpt` to `meta` so the excerpt populates in the showcase.

- [ ] **Step 2: Replace archive block with insightsShowcase in home seed**

In `src/endpoints/seed/pages/home.ts`, find the block with `blockType: 'archive'` and replace it with:

```ts
{
  blockType: 'insightsShowcase' as const,
  blockName: 'Insights Showcase — Home',
  eyebrow: 'INSIGHTS',
  heading: 'What brands need to know before showing up in the right place.',
},
```

Also add the Spanish version — find where the Es layout is built and add:

```ts
{
  blockType: 'insightsShowcase' as const,
  blockName: 'Insights Showcase — Home',
  eyebrow: 'INSIGHTS',
  heading: 'Lo que las marcas deben saber antes de aparecer en el lugar correcto.',
},
```

- [ ] **Step 3: Run seed and verify**

```bash
pnpm dev
```

Then in another terminal:

```bash
curl -s http://localhost:3000/next/seed/run | jq '.message'
```

Expected: `"Seeded successfully"` (or similar success message).

- [ ] **Step 4: Commit**

```bash
git add src/endpoints/seed/insights.ts src/endpoints/seed/pages/home.ts
git commit -m "feat(insights-showcase): update seed with featured insights and home block"
```

---

### Task 6: Regenerate import map and final type check

- [ ] **Step 1: Regenerate importMap**

```bash
pnpm generate:importmap
```

Expected: `src/app/(payload)/admin/importMap.js` updated.

- [ ] **Step 2: Full type check**

```bash
pnpm tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Lint**

```bash
pnpm lint
```

Expected: 0 errors (warnings OK).

- [ ] **Step 4: Final commit**

```bash
git add src/app/\(payload\)/admin/importMap.js
git commit -m "chore: regenerate importMap after InsightsShowcase block"
```
