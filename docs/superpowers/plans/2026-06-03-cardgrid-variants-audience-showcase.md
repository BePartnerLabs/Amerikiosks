# CardGrid Variants + AudienceShowcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the CardGrid icon/pillar variant styles and build the AudienceShowcase block end-to-end, including seeding the 4 audience sub-pages and wiring the home page.

**Architecture:** CardGrid needs two CSS fixes (pillar card eyebrow accent color; icon wrapper with tinted bg) and a breakpoint verification. AudienceShowcase is a new async server component that reads `page.hero.media` via depth-1 population, registered in the Pages collection and RenderBlocks.

**Tech Stack:** Next.js 15 App Router, Payload CMS 3, TypeScript, CSS (no Tailwind — BPL DS tokens), Vitest + Testing Library

---

## File Map

### Modified
- `src/blocks/CardGrid/styles.css` — fix pillar card-eyebrow color, add icon wrapper styles, verify breakpoints
- `src/collections/Pages/index.ts` — add `AudienceShowcase` to blocks array
- `src/blocks/RenderBlocks.tsx` — register `audienceShowcase` → `AudienceShowcaseServer`
- `src/endpoints/seed/pages/home.ts` — add `audienceShowcase` block after `trustStrip`
- `tests/unit/blocks/CardGrid.test.tsx` — add tests for icon wrapper and pillar eyebrow color class

### Created
- `src/blocks/AudienceShowcase/config.ts` — Payload block schema
- `src/blocks/AudienceShowcase/Component.tsx` — pure presentational component (takes populated data)
- `src/blocks/AudienceShowcase/Server.tsx` — async server component, depth-1 page population
- `src/blocks/AudienceShowcase/styles.css` — image overlay card styles, responsive grid
- `src/endpoints/seed/pages/audience.ts` — seeds 4 audience sub-pages (For Brands, For Venues, For Agencies, For Emerging Brands)
- `tests/unit/blocks/AudienceShowcase.test.tsx` — unit tests for the presentational component
- `tests/unit/blocks/CardGrid.test.tsx` — extended (icon + pillar variant coverage)

---

## Task 1: Fix CardGrid CSS — pillar card eyebrow + icon wrapper

**Files:**
- Modify: `src/blocks/CardGrid/styles.css`
- Modify: `src/blocks/CardGrid/Component.tsx`
- Modify: `tests/unit/blocks/CardGrid.test.tsx`

The pillar card eyebrow should use `--ak-accent` (not `--bp-color-muted`). The icon variant needs a 36px tinted container wrapping the icon glyph.

- [ ] **Step 1: Write failing tests**

Add to `tests/unit/blocks/CardGrid.test.tsx` after the existing tests:

```tsx
it('renders pillar card eyebrow with card-eyebrow class', () => {
  const { container } = render(
    <CardGridBlock
      {...base}
      variant="pillar"
      items={[{ id: 'i1', title: 'T', eyebrow: 'STRATEGY', body: null }]}
    />,
  )
  const el = container.querySelector('.ak-card-grid__card-eyebrow')
  expect(el).not.toBeNull()
  expect(el?.textContent).toBe('STRATEGY')
})

it('renders icon variant card with icon wrapper', () => {
  const { container } = render(
    <CardGridBlock
      {...base}
      variant="icon"
      items={[{ id: 'i1', title: 'Hotels', icon: '🏨', body: null }]}
    />,
  )
  expect(container.querySelector('.ak-card-grid__card-icon-wrap')).not.toBeNull()
  expect(container.querySelector('.ak-card-grid__card-icon')).not.toBeNull()
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /path/to/project && pnpm test:int -- --reporter=verbose tests/unit/blocks/CardGrid.test.tsx
```

Expected: 2 new tests fail (icon wrapper selector not found).

- [ ] **Step 3: Wrap icon in Component.tsx**

In `src/blocks/CardGrid/Component.tsx`, replace:

