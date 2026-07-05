# Machines Page Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `/machines` from a hardcoded Next.js route into an admin-editable Payload `Pages` document, with a new redesigned listing (tag filter pills + paginated card grid) and a new lightweight `simple` hero variant.

**Architecture:** `/machines` resolves through the existing `[locale]/[slug]/page.tsx` catch-all against a seeded `Pages` doc (slug `machines`). Its hero uses a new `simple` type (centered eyebrow+H1, no media/breadcrumbs — distinct from the existing dark/left-aligned `LowImpact`). Its listing content is a new `MachinesListing` block: a Server component fetches the full `Machine` catalog once (no server-side pagination), and a client component filters by tag and paginates entirely client-side — reusing the same interaction pattern (state + URL sync + animated indicator) `MachinesClient.tsx` already has today, so the redesign changes visuals, not the underlying UX. The bottom CTA banner is the existing `CallToAction` block added as a second layout entry — no new component.

**Tech Stack:** Next.js 16 App Router, Payload CMS 3.82.1 (Local API), React Server/Client Components, Vitest + Testing Library, TailwindCSS-free custom CSS following the BPL DS 3-level variable contract.

## Global Constraints

- No changes to the `Machines` collection schema — `name`, `slug`, `tagline`, `image`, `tags` already cover the new card design.
- `/machines/[slug]` (detail route) must remain untouched and functional throughout.
- CSS must follow the 3-level variable contract enforced by `scripts/validate-ds-tokens.mjs` (pre-commit hook blocks violations) — see `src/blocks/_template.css` and `src/blocks/CLAUDE.md`.
- After any Payload schema change (adding the `simple` hero type is a `select` option change, not a new collection field, but still changes the generated types): run `pnpm generate:types` then `pnpm generate:importmap`.
- Every task must leave `pnpm test:int` (Vitest) green before moving to the next task.
- No new `--ak-*` tokens; no hardcoded color literals in CSS (Rule 2); no `--ak-*` as a direct property value inside a `.bp-*` selector (Rule 4).
- This is a routing-mechanism change: the seeded `Pages` doc (Task 3) must exist before the old route file is deleted (Task 4), to avoid `/machines` 404ing in between.

---

### Task 1: `simple` hero variant

**Files:**
- Modify: `src/heros/config.ts`
- Create: `src/heros/Simple/index.tsx`
- Create: `src/heros/Simple/simple.css`
- Create: `tests/unit/SimpleHero/SimpleHero.test.tsx`
- Modify: `src/heros/RenderHero.tsx`

**Interfaces:**
- Consumes: `Page['hero']` shape from `payload-types.ts` (already has `richText`, `tags`, `links`, `type` — `type` will accept the new `'simple'` literal after `generate:types` in Step 6).
- Produces: `SimpleHero: React.FC<Omit<Page['hero'], 'richText'> & { richText?: Page['hero']['richText']; breadcrumbs?: Page['breadcrumbs'] }>` — same prop shape as `LowImpactHero`, so `RenderHero` can pass `{...props} breadcrumbs={breadcrumbs}` uniformly to any hero component.

- [ ] **Step 1: Add the `simple` option to the hero type select and extend the `tags` field condition**

Edit `src/heros/config.ts`:

```ts
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
        {
          label: 'Simple',
          value: 'simple',
        },
      ],
```

And change the `tags` field's `condition` (a few lines down) from:

```ts
        condition: (_, { type } = {}) => ['mediumImpact', 'lowImpact'].includes(type),
```

to:

```ts
        condition: (_, { type } = {}) => ['mediumImpact', 'lowImpact', 'simple'].includes(type),
```

Leave the `media`/`backgroundVideo` field conditions unchanged — `simple` must never show or require them.

- [ ] **Step 2: Write the failing test for `SimpleHero`**

Create `tests/unit/SimpleHero/SimpleHero.test.tsx`:

```tsx
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { SimpleHero } from '@/heros/Simple'

const richText = (headingText: string, eyebrowText: string) => ({
  root: {
    type: 'root' as const,
    version: 1 as const,
    direction: null,
    format: '' as const,
    indent: 0,
    children: [
      {
        type: 'paragraph' as const,
        version: 1 as const,
        children: [{ type: 'text' as const, version: 1 as const, text: eyebrowText }],
      },
      {
        type: 'heading' as const,
        tag: 'h1' as const,
        version: 1 as const,
        children: [{ type: 'text' as const, version: 1 as const, text: headingText }],
      },
    ],
  },
})

describe('SimpleHero', () => {
  afterEach(() => cleanup())

  it('renders the richText heading', () => {
    render(
      <SimpleHero
        type="simple"
        richText={richText('Find the right kiosk for your space.', 'EXPLORE OUR MODELS')}
      />,
    )
    expect(
      screen.getByRole('heading', { level: 1, name: 'Find the right kiosk for your space.' }),
    ).toBeInTheDocument()
    expect(screen.getByText('EXPLORE OUR MODELS')).toBeInTheDocument()
  })

  it('renders tags when provided', () => {
    render(
      <SimpleHero
        type="simple"
        richText={richText('Title', 'Eyebrow')}
        tags={[{ label: 'Full Size', id: 'tag-1' }]}
      />,
    )
    expect(screen.getByText('Full Size')).toBeInTheDocument()
  })

  it('does not render a breadcrumb even if breadcrumbs are passed', () => {
    render(
      <SimpleHero
        type="simple"
        richText={richText('Title', 'Eyebrow')}
        breadcrumbs={[{ label: 'Machines', url: '/machines', id: 'bc-1' }]}
      />,
    )
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm test:int -- SimpleHero`
Expected: FAIL — `Cannot find module '@/heros/Simple'`

