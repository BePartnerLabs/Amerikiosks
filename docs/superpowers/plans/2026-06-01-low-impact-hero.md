# LowImpact Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the LowImpact hero into a styled, left-aligned, dark-navy page-title hero with a red accent bar, breadcrumb, richText, tags, and BreadcrumbList JSON-LD — then update seed data for Case Studies, Where It Works, and Why Amerikiosks pages.

**Architecture:** The component is a pure server component that renders a `<section>` with a CSS-based accent bar and injects JSON-LD via a `<script>` tag. Styles live in a co-located CSS file. Payload field conditions are widened to expose `breadcrumb` and `tags` for `lowImpact` pages. Seed files are updated to pass hero data using the existing `upsertPage` utility.

**Tech Stack:** React (server component), Next.js App Router, TailwindCSS v4 / custom CSS variables, Payload CMS 3.x, Vitest + Testing Library

---

## File Map

| File | Action |
|------|--------|
| `src/heros/LowImpact/index.tsx` | Rewrite |
| `src/heros/LowImpact/low-impact.css` | Create |
| `src/heros/config.ts` | Modify — widen conditions on `breadcrumb` and `tags` |
| `tests/unit/heros/LowImpactHero.test.tsx` | Create |
| `src/endpoints/seed/pages/case-studies.ts` | Modify — add hero data |
| `src/endpoints/seed/pages/where-it-works.ts` | Modify — add hero data |
| `src/endpoints/seed/pages/why-amerikiosks.ts` | Modify — add hero data |
| `src/CLAUDE.md` | Modify — add LowImpact row to status table |

---

## Task 1: Widen Payload field conditions

**Files:**
- Modify: `src/heros/config.ts`

- [ ] **Step 1: Update breadcrumb condition**

In `src/heros/config.ts`, change the `breadcrumb` field's `admin.condition` from:
```ts
condition: (_, { type } = {}) => type === 'mediumImpact',
```
to:
```ts
condition: (_, { type } = {}) => ['mediumImpact', 'lowImpact'].includes(type),
```

- [ ] **Step 2: Update tags condition**

In the same file, change the `tags` field's `admin.condition` from:
```ts
condition: (_, { type } = {}) => type === 'mediumImpact',
```
to:
```ts
condition: (_, { type } = {}) => ['mediumImpact', 'lowImpact'].includes(type),
```

- [ ] **Step 3: Verify TypeScript**

```bash
pnpm tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/heros/config.ts
git commit -m "feat(hero): expose breadcrumb and tags fields for lowImpact hero"
```

---

## Task 2: Write failing tests for LowImpactHero

**Files:**
- Create: `tests/unit/heros/LowImpactHero.test.tsx`

- [ ] **Step 1: Create the test file**