```tsx
{item.icon && variant === 'icon' && (
  <span
    className="ak-card-grid__card-icon"
    aria-hidden="true"
  >
    {item.icon}
  </span>
)}
```

with:

```tsx
{item.icon && variant === 'icon' && (
  <span className="ak-card-grid__card-icon-wrap" aria-hidden="true">
    <span className="ak-card-grid__card-icon">{item.icon}</span>
  </span>
)}
```

- [ ] **Step 4: Update styles.css**

In `src/blocks/CardGrid/styles.css`, replace the existing icon rule:

```css
.ak-card-grid--icon .ak-card-grid__card-icon {
  font-size: 2rem;
  line-height: 1;
  color: var(--ak-accent, #ec254e);
}
```

with:

```css
.ak-card-grid--icon .ak-card-grid__card-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  background-color: color-mix(in srgb, var(--ak-accent, #ec254e) 12%, transparent);
  border-radius: 0.5rem;
}

.ak-card-grid--icon .ak-card-grid__card-icon {
  font-size: 1.25rem;
  line-height: 1;
}
```

Also fix pillar card eyebrow color — replace:

```css
.ak-card-grid--pillar .ak-card-grid__card-eyebrow {
  margin: 0;
  font-size: var(--bp-text-xs, 0.75rem);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--bp-color-muted, #6b7280);
}
```

with:

```css
.ak-card-grid--pillar .ak-card-grid__card-eyebrow {
  margin: 0;
  font-size: var(--bp-text-xs, 0.75rem);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ak-accent, #ec254e);
}
```

- [ ] **Step 5: Run tests**

```bash
pnpm test:int -- --reporter=verbose tests/unit/blocks/CardGrid.test.tsx
```

Expected: all tests pass (10 total).

- [ ] **Step 6: Commit**

```bash
git add src/blocks/CardGrid/Component.tsx src/blocks/CardGrid/styles.css tests/unit/blocks/CardGrid.test.tsx
git commit -m "fix(card-grid): icon wrapper container + pillar card eyebrow accent color"
```

---

## Task 2: Create AudienceShowcase Payload block config

**Files:**
- Create: `src/blocks/AudienceShowcase/config.ts`
- Modify: `src/collections/Pages/index.ts`

- [ ] **Step 1: Create config**

Create `src/blocks/AudienceShowcase/config.ts`:

```ts
import type { Block } from 'payload'

export const AudienceShowcase: Block = {
  slug: 'audienceShowcase',
  interfaceName: 'AudienceShowcaseBlock',
  labels: { singular: 'Audience Showcase', plural: 'Audience Showcases' },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      admin: { description: 'Small label above heading, e.g. "WHO IT\'S FOR"' },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'subheading',
      type: 'text',
      localized: true,
    },
    {
      name: 'items',
      type: 'array',
      minRows: 2,
      maxRows: 6,
      fields: [
        {
          name: 'page',
          type: 'relationship',
          relationTo: 'pages',
          required: true,
          admin: { description: 'Pulls title + hero image from this page automatically.' },
        },
        {
          name: 'label',
          type: 'text',
          localized: true,
          admin: { description: 'Overrides the page title on the card if set.' },
        },
        {
          name: 'cta',
          type: 'text',
          localized: true,
          admin: { description: 'CTA link label, e.g. "Explore brand programs"' },
        },
      ],
    },
  ],
}
```

- [ ] **Step 2: Register in Pages collection**

In `src/collections/Pages/index.ts`, add the import at the top with existing block imports:

```ts
import { AudienceShowcase } from '../../blocks/AudienceShowcase/config'
```

Then in the `blocks` array (find the line with `[CallToAction, Content, MediaBlock, Archive, FormBlock, CardGrid, TrustStrip]`), add `AudienceShowcase`:

```ts
blocks: [CallToAction, Content, MediaBlock, Archive, FormBlock, CardGrid, TrustStrip, AudienceShowcase],
```

- [ ] **Step 3: Run generate:types and generate:importmap**