- [ ] **Step 4: Implement `SimpleHero`**

Create `src/heros/Simple/index.tsx`:

```tsx
import type React from 'react'
import RichText from '@/components/RichText'
import type { Page } from '@/payload-types'
import './simple.css'

type SimpleHeroType = Omit<Page['hero'], 'richText'> & {
  richText?: Page['hero']['richText']
  breadcrumbs?: Page['breadcrumbs']
}

export const SimpleHero: React.FC<SimpleHeroType> = ({ richText, tags }) => {
  return (
    <section
      className="ak-hero-simple"
      aria-label="Page hero"
    >
      <div className="bp-content-grid">
        <div className="breakout ak-hero-simple__inner">
          {richText && (
            <div className="ak-hero-simple__heading">
              <RichText
                data={richText}
                enableGutter={false}
              />
            </div>
          )}

          {Array.isArray(tags) && tags.length > 0 && (
            <ul className="ak-hero-simple__tags">
              {tags.map(({ label, id }, i) => (
                <li key={id ?? i}>
                  <span className="ak-hero-simple__tag">{label}</span>
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

Create `src/heros/Simple/simple.css`:

```css
/* ═══════════════════════════════════════════════════════════════
   Simple hero — centered eyebrow + title, no media/breadcrumbs
   ═══════════════════════════════════════════════════════════════ */

.ak-hero-simple {
  --_background: var(--hero-simple-background, var(--bp-color-bg-elevated));
  background: var(--_background);
}

.ak-hero-simple__inner {
  padding-block: var(--bp-space-16, 4rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--bp-space-4, 1rem);
  text-align: center;
}

.ak-hero-simple__heading p:first-child {
  margin: 0 0 var(--bp-space-2, 0.5rem);
  font-size: var(--bp-text-sm);
  font-weight: var(--bp-font-weight-semibold, 600);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ak-accent);
}

.ak-hero-simple__heading h1 {
  margin: 0;
  font-family: var(--ak-title-1-font-family, sans-serif);
  font-size: clamp(1.75rem, 3vw + 1rem, var(--ak-title-1-font-size, 3rem));
  font-weight: var(--ak-title-1-font-weight, 600);
  line-height: var(--ak-title-1-line-height, 1.1);
  color: var(--bp-color-text);
}

.ak-hero-simple__tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--bp-space-2, 0.5rem);
  list-style: none;
  margin: 0;
  padding: 0;
}