```tsx
// tests/unit/heros/LowImpactHero.test.tsx
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/components/RichText', () => ({
  default: ({ data }: { data: unknown }) => (
    <div data-testid="richtext">{JSON.stringify(data)}</div>
  ),
}))

import { LowImpactHero } from '@/heros/LowImpact'
import type { Page } from '@/payload-types'

type HeroProps = Page['hero']

const baseHero: HeroProps = {
  type: 'lowImpact',
  richText: {
    root: { type: 'root', children: [], direction: null, format: '', indent: 0, version: 1 },
  },
  links: [],
  media: null,
  backgroundVideo: null,
  breadcrumb: 'Home / Case Studies',
  tags: [{ label: 'Retail' }, { label: 'Venues' }],
}

describe('LowImpactHero', () => {
  afterEach(cleanup)

  it('renders section landmark', () => {
    render(<LowImpactHero {...baseHero} />)
    expect(screen.getByRole('region')).toBeInTheDocument()
  })

  it('renders breadcrumb text', () => {
    render(<LowImpactHero {...baseHero} />)
    expect(screen.getByText('Home / Case Studies')).toBeInTheDocument()
  })

  it('renders richText content', () => {
    render(<LowImpactHero {...baseHero} />)
    expect(screen.getByTestId('richtext')).toBeInTheDocument()
  })

  it('renders tag pills', () => {
    render(<LowImpactHero {...baseHero} />)
    expect(screen.getByText('Retail')).toBeInTheDocument()
    expect(screen.getByText('Venues')).toBeInTheDocument()
  })

  it('does not render tags list when tags is empty', () => {
    render(<LowImpactHero {...baseHero} tags={[]} />)
    expect(screen.queryByText('Retail')).toBeNull()
  })

  it('does not render breadcrumb when absent', () => {
    render(<LowImpactHero {...baseHero} breadcrumb={null} />)
    expect(screen.queryByText('Home / Case Studies')).toBeNull()
  })

  it('renders BreadcrumbList JSON-LD script when breadcrumb present', () => {
    const { container } = render(<LowImpactHero {...baseHero} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).not.toBeNull()
    const data = JSON.parse((script as Element).innerHTML)
    expect(data['@type']).toBe('BreadcrumbList')
    expect(data.itemListElement).toHaveLength(2)
    expect(data.itemListElement[0].name).toBe('Home')
    expect(data.itemListElement[1].name).toBe('Case Studies')
  })

  it('does not render JSON-LD when breadcrumb is absent', () => {
    const { container } = render(<LowImpactHero {...baseHero} breadcrumb={null} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).toBeNull()
  })

  it('accent bar is present in the DOM', () => {
    const { container } = render(<LowImpactHero {...baseHero} />)
    expect(container.querySelector('.ak-hero-page__accent')).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test:int tests/unit/heros/LowImpactHero.test.tsx
```
Expected: FAIL — `LowImpactHero` does not export the right shape yet.

---

## Task 3: Implement LowImpactHero component

**Files:**
- Create: `src/heros/LowImpact/low-impact.css`
- Rewrite: `src/heros/LowImpact/index.tsx`

- [ ] **Step 1: Create CSS file**

```css
/* src/heros/LowImpact/low-impact.css */
.ak-hero-page {
  background-color: var(--ak-header-bg);
  color: #fff;
}

.ak-hero-page__inner {
  padding-block: var(--bp-space-10, 2.5rem);
  display: flex;
  flex-direction: column;
  gap: var(--bp-space-5, 1.25rem);
}

.ak-hero-page__breadcrumb {
  margin: 0;
  font-size: var(--bp-text-sm, 0.875rem);
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.02em;
}

.ak-hero-page__heading-row {
  display: flex;
  align-items: flex-start;
  gap: var(--bp-space-4, 1rem);
}

.ak-hero-page__accent {
  width: 4px;
  flex-shrink: 0;
  background: var(--ak-accent, #ec254e);
  border-radius: 4px;
  align-self: stretch;
}

.ak-hero-page__heading-row h1,
.ak-hero-page__heading-row h2 {
  margin: 0;
  font-family: var(--font-poppins, sans-serif);
  font-size: clamp(1.75rem, 3vw + 1rem, 3rem);
  font-weight: 800;
  line-height: 1.1;
  color: #fff;
}

.ak-hero-page__subtitle {
  margin: 0;
  font-size: var(--bp-text-base, 1rem);
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.7);
  max-width: 56ch;
}

.ak-hero-page__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--bp-space-2, 0.5rem);
  list-style: none;
  margin: 0;
  padding: 0;
}

.ak-hero-page__tag {
  display: inline-block;
  padding: var(--bp-space-1, 0.25rem) var(--bp-space-3, 0.75rem);
  font-size: var(--bp-text-xs, 0.75rem);
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: var(--bp-radius-full, 9999px);
}
```

- [ ] **Step 2: Rewrite index.tsx**