```bash
pnpm generate:types && pnpm generate:importmap
```

Expected: `src/payload-types.ts` now includes `AudienceShowcaseBlock` type. No errors.

- [ ] **Step 4: Commit**

```bash
git add src/blocks/AudienceShowcase/config.ts src/collections/Pages/index.ts src/payload-types.ts src/app/\(payload\)/admin/importMap.js
git commit -m "feat(audience-showcase): add Payload block config and register in Pages"
```

---

## Task 3: AudienceShowcase presentational component + styles

**Files:**
- Create: `src/blocks/AudienceShowcase/Component.tsx`
- Create: `src/blocks/AudienceShowcase/styles.css`
- Create: `tests/unit/blocks/AudienceShowcase.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/blocks/AudienceShowcase.test.tsx`:

```tsx
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { AudienceShowcaseBlock } from '@/blocks/AudienceShowcase/Component'
import type { AudienceShowcaseBlock as AudienceShowcaseBlockType } from '@/payload-types'
import type { Page } from '@/payload-types'

const makePage = (slug: string, title: string): Page =>
  ({
    id: slug,
    slug,
    title,
    hero: { type: 'none' },
    layout: [],
    meta: {},
    updatedAt: '',
    createdAt: '',
  }) as unknown as Page

const base: AudienceShowcaseBlockType = {
  blockType: 'audienceShowcase',
  blockName: 'Audience Showcase — Home',
  id: 'as-1',
  heading: 'One platform.\nFour ways to show up with purpose.',
  eyebrow: "WHO IT'S FOR",
  items: [
    { id: 'item-1', page: makePage('for-brands', 'For Brands'), cta: 'Explore brand programs' },
    { id: 'item-2', page: makePage('for-venues', 'For Venues'), cta: 'Explore venue revenue' },
  ],
}

describe('AudienceShowcaseBlock', () => {
  afterEach(cleanup)

  it('renders section landmark with aria-label from heading', () => {
    render(<AudienceShowcaseBlock {...base} />)
    expect(screen.getByRole('region', { name: /one platform/i })).toBeInTheDocument()
  })

  it('renders heading', () => {
    render(<AudienceShowcaseBlock {...base} />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('renders eyebrow', () => {
    render(<AudienceShowcaseBlock {...base} />)
    expect(screen.getByText("WHO IT'S FOR")).toBeInTheDocument()
  })

  it('renders a card link for each item', () => {
    render(<AudienceShowcaseBlock {...base} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
  })

  it('uses page title as card label when no label override', () => {
    render(<AudienceShowcaseBlock {...base} />)
    expect(screen.getByText('For Brands')).toBeInTheDocument()
    expect(screen.getByText('For Venues')).toBeInTheDocument()
  })

  it('uses label override when provided', () => {
    const withOverride: AudienceShowcaseBlockType = {
      ...base,
      items: [{ id: 'item-1', page: makePage('for-brands', 'For Brands'), label: 'Brands', cta: 'Go' }],
    }
    render(<AudienceShowcaseBlock {...withOverride} />)
    expect(screen.getByText('Brands')).toBeInTheDocument()
    expect(screen.queryByText('For Brands')).toBeNull()
  })

  it('renders ga analytics attributes', () => {
    const { container } = render(<AudienceShowcaseBlock {...base} />)
    const section = container.querySelector('section')
    expect(section?.getAttribute('data-ga-block')).toBe('audience_showcase')
    expect(section?.getAttribute('data-ga-section')).toBe('Audience Showcase — Home')
  })

  it('renders card links with ga-event attribute', () => {
    render(<AudienceShowcaseBlock {...base} />)
    const links = screen.getAllByRole('link')
    for (const link of links) {
      expect(link.getAttribute('data-ga-event')).toBe('audience_card_click')
    }
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
pnpm test:int -- --reporter=verbose tests/unit/blocks/AudienceShowcase.test.tsx
```

Expected: all 7 tests fail (module not found).

- [ ] **Step 3: Create Component.tsx**