.ak-hero-simple__tag {
  display: inline-block;
  padding: var(--bp-space-1) var(--bp-space-3);
  font-size: var(--bp-text-xs);
  font-weight: 500;
  color: var(--bp-color-text-muted);
  border: var(--md-semantic-border-width-default) solid var(--ak-surface-border);
  border-radius: var(--bp-radius-full);
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm test:int -- SimpleHero`
Expected: PASS (3 tests)

- [ ] **Step 6: Register `simple` in `RenderHero`**

Edit `src/heros/RenderHero.tsx`:

```ts
import type React from 'react'
import { HighImpactHero } from '@/heros/HighImpact'
import { LowImpactHero } from '@/heros/LowImpact'
import { MediumImpactHero } from '@/heros/MediumImpact'
import { SimpleHero } from '@/heros/Simple'
import type { Page } from '@/payload-types'

const heroes = {
  highImpact: HighImpactHero,
  lowImpact: LowImpactHero,
  mediumImpact: MediumImpactHero,
  simple: SimpleHero,
}
```

(Only the import line and the `heroes` map gain the new entry — the rest of the file is unchanged.)

- [ ] **Step 7: Regenerate Payload types and import map**

Run: `pnpm generate:types`
Run: `pnpm generate:importmap`

These update `payload-types.ts`'s `Page['hero']['type']` union to include `'simple'`, and register `SimpleHero` (if it were an admin-facing custom component — it isn't, so `generate:importmap` should produce no diff here, but run it anyway per project convention after any schema change).

- [ ] **Step 8: Run full test suite and commit**

Run: `pnpm test:int`
Expected: all tests pass, including the 3 new `SimpleHero` tests.

```bash
git add src/heros/config.ts src/heros/Simple src/heros/RenderHero.tsx tests/unit/SimpleHero payload-types.ts
git commit -m "feat(hero): add simple hero variant for centered eyebrow+title pages"
```

---

### Task 2: `MachinesListing` block

**Files:**
- Create: `src/blocks/MachinesListing/config.ts`
- Create: `src/blocks/MachinesListing/Server.tsx`
- Create: `src/blocks/MachinesListing/Component.tsx`
- Create: `src/blocks/MachinesListing/MachineCard.tsx`
- Create: `src/blocks/MachinesListing/styles.css`
- Create: `tests/unit/MachinesListing/MachinesListing.test.tsx`
- Modify: `src/blocks/RenderBlocks.tsx`
- Modify: `src/collections/Pages/index.ts`

**Interfaces:**
- Consumes: `Machine` and `Media` types from `@/payload-types`; `useInView` from `@/utilities/useInView` (existing hook, signature `useInView<T extends Element>(options?) => { ref: RefObject<T>, inView: boolean }`); `Link` from `@/i18n/routing`.
- Produces: `MachinesListingBlock: Block` (Payload block config, `slug: 'machinesListing'`), `MachinesListingServer: React.FC<MachinesListingBlockProps>` (registered in `RenderBlocks` under key `machinesListing`), `MachinesListingClient: React.FC<{ machines: Machine[]; allTags: string[]; itemsPerPage: number }>` (the interactive filter+pagination component consumed by `Server.tsx`), `MachineCard: React.FC<{ machine: Machine; index?: number }>` (single card, consumed by `MachinesListingClient`).

- [ ] **Step 1: Add the block config**

Create `src/blocks/MachinesListing/config.ts`:

```ts
import type { Block } from 'payload'

export const MachinesListing: Block = {
  slug: 'machinesListing',
  interfaceName: 'MachinesListingBlock',
  imageURL: '/block-previews/machines-listing.png',
  imageAltText: 'Machines Listing block — filterable, paginated machine card grid',
  labels: { singular: 'Machines Listing', plural: 'Machines Listings' },
  fields: [
    {
      name: 'itemsPerPage',
      type: 'number',
      defaultValue: 12,
      admin: { description: 'How many machines to show per page.' },
    },
  ],
}
```

- [ ] **Step 2: Write the failing test for the client filter+pagination component**

Create `tests/unit/MachinesListing/MachinesListing.test.tsx` (ported from `tests/unit/machines/MachinesClient.test.tsx`, with pagination cases added):

```tsx
import { act, cleanup, render, screen } from '@testing-library/react'
import type React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MachinesListingClient } from '@/blocks/MachinesListing/Component'
import type { Machine } from '@/payload-types'

const replace = vi.fn()
let searchParamsValue = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParamsValue,
}))

vi.mock('@/i18n/routing', () => ({
  Link: ({
    href,
    children,
    ...rest
  }: {
    href: { pathname: string; params?: Record<string, string> }
  } & React.ComponentPropsWithoutRef<'a'>) => (
    <a
      href={`/machines/${href.params?.slug}`}
      {...rest}
    >
      {children}
    </a>
  ),
}))

vi.mock('@/utilities/useInView', () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
}))

const makeMachine = (slug: string, name: string, tag: string): Machine =>
  ({
    id: slug,
    slug,
    name,
    tagline: `${name} tagline`,
    image: { id: slug, url: `/${slug}.jpg`, width: 800, height: 600 },
    tags: [{ label: tag, id: `${slug}-tag` }],
    layout: [],
    updatedAt: '',
    createdAt: '',
  }) as unknown as Machine

const machines = [
  makeMachine('full-size', 'Full-size branded machine', 'full-size'),
  makeMachine('compact', 'Compact footprint machine', 'compact'),
  makeMachine('campaign', 'Campaign activation unit', 'campaign'),
]