```tsx
// src/heros/LowImpact/index.tsx
import type React from 'react'
import RichText from '@/components/RichText'
import type { Page } from '@/payload-types'
import './low-impact.css'

type LowImpactHeroType = Omit<Page['hero'], 'richText'> & {
  richText?: Page['hero']['richText']
}

function buildBreadcrumbJsonLd(breadcrumb: string) {
  const parts = breadcrumb.split(' / ').map((label) => label.trim())
  const itemListElement = parts.map((name, index) => {
    const isLast = index === parts.length - 1
    const slug = name === 'Home' ? '/' : `/${name.toLowerCase().replace(/\s+/g, '-')}`
    return {
      '@type': 'ListItem',
      position: index + 1,
      name,
      ...(isLast ? {} : { item: slug }),
    }
  })
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  }
}

export const LowImpactHero: React.FC<LowImpactHeroType> = ({ richText, breadcrumb, tags }) => {
  return (
    <section className="ak-hero-page" aria-label="Page hero">
      {breadcrumb && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumb)) }}
        />
      )}
      <div className="bp-content-grid">
        <div className="breakout ak-hero-page__inner">
          {breadcrumb && <p className="ak-hero-page__breadcrumb">{breadcrumb}</p>}

          {richText && (
            <div className="ak-hero-page__heading-row">
              <div className="ak-hero-page__accent" aria-hidden="true" />
              <RichText data={richText} enableGutter={false} />
            </div>
          )}

          {Array.isArray(tags) && tags.length > 0 && (
            <ul className="ak-hero-page__tags">
              {tags.map(({ label, id }, i) => (
                <li key={id ?? i}>
                  <span className="ak-hero-page__tag">{label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Run tests to verify they pass**

```bash
pnpm test:int tests/unit/heros/LowImpactHero.test.tsx
```
Expected: all 9 tests PASS.

- [ ] **Step 4: Run full test suite to check for regressions**

```bash
pnpm test:int
```
Expected: all tests PASS.

- [ ] **Step 5: TypeScript check**

```bash
pnpm tsc --noEmit
```
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/heros/LowImpact/index.tsx src/heros/LowImpact/low-impact.css tests/unit/heros/LowImpactHero.test.tsx
git commit -m "feat(hero): implement LowImpact hero with accent bar, breadcrumb, tags, and JSON-LD"
```

---

## Task 4: Seed Case Studies, Where It Works, and Why Amerikiosks pages

**Files:**
- Modify: `src/endpoints/seed/pages/case-studies.ts`
- Modify: `src/endpoints/seed/pages/where-it-works.ts`
- Modify: `src/endpoints/seed/pages/why-amerikiosks.ts`

- [ ] **Step 1: Update case-studies.ts**

```ts
// src/endpoints/seed/pages/case-studies.ts
import type { Payload, PayloadRequest } from 'payload'
import { upsertPage } from './utils'

const heroData = {
  type: 'lowImpact' as const,
  links: [],
  breadcrumb: 'Home / Case Studies',
  tags: [{ label: 'Retail' }, { label: 'Venues' }, { label: 'Brands' }],
  richText: {
    root: {
      type: 'root' as const,
      children: [
        {
          type: 'heading',
          children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Case Studies', version: 1 }],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          tag: 'h1',
          version: 1,
        },
        {
          type: 'paragraph',
          children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Read how brands and venues are growing with Amerikiosks.', version: 1 }],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          textFormat: 0,
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  },
}

const esHeroData = {
  ...heroData,
  breadcrumb: 'Inicio / Casos de Éxito',
  richText: {
    root: {
      type: 'root' as const,
      children: [
        {
          type: 'heading',
          children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Casos de Éxito', version: 1 }],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          tag: 'h1',
          version: 1,
        },
        {
          type: 'paragraph',
          children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Conoce cómo marcas y venues están creciendo con Amerikiosks.', version: 1 }],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          textFormat: 0,
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  },
}

export const seedCaseStudies = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding case-studies page...')
  await upsertPage(
    payload,
    req,
    { title: 'Case Studies', slug: 'case-studies', hero: heroData },
    { title: 'Casos de Éxito', slug: 'casos-de-exito', hero: esHeroData },
  )
}
```

- [ ] **Step 2: Update where-it-works.ts**