Create `src/blocks/AudienceShowcase/Component.tsx`:

```tsx
import Link from 'next/link'
import Image from 'next/image'
import type React from 'react'
import type { AudienceShowcaseBlock as AudienceShowcaseBlockProps, Page, Media } from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import './styles.css'

type PopulatedItem = NonNullable<AudienceShowcaseBlockProps['items']>[number] & {
  page: Page
}

function getHeroMedia(page: Page): Media | null {
  const hero = page.hero as { media?: Media | string | null } | undefined
  if (!hero?.media || typeof hero.media === 'string') return null
  return hero.media
}

export const AudienceShowcaseBlock: React.FC<AudienceShowcaseBlockProps> = ({
  eyebrow,
  heading,
  subheading,
  items,
  blockName,
  blockType,
}) => {
  if (!heading) return null

  const populatedItems = (items ?? []).filter(
    (item): item is PopulatedItem => item.page !== null && typeof item.page === 'object',
  )

  return (
    <section
      className="ak-audience-showcase"
      aria-label={heading}
      data-ga-block={toSnakeCase(blockType)}
      data-ga-section={blockName ?? undefined}
    >
      <div className="bp-content-grid">
        <div className="breakout ak-audience-showcase__inner">
          <div className="ak-audience-showcase__header">
            {eyebrow && <p className="ak-audience-showcase__eyebrow">{eyebrow}</p>}
            <h2 className="ak-audience-showcase__heading">{heading}</h2>
            {subheading && <p className="ak-audience-showcase__subheading">{subheading}</p>}
          </div>

          {populatedItems.length > 0 && (
            <div className="ak-audience-showcase__grid">
              {populatedItems.map((item) => {
                const media = getHeroMedia(item.page)
                const title = item.label ?? item.page.title
                const href = `/${item.page.slug}`

                return (
                  <Link
                    key={item.id ?? item.page.id}
                    href={href}
                    className="ak-audience-showcase__card"
                    data-ga-event="audience_card_click"
                    data-ga-label={item.page.title}
                  >
                    {media?.url && (
                      <Image
                        src={media.url}
                        alt={media.alt ?? title}
                        fill
                        className="ak-audience-showcase__card-img"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    )}
                    <div className="ak-audience-showcase__card-overlay" aria-hidden="true" />
                    <div className="ak-audience-showcase__card-content">
                      <p className="ak-audience-showcase__card-title">{title}</p>
                      {item.cta && (
                        <span className="ak-audience-showcase__card-cta" aria-hidden="true">
                          {item.cta} ›
                        </span>
                      )}
                    </div>
                  </Link>
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

- [ ] **Step 4: Create styles.css**

Create `src/blocks/AudienceShowcase/styles.css`:

```css
/* ═══════════════════════════════════════════════════════════════
   AudienceShowcase block
   ═══════════════════════════════════════════════════════════════ */

.ak-audience-showcase__inner {
  padding-block: var(--bp-space-16, 4rem);
  container: audience / inline-size;

}

.ak-audience-showcase__header {
  text-align: center;
  margin-bottom: var(--bp-space-10, 2.5rem);
}

.ak-audience-showcase__eyebrow {
  margin: 0 0 var(--bp-space-2, 0.5rem);
  font-size: var(--bp-text-xs, 0.75rem);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--bp-color-muted, #6b7280);
}

.ak-audience-showcase__heading {
  margin: 0;
  font-family: var(--font-poppins, sans-serif);
  font-size: clamp(1.75rem, 2.5vw + 1rem, 3rem);
  font-weight: 700;
  line-height: 1.2;
  color: var(--bp-color-heading, #0f1e3c);
  white-space: pre-line;
}

.ak-audience-showcase__subheading {
  margin: var(--bp-space-4, 1rem) auto 0;
  font-size: var(--bp-text-base, 1rem);
  color: var(--bp-color-muted, #6b7280);
  line-height: 1.6;
  max-width: 60ch;
}

/* ─── Grid ───────────────────────────────────────────────────── */

.ak-audience-showcase__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--bp-space-4, 1rem);
}