describe('MachinesListingClient', () => {
  afterEach(() => {
    cleanup()
    replace.mockClear()
    searchParamsValue = new URLSearchParams()
  })

  it('renders all machines when no tag filter is active and itemsPerPage is large', () => {
    render(
      <MachinesListingClient
        machines={machines}
        allTags={['full-size', 'compact', 'campaign']}
        itemsPerPage={12}
      />,
    )
    expect(screen.getByText('Full-size branded machine')).toBeInTheDocument()
    expect(screen.getByText('Compact footprint machine')).toBeInTheDocument()
    expect(screen.getByText('Campaign activation unit')).toBeInTheDocument()
  })

  it('renders only machines matching the active tag query param', () => {
    searchParamsValue = new URLSearchParams('tag=compact')
    render(
      <MachinesListingClient
        machines={machines}
        allTags={['full-size', 'compact', 'campaign']}
        itemsPerPage={12}
      />,
    )
    expect(screen.queryByText('Full-size branded machine')).not.toBeInTheDocument()
    expect(screen.getByText('Compact footprint machine')).toBeInTheDocument()
  })

  it('paginates the filtered list according to itemsPerPage', () => {
    render(
      <MachinesListingClient
        machines={machines}
        allTags={['full-size', 'compact', 'campaign']}
        itemsPerPage={2}
      />,
    )
    expect(screen.getByText('Full-size branded machine')).toBeInTheDocument()
    expect(screen.getByText('Compact footprint machine')).toBeInTheDocument()
    expect(screen.queryByText('Campaign activation unit')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
  })

  it('navigates to page 2 when its pagination control is clicked', () => {
    render(
      <MachinesListingClient
        machines={machines}
        allTags={['full-size', 'compact', 'campaign']}
        itemsPerPage={2}
      />,
    )
    act(() => {
      screen.getByRole('button', { name: '2' }).click()
    })
    expect(screen.getByText('Campaign activation unit')).toBeInTheDocument()
    expect(screen.queryByText('Full-size branded machine')).not.toBeInTheDocument()
  })

  it('resets to page 1 when the tag filter changes', () => {
    render(
      <MachinesListingClient
        machines={machines}
        allTags={['full-size', 'compact', 'campaign']}
        itemsPerPage={2}
      />,
    )
    act(() => {
      screen.getByRole('button', { name: '2' }).click()
    })
    act(() => {
      screen.getByRole('button', { name: 'Compact' }).click()
    })
    expect(screen.getByText('Compact footprint machine')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument()
  })

  it('syncs the URL with the selected tag when a filter chip is clicked', () => {
    render(
      <MachinesListingClient
        machines={machines}
        allTags={['full-size', 'compact', 'campaign']}
        itemsPerPage={12}
      />,
    )
    act(() => {
      screen.getByRole('button', { name: 'Compact' }).click()
    })
    expect(replace).toHaveBeenCalledWith(expect.stringContaining('tag=compact'), { scroll: false })
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm test:int -- MachinesListing`
Expected: FAIL — `Cannot find module '@/blocks/MachinesListing/Component'`

- [ ] **Step 4: Implement `MachineCard`**

Create `src/blocks/MachinesListing/MachineCard.tsx`:

```tsx
'use client'

import Image from 'next/image'
import { Link } from '@/i18n/routing'
import type { Machine, Media } from '@/payload-types'
import { useInView } from '@/utilities/useInView'

type Props = {
  machine: Machine
  index?: number
}

export const MachineCard: React.FC<Props> = ({ machine, index = 0 }) => {
  const { ref, inView } = useInView<HTMLAnchorElement>()
  const image = typeof machine.image === 'object' ? (machine.image as Media) : null
  const delay = (index % 6) * 70

  return (
    <Link
      ref={ref}
      href={{ pathname: '/machines/[slug]', params: { slug: machine.slug } }}
      className={`bp-card bp-card--interactive ak-machines-listing__card${inView ? ' ak-machines-listing__card--in-view' : ''}`}
      style={{ transitionDelay: `${delay}ms` } as React.CSSProperties}
      data-ga-event="machine_card_click"
      data-ga-label={machine.name}
    >
      {image?.url && (
        <div className="ak-machines-listing__card-image">
          <Image
            src={image.url}
            alt={machine.name}
            fill
            className="ak-machines-listing__card-img"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="ak-machines-listing__card-body">
        <p className="ak-machines-listing__card-name">{machine.name}</p>
        {machine.tagline && <p className="ak-machines-listing__card-tagline">{machine.tagline}</p>}
        <span className="bp-btn bp-btn--primary ak-machines-listing__card-button">Learn more</span>
      </div>
    </Link>
  )
}
```

- [ ] **Step 5: Implement `MachinesListingClient` (`Component.tsx`)**

Create `src/blocks/MachinesListing/Component.tsx`:

```tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type React from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Machine } from '@/payload-types'
import { MachineCard } from './MachineCard'

type Props = {
  machines: Machine[]
  allTags: string[]
  itemsPerPage: number
}

const formatTagLabel = (tag: string) =>
  tag
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

export const MachinesListingClient: React.FC<Props> = ({ machines, allTags, itemsPerPage }) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTag, setActiveTag] = useState(searchParams.get('tag') ?? '')
  const [page, setPage] = useState(Number(searchParams.get('page') ?? '1') || 1)
  const trackRef = useRef<HTMLDivElement>(null)
  const chipRefs = useRef(new Map<string, HTMLButtonElement>())
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (activeTag) {
      params.set('tag', activeTag)
    } else {
      params.delete('tag')
    }
    if (page > 1) {
      params.set('page', String(page))
    } else {
      params.delete('page')
    }
    const query = params.toString()
    router.replace(query ? `?${query}` : '?', { scroll: false })
  }, [activeTag, page, router])

  useLayoutEffect(() => {
    const chip = chipRefs.current.get(activeTag)
    const track = trackRef.current
    if (!chip || !track) return
    const trackRect = track.getBoundingClientRect()
    const chipRect = chip.getBoundingClientRect()
    setIndicatorStyle({
      width: chipRect.width,
      height: chipRect.height,
      transform: `translateX(${chipRect.left - trackRect.left + track.scrollLeft}px)`,
    })
  }, [activeTag])

  const filtered = activeTag
    ? machines.filter((m) => m.tags?.some((t) => t.label === activeTag))
    : machines

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const setTag = (tag: string) => {
    setActiveTag(tag)
    setPage(1)
  }

  return (
    <>
      <fieldset className="ak-machines-listing__filters">
        <legend className="sr-only">Filter by tag</legend>
        <div
          className="ak-machines-listing__filters-track"
          ref={trackRef}
        >
          <span
            className="ak-machines-listing__filter-indicator"
            style={indicatorStyle}
            aria-hidden="true"
          />
          <button
            type="button"
            ref={(el) => {
              if (el) chipRefs.current.set('', el)
              else chipRefs.current.delete('')
            }}
            className="ak-machines-listing__filter-chip"
            aria-pressed={activeTag === ''}
            onClick={() => setTag('')}
            data-ga-block="machines_page"
            data-ga-event="machines_filter"
            data-ga-label="all"
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              type="button"
              key={tag}
              ref={(el) => {
                if (el) chipRefs.current.set(tag, el)
                else chipRefs.current.delete(tag)
              }}
              className="ak-machines-listing__filter-chip"
              aria-pressed={activeTag === tag}
              onClick={() => setTag(tag)}
              data-ga-block="machines_page"
              data-ga-event="machines_filter"
              data-ga-label={tag}
            >
              {formatTagLabel(tag)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="ak-machines-listing__grid">
        {paged.map((machine, index) => (
          <MachineCard
            key={machine.id}
            machine={machine}
            index={index}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="ak-machines-listing__empty">No machines found for this tag.</p>
      )}

      {totalPages > 1 && (
        <nav
          className="ak-machines-listing__pagination"
          aria-label="Machines pagination"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              type="button"
              key={p}
              className="bp-btn ak-machines-listing__page-btn"
              aria-current={p === currentPage ? 'page' : undefined}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
        </nav>
      )}
    </>
  )
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm test:int -- MachinesListing`
Expected: PASS (6 tests)

- [ ] **Step 7: Write the failing test for `MachinesListingServer`**

This repo has no live-database integration tests — the established pattern for testing Payload-dependent server code (see `tests/unit/app/robots.test.ts`) is mocking the `payload` and `@payload-config` modules and asserting on the call/output, not hitting a real database. Follow that pattern here.

Create `tests/unit/MachinesListing/MachinesListingServer.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next-intl/server', () => ({ getLocale: vi.fn().mockResolvedValue('en') }))
vi.mock('@/utilities/useInView', () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
}))
vi.mock('@/i18n/routing', () => ({
  Link: ({
    href,
    children,
    ...rest
  }: {
    href: { pathname: string; params?: Record<string, string> }
  } & React.ComponentPropsWithoutRef<'a'>) => (
    <a
      href={`/machines/${href.params?.slug}`}
      {...rest}
    >
      {children}
    </a>
  ),
}))

const find = vi.fn()
vi.mock('payload', () => ({ getPayload: vi.fn().mockResolvedValue({ find }) }))

const makeMachine = (slug: string, name: string, tag: string) => ({
  id: slug,
  slug,
  name,
  tagline: `${name} tagline`,
  image: { id: slug, url: `/${slug}.jpg`, width: 800, height: 600 },
  tags: [{ label: tag, id: `${slug}-tag` }],
})

describe('MachinesListingServer', () => {
  it('fetches the machines collection and renders only present format tags', async () => {
    find.mockResolvedValue({
      docs: [
        makeMachine('full-size', 'Full-size branded machine', 'full-size'),
        makeMachine('compact', 'Compact footprint machine', 'compact'),
      ],
    })

    const { MachinesListingServer } = await import('@/blocks/MachinesListing/Server')
    const ui = await MachinesListingServer({
      itemsPerPage: 12,
      blockType: 'machinesListing',
    } as Parameters<typeof MachinesListingServer>[0])
    render(ui)

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'machines', locale: 'en' }),
    )
    expect(screen.getByRole('button', { name: 'Full Size' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Compact' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Campaign' })).not.toBeInTheDocument()
  })
})
```

Run: `pnpm test:int -- MachinesListingServer`
Expected: FAIL — `Cannot find module '@/blocks/MachinesListing/Server'`

- [ ] **Step 8: Implement `MachinesListingServer` (`Server.tsx`)**

Create `src/blocks/MachinesListing/Server.tsx`:

```tsx
import config from '@payload-config'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type React from 'react'
import type { Machine, MachinesListingBlock as MachinesListingBlockProps } from '@/payload-types'
import { MachinesListingClient } from './Component'

const formatTagOrder = ['full-size', 'compact', 'campaign', 'premium']

export const MachinesListingServer: React.FC<MachinesListingBlockProps> = async ({
  itemsPerPage,
}) => {
  const payload = await getPayload({ config })
  const locale = await getLocale()

  const result = await payload.find({
    collection: 'machines',
    depth: 1,
    overrideAccess: false,
    locale: locale as 'en' | 'es',
    limit: 200,
  })

  const machines = result.docs as Machine[]

  const presentTags = new Set(
    machines.flatMap((m) => (m.tags ?? []).map((t) => t.label)).filter(Boolean),
  )
  const allTags = formatTagOrder.filter((tag) => presentTags.has(tag))

  return (
    <section
      className="ak-machines-listing"
      aria-label="Machines"
    >
      <div className="bp-content-grid">
        <div className="breakout ak-machines-listing__inner">
          <MachinesListingClient
            machines={machines}
            allTags={allTags}
            itemsPerPage={itemsPerPage ?? 12}
          />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 9: Run the test to verify it passes**

Run: `pnpm test:int -- MachinesListingServer`
Expected: PASS

- [ ] **Step 10: Add block styles**

Create `src/blocks/MachinesListing/styles.css` (ported from `machines.css`, renamed to the block's BEM root, plus card/pagination additions):

```css
.ak-machines-listing__inner {
  padding-block: var(--bp-space-16, 4rem);
}

.ak-machines-listing__filters {
  position: sticky;
  top: var(--bp-space-4, 1rem);
  z-index: 10;
  min-width: 0;
  max-width: 100%;
  margin: 0 0 var(--bp-space-8, 2rem);
  padding: var(--bp-space-2, 0.5rem);
  border: 1px solid var(--ak-surface-border);
  border-radius: var(--bp-radius-full, 9999px);
  background: var(--ak-surface-background);
  box-shadow: var(--ak-shadow-lift);
}

.ak-machines-listing__filters-track {
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  min-width: 0;
  gap: var(--bp-space-2, 0.5rem);
  overflow-x: auto;
  scrollbar-width: none;
}

.ak-machines-listing__filters-track::-webkit-scrollbar {
  display: none;
}

.ak-machines-listing__filter-indicator {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: var(--bp-radius-full, 9999px);
  background: var(--ak-accent);
  z-index: 0;
}

@media (prefers-reduced-motion: no-preference) {
  .ak-machines-listing__filter-indicator {
    transition:
      transform 280ms var(--bp-ease, cubic-bezier(0.4, 0, 0.2, 1)),
      width 280ms var(--bp-ease, cubic-bezier(0.4, 0, 0.2, 1)),
      height 280ms var(--bp-ease, cubic-bezier(0.4, 0, 0.2, 1));
  }
}

.ak-machines-listing__filter-chip {
  position: relative;
  z-index: 1;
  flex: none;
  appearance: none;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  padding: var(--bp-space-2, 0.5rem) var(--bp-space-4, 1rem);
  border-radius: var(--bp-radius-full, 9999px);
  font-size: var(--bp-font-size-sm, 0.875rem);
  font-weight: var(--bp-font-weight-medium, 500);
  color: var(--bp-color-text-muted);
  background: transparent;
  transition:
    color 200ms var(--bp-ease, cubic-bezier(0.4, 0, 0.2, 1)),
    background-color 200ms var(--bp-ease, cubic-bezier(0.4, 0, 0.2, 1));
}

.ak-machines-listing__filter-chip:hover {
  color: var(--bp-color-text);
  background: var(--ak-surface-border);
}

.ak-machines-listing__filter-chip[aria-pressed='true'] {
  color: var(--bp-color-text-inverse);
}

.ak-machines-listing__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
  gap: var(--bp-space-6, 1.5rem);
  align-items: start;
}

.ak-machines-listing__card {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  background: var(--ak-surface-background);
  border-radius: var(--bp-radius-lg, 0.75rem);
  border: 1px solid var(--ak-surface-border);
  overflow: hidden;
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 400ms var(--bp-ease, cubic-bezier(0.4, 0, 0.2, 1)),
    transform 400ms var(--bp-ease, cubic-bezier(0.4, 0, 0.2, 1));
}

.ak-machines-listing__card--in-view {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .ak-machines-listing__card {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

.ak-machines-listing__card-image {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}

.ak-machines-listing__card-img {
  object-fit: cover;
}

.ak-machines-listing__card-body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--bp-space-2, 0.5rem);
  padding: var(--bp-space-4, 1rem);
}

.ak-machines-listing__card-name {
  font-weight: var(--bp-font-weight-semibold, 600);
  color: var(--bp-color-text);
}

.ak-machines-listing__card-tagline {
  font-size: var(--bp-font-size-sm, 0.875rem);
  color: var(--bp-color-text-muted);
}

.ak-machines-listing__card-button {
  margin-top: var(--bp-space-2, 0.5rem);
  pointer-events: none;
}

.ak-machines-listing__empty {
  color: var(--bp-color-text-muted);
  padding: var(--bp-space-4, 1rem) 0;
}

.ak-machines-listing__pagination {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--bp-space-2, 0.5rem);
  margin-top: var(--bp-space-8, 2rem);
}

.ak-machines-listing__page-btn[aria-current='page'] {
  --outline-solid-color: var(--ak-accent);
  background: var(--ak-accent);
  color: var(--bp-color-text-inverse);
}
```

Import it at the top of `Server.tsx` (add before the component definition, after the other imports):

```ts
import './styles.css'
```

- [ ] **Step 11: Register the block in `RenderBlocks` and `Pages` collection**

Edit `src/blocks/RenderBlocks.tsx` — add the import and map entry:

```ts
import { MachinesListingServer } from '@/blocks/MachinesListing/Server'
```

```ts
const blockComponents = {
  archive: ArchiveBlock,
  audienceShowcase: AudienceShowcaseServer,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  cardGrid: CardGridBlock,
  insightsShowcase: InsightsShowcaseBlock,
  projectsShowcase: ProjectsShowcaseBlock,
  trustStrip: TrustStripServer,
  formatsGrid: FormatsGridServer,
  processSteps: ProcessStepsBlock,
  faqWithForm: FAQWithFormServer,
  machinesListing: MachinesListingServer,
}
```

Edit `src/collections/Pages/index.ts` — add the import and register it in the `blocks` array (find the `fields: [ ... FormatsGrid, ... ]` array a few lines below the imports and add `MachinesListing` alongside it):

```ts
import { MachinesListing } from '../../blocks/MachinesListing/config'
```

```ts
                FormatsGrid,
                MachinesListing,
```

- [ ] **Step 12: Regenerate types and import map**

Run: `pnpm generate:types`
Run: `pnpm generate:importmap`

Confirm `payload-types.ts` now has a `MachinesListingBlock` interface with `itemsPerPage?: number | null`.

- [ ] **Step 13: Run full test suite and commit**

Run: `pnpm test:int`
Expected: all tests pass, including the 6 new `MachinesListingClient` tests and the 1 new `MachinesListingServer` test.

```bash
git add src/blocks/MachinesListing src/blocks/RenderBlocks.tsx src/collections/Pages/index.ts tests/unit/MachinesListing payload-types.ts
git commit -m "feat(blocks): add MachinesListing block with tag filter and pagination"
```

---

### Task 3: Seed the `machines` page

**Files:**
- Create: `src/endpoints/seed/pages/machines.ts`
- Modify: `src/endpoints/seed/pages/index.ts`

**Interfaces:**
- Consumes: `upsertPage` from `./utils` (signature: `(payload: Payload, req: PayloadRequest, en: {title, slug, ...PageExtra}, es: {title, slug, ...PageExtra}) => Promise<void>`).
- Produces: `seedMachines: (payload: Payload, req: PayloadRequest) => Promise<void>`, called from `seedPages`.

- [ ] **Step 1: Write `seedMachines`**

Create `src/endpoints/seed/pages/machines.ts`:

```ts
import type { Payload, PayloadRequest } from 'payload'
import { upsertPage } from './utils'

const richTextHeroEn = {
  root: {
    type: 'root' as const,
    version: 1 as const,
    direction: null,
    format: '' as const,
    indent: 0,
    children: [
      {
        type: 'paragraph' as const,
        version: 1 as const,
        children: [{ type: 'text' as const, version: 1 as const, text: 'EXPLORE OUR MODELS' }],
      },
      {
        type: 'heading' as const,
        tag: 'h1' as const,
        version: 1 as const,
        children: [
          {
            type: 'text' as const,
            version: 1 as const,
            text: 'Find the right kiosk for your space.',
          },
        ],
      },
    ],
  },
}

const richTextHeroEs = {
  root: {
    type: 'root' as const,
    version: 1 as const,
    direction: null,
    format: '' as const,
    indent: 0,
    children: [
      {
        type: 'paragraph' as const,
        version: 1 as const,
        children: [{ type: 'text' as const, version: 1 as const, text: 'EXPLORA NUESTROS MODELOS' }],
      },
      {
        type: 'heading' as const,
        tag: 'h1' as const,
        version: 1 as const,
        children: [
          {
            type: 'text' as const,
            version: 1 as const,
            text: 'Encuentra el kiosco ideal para tu espacio.',
          },
        ],
      },
    ],
  },
}

const richTextCta = (text: string) => ({
  root: {
    type: 'root' as const,
    version: 1 as const,
    direction: null,
    format: '' as const,
    indent: 0,
    children: [
      {
        type: 'heading' as const,
        tag: 'h2' as const,
        version: 1 as const,
        children: [{ type: 'text' as const, version: 1 as const, text }],
      },
    ],
  },
})

export const seedMachines = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding machines page...')

  await upsertPage(
    payload,
    req,
    {
      title: 'Machines',
      slug: 'machines',
      hero: {
        type: 'simple',
        richText: richTextHeroEn,
        links: [],
      },
      layout: [
        {
          blockType: 'machinesListing',
          blockName: 'Machines Catalog',
          itemsPerPage: 12,
        },
        {
          blockType: 'cta',
          blockName: 'Machines CTA',
          richText: richTextCta('Ready to place a kiosk in your location?'),
          links: [
            {
              link: {
                label: 'Contact Sales',
                type: 'custom',
                url: '/contact',
                appearance: 'default',
              },
            },
          ],
        },
      ],
    },
    {
      title: 'Máquinas',
      slug: 'machines',
      hero: {
        type: 'simple',
        richText: richTextHeroEs,
        links: [],
      },
      layout: [
        {
          blockType: 'machinesListing',
          blockName: 'Machines Catalog',
          itemsPerPage: 12,
        },
        {
          blockType: 'cta',
          blockName: 'Machines CTA',
          richText: richTextCta('¿Listo para colocar un kiosco en tu ubicación?'),
          links: [
            {
              link: {
                label: 'Contactar ventas',
                type: 'custom',
                url: '/contact',
                appearance: 'default',
              },
            },
          ],
        },
      ],
    },
  )
}
```

- [ ] **Step 2: Wire it into `seedPages`**

Edit `src/endpoints/seed/pages/index.ts` — add the import:

```ts
import { seedHome } from './home'
import { seedMachines } from './machines'
import { seedSolutions } from './solutions'
```

(insert alphabetically between `seedHome` and `seedSolutions`) and add the call near the end, after `seedSolutions`:

```ts
  await seedHome(payload, req, pageIds, postIds, mediaIds)
  await seedSolutions(payload, req)
  await seedMachines(payload, req)
```

- [ ] **Step 3: Run the seed locally and verify**

Run: `pnpm dev` (in one terminal), then trigger the seed endpoint per this project's existing seed mechanism (`SeedButton` in the admin dashboard, or `POST /api/seed` if that's how other seed runs are triggered in this repo — check `src/components/BeforeDashboard/SeedButton` for the exact call if unsure).

Verify in `/admin/collections/pages`: a `machines` page exists with hero type `Simple` and two layout blocks (`Machines Listing`, `Call to Action`).

- [ ] **Step 4: Run full test suite and commit**

Run: `pnpm test:int`
Expected: all tests still pass (this task adds no new automated tests — it's seed data, verified manually in Step 3 and again end-to-end in Task 4).

```bash
git add src/endpoints/seed/pages/machines.ts src/endpoints/seed/pages/index.ts
git commit -m "feat(seed): seed the machines page with simple hero and MachinesListing block"
```

---

### Task 4: Cut over routing and retire the old route

**Files:**
- Delete: `src/app/(frontend)/[locale]/machines/page.tsx`
- Delete: `src/app/(frontend)/[locale]/machines/MachinesClient.tsx`
- Delete: `src/app/(frontend)/[locale]/machines/MachineTile.tsx`
- Delete: `src/app/(frontend)/[locale]/machines/machines.css`
- Delete: `tests/unit/machines/MachinesClient.test.tsx`

**Interfaces:**
- Consumes: nothing new — this task removes code whose behavior is now fully covered by Task 1–3's `SimpleHero`, `MachinesListingClient`/`Server`, and the seeded `Pages` doc.
- Produces: nothing new — verifies the migration end-to-end.

- [ ] **Step 1: Delete the old hardcoded route and its now-superseded client components**

```bash
git rm "src/app/(frontend)/[locale]/machines/page.tsx"
git rm "src/app/(frontend)/[locale]/machines/MachinesClient.tsx"
git rm "src/app/(frontend)/[locale]/machines/MachineTile.tsx"
git rm "src/app/(frontend)/[locale]/machines/machines.css"
git rm tests/unit/machines/MachinesClient.test.tsx
```

Confirm `src/app/(frontend)/[locale]/machines/[slug]/` (the detail route directory) is untouched — do not delete anything under it.

- [ ] **Step 2: Verify no remaining references to the deleted modules**

Run: `grep -rn "MachinesClient\|MachineTile\|machines/machines.css" src tests --include="*.ts" --include="*.tsx"`
Expected: no output (empty) — confirms nothing else in the codebase still imports the deleted files.

- [ ] **Step 3: Run the seed, then manually verify `/machines` and `/machines/[slug]`**

Run: `pnpm dev`, trigger the seed (`SeedButton` in the admin dashboard — see `src/components/BeforeDashboard/SeedButton`), then in a browser:
- Visit `/machines` — confirm the new centered eyebrow+title hero renders, the red tag pills filter the grid, pagination appears once there are more machines than `itemsPerPage`, and the CTA banner renders at the bottom.
- Click into any machine card — confirm it still lands on `/machines/<slug>` and the existing detail page renders unchanged.
- Confirm the admin panel (`/admin/collections/pages`) now shows a `machines` document, editable like any other page.

- [ ] **Step 4: Run the full test suite and lint, then commit**

Run: `pnpm test:int`
Expected: all tests pass (this task removes tests, it adds none — the migration is verified by Task 1–3's automated tests plus this task's manual check).

Run: `pnpm lint`
Expected: no errors.

```bash
git add -A
git commit -m "chore(machines): retire hardcoded /machines route in favor of seeded Pages doc"
```