```ts
// src/endpoints/seed/pages/where-it-works.ts
import type { Payload, PayloadRequest } from 'payload'
import { upsertPage } from './utils'

const heroData = {
  type: 'lowImpact' as const,
  links: [],
  breadcrumb: 'Home / Where It Works',
  tags: [{ label: 'Malls' }, { label: 'Airports' }, { label: 'Stadiums' }],
  richText: {
    root: {
      type: 'root' as const,
      children: [
        {
          type: 'heading',
          children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Where It Works', version: 1 }],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          tag: 'h1',
          version: 1,
        },
        {
          type: 'paragraph',
          children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Amerikiosks operates in premium venues where foot traffic meets purchasing intent.', version: 1 }],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          textFormat: 0,
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  },
}

const esHeroData = {
  ...heroData,
  breadcrumb: 'Inicio / Dónde Funciona',
  richText: {
    root: {
      type: 'root' as const,
      children: [
        {
          type: 'heading',
          children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Dónde Funciona', version: 1 }],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          tag: 'h1',
          version: 1,
        },
        {
          type: 'paragraph',
          children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Amerikiosks opera en venues premium donde el tráfico peatonal se encuentra con la intención de compra.', version: 1 }],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          textFormat: 0,
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  },
}

export const seedWhereItWorks = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding where-it-works page...')
  await upsertPage(
    payload,
    req,
    { title: 'Where It Works', slug: 'where-it-works', hero: heroData },
    { title: 'Dónde Funciona', slug: 'donde-funciona', hero: esHeroData },
  )
}
```

- [ ] **Step 3: Update why-amerikiosks.ts**

```ts
// src/endpoints/seed/pages/why-amerikiosks.ts
import type { Payload, PayloadRequest } from 'payload'
import { upsertPage } from './utils'

const heroData = {
  type: 'lowImpact' as const,
  links: [],
  breadcrumb: 'Home / Why Amerikiosks',
  tags: [{ label: 'Turnkey' }, { label: 'Data-driven' }, { label: 'Scalable' }],
  richText: {
    root: {
      type: 'root' as const,
      children: [
        {
          type: 'heading',
          children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Why Amerikiosks', version: 1 }],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          tag: 'h1',
          version: 1,
        },
        {
          type: 'paragraph',
          children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'A fully managed kiosk platform built for brands that want presence without the operational burden.', version: 1 }],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          textFormat: 0,
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  },
}

const esHeroData = {
  ...heroData,
  breadcrumb: 'Inicio / Por Qué Amerikiosks',
  richText: {
    root: {
      type: 'root' as const,
      children: [
        {
          type: 'heading',
          children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Por Qué Amerikiosks', version: 1 }],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          tag: 'h1',
          version: 1,
        },
        {
          type: 'paragraph',
          children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Una plataforma de kioscos totalmente gestionada, diseñada para marcas que quieren presencia sin la carga operativa.', version: 1 }],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          textFormat: 0,
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  },
}

export const seedWhyAmerikiosks = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding why-amerikiosks page...')
  await upsertPage(
    payload,
    req,
    { title: 'Why Amerikiosks', slug: 'why-amerikiosks', hero: heroData },
    { title: 'Por Qué Amerikiosks', slug: 'por-que-amerikiosks', hero: esHeroData },
  )
}
```

- [ ] **Step 4: TypeScript check**

```bash
pnpm tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/endpoints/seed/pages/case-studies.ts src/endpoints/seed/pages/where-it-works.ts src/endpoints/seed/pages/why-amerikiosks.ts
git commit -m "feat(seed): add LowImpact hero data to case-studies, where-it-works, and why-amerikiosks pages"
```

---

## Task 5: Update docs

**Files:**
- Modify: `src/CLAUDE.md`

- [ ] **Step 1: Add LowImpact row to the status table**

In `src/CLAUDE.md`, add this row after the MediumImpact row:

```markdown
| Hero — LowImpact | Hero Variant | 85% | [→](./heros/LowImpact/README.md) |
```

- [ ] **Step 2: Commit**

```bash
git add src/CLAUDE.md
git commit -m "docs: add LowImpact hero to status table"
```