/* ─── Card ───────────────────────────────────────────────────── */

.ak-audience-showcase__card {
  position: relative;
  display: block;
  height: 25rem; /* 400px desktop */
  border-radius: var(--bp-radius-md, 0.75rem);
  overflow: hidden;
  text-decoration: none;
  background-color: var(--ak-header-bg, #0e1117);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.ak-audience-showcase__card-img {
  object-fit: cover;
  transition: transform 0.35s ease;
}

.ak-audience-showcase__card:hover .ak-audience-showcase__card-img {
  transform: scale(1.04);
}

.ak-audience-showcase__card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.08) 55%);
}

.ak-audience-showcase__card-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--bp-space-5, 1.25rem) var(--bp-space-5, 1.25rem);
}

.ak-audience-showcase__card-title {
  margin: 0;
  font-size: var(--bp-text-xl, 1.25rem);
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.ak-audience-showcase__card-cta {
  display: block;
  margin-top: var(--bp-space-2, 0.5rem);
  font-size: var(--bp-text-sm, 0.875rem);
  font-weight: 600;
  color: var(--ak-accent, #ec254e);
}

/* ─── Responsive ─────────────────────────────────────────────── */

@media (max-width: 64rem) {
  /* 640–1024px: 2 col, smaller card height */
  .ak-audience-showcase__card {
    height: 17.5rem; /* 280px */
  }
}

@media (max-width: 40rem) {
  /* < 640px: 1 col, hide CTA text, card 220px */
  .ak-audience-showcase__grid {
    grid-template-columns: 1fr;
  }

  .ak-audience-showcase__card {
    height: 13.75rem; /* 220px */
  }

  .ak-audience-showcase__card-cta {
    display: none;
  }
}
```

- [ ] **Step 5: Run tests**

```bash
pnpm test:int -- --reporter=verbose tests/unit/blocks/AudienceShowcase.test.tsx
```

Expected: all 7 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/blocks/AudienceShowcase/Component.tsx src/blocks/AudienceShowcase/styles.css tests/unit/blocks/AudienceShowcase.test.tsx
git commit -m "feat(audience-showcase): presentational component and responsive styles"
```

---

## Task 4: AudienceShowcase server component + RenderBlocks registration

**Files:**
- Create: `src/blocks/AudienceShowcase/Server.tsx`
- Modify: `src/blocks/RenderBlocks.tsx`

The server component populates `items.page` at `depth: 1` so `page.hero.media` is available.

- [ ] **Step 1: Create Server.tsx**

Create `src/blocks/AudienceShowcase/Server.tsx`:

```tsx
import config from '@payload-config'
import { getPayload } from 'payload'
import type React from 'react'
import type { AudienceShowcaseBlock as AudienceShowcaseBlockProps } from '@/payload-types'
import { AudienceShowcaseBlock } from './Component'

export const AudienceShowcaseServer: React.FC<AudienceShowcaseBlockProps> = async (props) => {
  const { items, ...rest } = props

  if (!items || items.length === 0) {
    return <AudienceShowcaseBlock {...props} />
  }

  const payload = await getPayload({ config })

  const populatedItems = await Promise.all(
    items.map(async (item) => {
      if (!item.page || typeof item.page !== 'string') return item
      const page = await payload.findByID({
        collection: 'pages',
        id: item.page,
        depth: 1,
        overrideAccess: false,
      })
      return { ...item, page }
    }),
  )

  return (
    <AudienceShowcaseBlock
      {...rest}
      items={populatedItems}
    />
  )
}
```

- [ ] **Step 2: Register in RenderBlocks**

In `src/blocks/RenderBlocks.tsx`, add the import:

```tsx
import { AudienceShowcaseServer } from '@/blocks/AudienceShowcase/Server'
```

Add to `blockComponents`:

```tsx
audienceShowcase: AudienceShowcaseServer,
```

- [ ] **Step 3: Verify TypeScript**

```bash
pnpm tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/blocks/AudienceShowcase/Server.tsx src/blocks/RenderBlocks.tsx
git commit -m "feat(audience-showcase): async server component with depth-1 page population"
```

---

## Task 5: Seed the 4 audience sub-pages

**Files:**
- Create: `src/endpoints/seed/pages/audience.ts`
- Modify: `src/endpoints/seed/index.ts` (or wherever `seedHome` is called — find the top-level seed runner)

- [ ] **Step 1: Find seed runner**

```bash
grep -rn "seedHome" src/endpoints/seed/ --include="*.ts" -l
```

Open that file to see how `seedHome` is called and where to add the new seeder.

- [ ] **Step 2: Create audience.ts**

Create `src/endpoints/seed/pages/audience.ts`:

```ts
import path from 'node:path'
import type { Payload, PayloadRequest } from 'payload'
import { upsertPage } from './utils'

const audiencePages = [
  {
    slug: 'for-brands',
    title: 'For Brands',
    titleEs: 'Para Marcas',
    description:
      'Turn high-traffic venues into premium branded retail moments with Amerikiosks kiosk programs.',
    descriptionEs:
      'Convierte venues de alto tráfico en momentos de retail premium de marca con los programas de kiosk de Amerikiosks.',
  },
  {
    slug: 'for-venues',
    title: 'For Venues',
    titleEs: 'Para Venues',
    description:
      'Add a new revenue stream and elevate the guest experience with curated branded kiosks.',
    descriptionEs:
      'Añade una nueva fuente de ingresos y eleva la experiencia del huésped con kiosks de marca curados.',
  },
  {
    slug: 'for-agencies',
    title: 'For Agencies',
    titleEs: 'Para Agencias',
    description:
      'Deliver unforgettable retail activations for your brand clients through the Amerikiosks network.',
    descriptionEs:
      'Entrega activaciones de retail inolvidables para tus clientes de marca a través de la red de Amerikiosks.',
  },
  {
    slug: 'for-emerging-brands',
    title: 'For Emerging Brands',
    titleEs: 'Para Marcas Emergentes',
    description:
      'Launch your brand in premium venues without the overhead of a full retail build-out.',
    descriptionEs:
      'Lanza tu marca en venues premium sin los costos de una apertura retail completa.',
  },
]

export const seedAudiencePages = async (
  payload: Payload,
  req: PayloadRequest,
): Promise<Record<string, string>> => {
  payload.logger.info('— Seeding audience sub-pages...')

  const ids: Record<string, string> = {}

  for (const page of audiencePages) {
    const result = await upsertPage(
      payload,
      req,
      {
        title: page.title,
        slug: page.slug,
        hero: { type: 'lowImpact' as const, richText: null },
        layout: [],
        meta: { title: `${page.title} — Amerikiosks`, description: page.description },
      },
      {
        title: page.titleEs,
        slug: page.slug,
        hero: { type: 'lowImpact' as const, richText: null },
        layout: [],
        meta: { title: `${page.titleEs} — Amerikiosks`, description: page.descriptionEs },
      },
    )
    ids[page.slug] = result.id
  }

  return ids
}
```

> **Note:** Check what `upsertPage` returns. If it returns `void`, adjust: use `payload.find({ collection: 'pages', where: { slug: { equals: page.slug } } })` after the upsert to get the id.

- [ ] **Step 3: Import and call seedAudiencePages in the seed runner**

In the file found in Step 1, import and call `seedAudiencePages` before `seedHome` so the page IDs are available for the home seed:

```ts
import { seedAudiencePages } from './pages/audience'

// inside the runner:
const audiencePageIds = await seedAudiencePages(payload, req)
await seedHome(payload, req, audiencePageIds)
```

Update the `seedHome` function signature in `home.ts` to accept `audiencePageIds`:

```ts
export const seedHome = async (
  payload: Payload,
  req: PayloadRequest,
  audiencePageIds: Record<string, string> = {},
): Promise<void> => {
```

- [ ] **Step 4: Verify TypeScript**

```bash
pnpm tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/endpoints/seed/pages/audience.ts src/endpoints/seed/
git commit -m "feat(seed): add 4 audience sub-pages (For Brands, For Venues, For Agencies, For Emerging Brands)"
```

---

## Task 6: Add AudienceShowcase block to home seed

**Files:**
- Modify: `src/endpoints/seed/pages/home.ts`

- [ ] **Step 1: Add audienceShowcase block to home.ts**

In `src/endpoints/seed/pages/home.ts`, after the `trustStripBlock` definition and before `upsertPage`, add:

```ts
const audienceShowcaseBlock = {
  blockType: 'audienceShowcase' as const,
  blockName: 'Audience Showcase — Home',
  eyebrow: "WHO IT'S FOR",
  heading: 'One platform.\nFour ways to show up with purpose.',
  subheading:
    'Amerikiosks helps partners create branded retail experiences that are placed with intention and operated end to end.',
  items: [
    { page: audiencePageIds['for-brands'] ?? '', cta: 'Explore brand programs' },
    { page: audiencePageIds['for-venues'] ?? '', cta: 'Explore venue revenue' },
    { page: audiencePageIds['for-agencies'] ?? '', cta: 'Explore activations' },
    { page: audiencePageIds['for-emerging-brands'] ?? '', cta: 'Explore launch paths' },
  ],
}

const audienceShowcaseBlockEs = {
  ...audienceShowcaseBlock,
  eyebrow: 'PARA QUIÉN',
  heading: 'Una plataforma.\nCuatro formas de estar con propósito.',
  subheading:
    'Amerikiosks ayuda a los partners a crear experiencias de retail de marca colocadas con intención y operadas de principio a fin.',
  items: audienceShowcaseBlock.items.map((item) => ({
    ...item,
    cta: item.cta, // same CTA for now; translator can update in admin
  })),
}
```

Update the `layout` arrays in both `upsertPage` calls to add the block after `trustStrip`:

```ts
layout: [valuePropsBlock, trustStripBlock, audienceShowcaseBlock],
// ...
layout: [valuePropsBlockEs, trustStripBlockEs, audienceShowcaseBlockEs],
```

- [ ] **Step 2: Verify TypeScript**

```bash
pnpm tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Run tests**

```bash
pnpm test:int
```

Expected: all 63+ tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/endpoints/seed/pages/home.ts
git commit -m "feat(seed): wire AudienceShowcase block into home page seed"
```

---

## Task 7: Open PR

- [ ] **Step 1: Verify branch is not main**

```bash
git branch --show-current
```

If on `main`, create a branch first:
```bash
git checkout -b feat/cardgrid-variants-audience-showcase
```

- [ ] **Step 2: Push and open PR**

```bash
git push -u origin feat/cardgrid-variants-audience-showcase
gh pr create \
  --title "feat: complete CardGrid variants + add AudienceShowcase block" \
  --body "$(cat <<'EOF'
## Summary
- CardGrid icon variant: icon now renders in 36px accent-tinted container
- CardGrid pillar variant: card eyebrow color corrected to accent (was muted)
- AudienceShowcase block: new block with depth-1 page population, image-overlay cards, responsive grid
- Seeds 4 audience sub-pages (For Brands, For Venues, For Agencies, For Emerging Brands)
- Home page seed wired with AudienceShowcase block

## Test plan
- [ ] All unit tests pass (`pnpm test:int`)
- [ ] TypeScript clean (`pnpm tsc --noEmit`)
- [ ] Run seed locally and verify home page renders all 3 blocks
- [ ] Check mobile at 375px: CardGrid 1-col, AudienceShowcase cards 220px with no CTA text
- [ ] Check desktop 1280px: AudienceShowcase 2×2 grid, cards 400px, CTA visible

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
