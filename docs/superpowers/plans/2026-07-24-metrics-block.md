# Metrics Block Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "Metrics" Payload layout Block to the Amerikiosks website — heading + 2-6 stats (accent-colored number + label, count-up animation, scroll-in stagger) + optional CTA — registered both as a page-level block and as an insertable block inside `Content`'s rich text.

**Architecture:** Follows the existing `CardGrid` block's structure exactly: a Payload `Block` config (`config.ts`), a server component (`Component.tsx`) that renders the shared `SectionHeader`, a small `'use client'` component for the only interactive piece (`MetricsCounter.tsx`, mirroring `CarouselNav.tsx`), and a block-scoped stylesheet (`styles.css`) following the DS 3-level CSS variable contract. Registered in the same four places `CardGrid` is registered: `Pages` collection layout blocks, `RenderBlocks.tsx`, `Content` block's `BlocksFeature`, and `RichText`'s `jsxConverters`.

**Tech Stack:** Next.js 16 (App Router), Payload CMS 3.82.1, TypeScript, Vitest + Testing Library, TailwindCSS v4 + BPL DS (via `--bp-*`/`--ak-*` CSS variables), Biome.

## Global Constraints

- Full spec: `docs/superpowers/specs/2026-07-24-metrics-block-design.md` — read it before starting; this plan implements it verbatim.
- CSS must follow the DS 3-level variable rule enforced by `node scripts/validate-ds-tokens.mjs` (runs as a pre-commit/PostToolUse hook on every `.css` edit) — direct `--ak-*` values are fine on custom `.ak-metrics*` selectors, never inside `.bp-*` selectors without going through a Level 2 `--<component>-*` var.
- After any Payload field/config change, run `pnpm generate:types` then `pnpm generate:importmap`.
- Commit messages: lowercase first word after `type:` (commitlint `subject-case`), e.g. `feat: add metrics block config`.
- Tests: Vitest + Testing Library, following the exact patterns in `tests/unit/blocks/CardGrid.test.tsx` and `tests/unit/blocks/CardGridCarousel.test.tsx`.
- `IntersectionObserver` is already polyfilled as a no-op class in `vitest.setup.ts` (`globalThis.IntersectionObserver`) — tests must call the mock's `observe`/`callback` manually to simulate visibility, there's no real viewport in jsdom.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/blocks/Metrics/config.ts` | Payload `Block` config: `eyebrow`, `heading`, `items` (array), `link` group |
| `src/blocks/Metrics/Component.tsx` | Server component: renders `SectionHeader`, stats row, CTA link, JSON-LD is **not** needed here (no `ItemList` semantics like CardGrid — plain stats, skip) |
| `src/blocks/Metrics/MetricsCounter.tsx` | `'use client'` component: renders one stat's animated number (count-up + IntersectionObserver trigger), used by `Component.tsx` per item |
| `src/blocks/Metrics/styles.css` | All visual + responsive (2×2 grid on mobile) + scroll-driven stagger animation styles |
| `src/blocks/Metrics/README.md` | Block doc per `src/blocks/CLAUDE.md` process (copied from `_template.md`) |
| `tests/unit/blocks/Metrics.test.tsx` | Tests for `Component.tsx` |
| `tests/unit/blocks/MetricsCounter.test.tsx` | Tests for `MetricsCounter.tsx` |
| `src/collections/Pages/index.ts` | Modify: import `Metrics`, add to `layout` blocks array |
| `src/blocks/RenderBlocks.tsx` | Modify: import `MetricsBlock` component, add `metrics: MetricsBlock` to `blockComponents` |
| `src/blocks/Content/config.ts` | Modify: import `Metrics` config, add to `BlocksFeature({ blocks: [...] })` |
| `src/components/RichText/index.tsx` | Modify: import `MetricsBlock` + its props type, add to `NodeTypes` union and `jsxConverters.blocks.metrics` |
| `docs/blocks/README.md` | Modify: add index row for the new block |

---

### Task 1: Payload block config + registration wiring

**Files:**
- Create: `src/blocks/Metrics/config.ts`
- Modify: `src/collections/Pages/index.ts`
- Modify: `src/blocks/Content/config.ts`

**Interfaces:**
- Produces: `Metrics` (exported `Block` from `config.ts`, `slug: 'metrics'`, `interfaceName: 'MetricsBlock'`) — later tasks' `Component.tsx` consumes the generated `MetricsBlock` type from `@/payload-types` after Task 1's `generate:types` step.
- Produces field shape: `{ eyebrow?: string; heading: string; items: { id?: string; value: string; label: string }[]; link?: { label?: string; url?: string; type: 'custom' | 'reference'; reference?: Page | string } }`.

- [ ] **Step 1: Write the block config**

Create `src/blocks/Metrics/config.ts`:

```typescript
import type { Block } from 'payload'

export const Metrics: Block = {
  slug: 'metrics',
  interfaceName: 'MetricsBlock',
  imageURL: '/block-previews/metrics.png',
  imageAltText: 'Metrics block — heading with a row of key stats and an optional CTA',
  labels: {
    singular: { en: 'Metrics', es: 'Métricas' },
    plural: { en: 'Metrics', es: 'Métricas' },
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow',
      localized: true,
      admin: {
        description: 'Small label above the heading, e.g. "WHY AMERIKIOSKS"',
      },
    },
    {
      name: 'heading',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description:
          'Para destacar una palabra o frase en negrita, envuélvela en asteriscos dobles: **texto**',
      },
    },
    {
      name: 'items',
      type: 'array',
      minRows: 2,
      maxRows: 6,
      localized: true,
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
          admin: { description: 'e.g. "10+", "1000+", "30"' },
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: { description: 'e.g. "Years of Industry Experience"' },
        },
      ],
    },
    {
      name: 'link',
      type: 'group',
      label: 'CTA Button',
      admin: {
        description: 'Optional button shown below the stats.',
      },
      fields: [
        { name: 'label', type: 'text', localized: true },
        { name: 'url', type: 'text' },
        {
          name: 'type',
          type: 'radio',
          defaultValue: 'custom',
          options: [
            { label: 'Custom URL', value: 'custom' },
            { label: 'Internal page', value: 'reference' },
          ],
        },
        {
          name: 'reference',
          type: 'relationship',
          relationTo: 'pages',
          admin: { condition: (_, siblingData) => siblingData?.type === 'reference' },
        },
      ],
    },
  ],
}
```

- [ ] **Step 2: Register in the Pages collection layout blocks**

In `src/collections/Pages/index.ts`, add the import alongside the other block imports (after the `MediaBlock` import, alphabetical order matches existing style):

```typescript
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { Metrics } from '../../blocks/Metrics/config'
```

Then add `Metrics` to the `blocks` array (the array shown in the file — insert after `CardGrid`):

```typescript
              blocks: [
                CallToAction,
                Content,
                MediaBlock,
                Archive,
                FormBlock,
                CardGrid,
                Metrics,
                TrustStrip,
                AudienceShowcase,
                InsightsShowcase,
                ProjectsShowcase,
                FormatsGrid,
                MachinesListing,
                ProcessSteps,
                FAQWithForm,
                ClaimForm,
                SupportHub,
              ],
```

- [ ] **Step 3: Register in Content block's BlocksFeature**

In `src/blocks/Content/config.ts`, add the import:

```typescript
import { CardGrid } from '@/blocks/CardGrid/config'
import { Metrics } from '@/blocks/Metrics/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
```

And update the `BlocksFeature` call:

```typescript
          BlocksFeature({ blocks: [CardGrid, MediaBlock, Metrics] }),
```

- [ ] **Step 4: Generate types**

Run: `pnpm generate:types`
Expected: completes without error; `src/payload-types.ts` now contains a `MetricsBlock` interface, and the `Page['layout']` union and `ContentBlock`'s column `richText` block union both include it.

Verify with:
```bash
grep -n "MetricsBlock" src/payload-types.ts
```
Expected: at least one `export interface MetricsBlock {` line plus references in the `Page` layout union and the lexical block node union.

- [ ] **Step 5: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no new errors (existing unrelated errors, if any, are out of scope — only check nothing new references `Metrics`/`MetricsBlock` incorrectly). Since `Component.tsx` and `RenderBlocks.tsx`/`RichText/index.tsx` don't exist/aren't wired yet, this step just confirms the config + collection + Content edits compile.

- [ ] **Step 6: Commit**

```bash
git add src/blocks/Metrics/config.ts src/collections/Pages/index.ts src/blocks/Content/config.ts src/payload-types.ts
git commit -m "feat: add metrics block config"
```

---

### Task 2: MetricsCounter client component (count-up animation)

**Files:**
- Create: `src/blocks/Metrics/MetricsCounter.tsx`
- Test: `tests/unit/blocks/MetricsCounter.test.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks (pure React component, no generated types needed — takes `value: string` as a prop).
- Produces: `MetricsCounter` — `React.FC<{ value: string }>`, renders a `<span>` whose text content animates from a start number up to the parsed value, then displays `value` verbatim once done (preserving any non-numeric suffix like `+`). Task 3's `Component.tsx` renders `<MetricsCounter value={item.value} />` per stat.

The component:
- Parses the leading digits out of `value` via `/^(\d+)(.*)$/`. If there's no leading digit run, render `value` as static text (no animation, no observer).
- If there is a numeric part, compute `start = target >= 100 ? Math.round(target * 0.6) : 0`.
- Uses `IntersectionObserver` to trigger the animation once when the element enters the viewport (`threshold: 0.3`), then disconnects.
- Animates with `requestAnimationFrame` over `1200`ms using ease-out cubic (`1 - (1 - t) ** 3`), from `start` to `target`, rounding to the nearest integer each frame.
- Respects `prefers-reduced-motion: reduce` — checked via `window.matchMedia('(prefers-reduced-motion: reduce)').matches` — skips the observer/animation entirely and renders the final value immediately.
- Cleans up the observer and any in-flight `requestAnimationFrame` on unmount.

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/blocks/MetricsCounter.test.tsx`:

```typescript
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MetricsCounter } from '@/blocks/Metrics/MetricsCounter'

let observedCallback: IntersectionObserverCallback | null = null
let observedElement: Element | null = null

class MockIntersectionObserver {
  callback: IntersectionObserverCallback
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    observedCallback = callback
  }
  observe(el: Element) {
    observedElement = el
  }
  unobserve() {}
  disconnect() {}
}

function fireIntersect(isIntersecting: boolean) {
  if (!observedCallback || !observedElement) throw new Error('observer not attached')
  observedCallback(
    [{ isIntersecting, target: observedElement } as IntersectionObserverEntry],
    {} as IntersectionObserver,
  )
}

describe('MetricsCounter', () => {
  beforeEach(() => {
    observedCallback = null
    observedElement = null
    globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    )
    let now = 0
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      now += 100
      cb(now)
      return now
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders the static value before entering the viewport', () => {
    render(<MetricsCounter value="10+" />)
    expect(screen.getByText(/^0\+?$/)).toBeInTheDocument()
  })

  it('renders the final numeric value once fully animated after intersecting', () => {
    render(<MetricsCounter value="10+" />)
    act(() => fireIntersect(true))
    expect(screen.getByText('10+')).toBeInTheDocument()
  })

  it('preserves a non-numeric suffix like "+" on the final value', () => {
    render(<MetricsCounter value="20+" />)
    act(() => fireIntersect(true))
    expect(screen.getByText('20+')).toBeInTheDocument()
  })

  it('starts from 60% of target for 3+ digit numbers instead of animating from 0', () => {
    render(<MetricsCounter value="1000+" />)
    // Only observe the first rAF frame's rendered value, before it reaches the target.
    act(() => {
      vi.spyOn(window, 'requestAnimationFrame').mockImplementationOnce((cb: FrameRequestCallback) => {
        cb(1)
        return 1
      })
      fireIntersect(true)
    })
    const text = screen.getByText(/^\d+\+?$/).textContent ?? ''
    const shown = Number.parseInt(text, 10)
    expect(shown).toBeGreaterThanOrEqual(600)
  })

  it('renders non-numeric values as static text without animating', () => {
    render(<MetricsCounter value="N/A" />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('renders the final value immediately when prefers-reduced-motion is set', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    )
    render(<MetricsCounter value="30" />)
    expect(screen.getByText('30')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec vitest run tests/unit/blocks/MetricsCounter.test.tsx`
Expected: FAIL — `Cannot find module '@/blocks/Metrics/MetricsCounter'` (file doesn't exist yet).

- [ ] **Step 3: Implement MetricsCounter**

Create `src/blocks/Metrics/MetricsCounter.tsx`:

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'

const NUMERIC_PREFIX = /^(\d+)(.*)$/

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

export const MetricsCounter: React.FC<{ value: string }> = ({ value }) => {
  const match = value.match(NUMERIC_PREFIX)
  const target = match ? Number.parseInt(match[1], 10) : null
  const suffix = match ? match[2] : ''

  const start = target !== null && target >= 100 ? Math.round(target * 0.6) : 0
  const [display, setDisplay] = useState(start)
  const [done, setDone] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (target === null) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setDisplay(target)
      setDone(true)
      return
    }

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting) return
        observer.disconnect()

        const durationMs = 1200
        const startTime = performance.now()

        const tick = (now: number) => {
          const elapsed = now - startTime
          const t = Math.min(elapsed / durationMs, 1)
          const eased = easeOutCubic(t)
          const value = Math.round(start + (target - start) * eased)
          setDisplay(value)

          if (t < 1) {
            rafRef.current = requestAnimationFrame(tick)
          } else {
            setDone(true)
          }
        }

        rafRef.current = requestAnimationFrame(tick)
      },
      { threshold: 0.3 },
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [target, start])

  if (target === null) {
    return <span ref={ref}>{value}</span>
  }

  return (
    <span ref={ref}>
      {done ? `${target}${suffix}` : `${display}${suffix}`}
    </span>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec vitest run tests/unit/blocks/MetricsCounter.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/blocks/Metrics/MetricsCounter.tsx tests/unit/blocks/MetricsCounter.test.tsx
git commit -m "feat: add metrics counter animation component"
```

---

### Task 3: Metrics Component (server component)

**Files:**
- Create: `src/blocks/Metrics/Component.tsx`
- Test: `tests/unit/blocks/Metrics.test.tsx`

**Interfaces:**
- Consumes: `MetricsCounter` (Task 2, `React.FC<{ value: string }>`), `SectionHeader` (existing, `src/components/SectionHeader`, props `{ eyebrow?, heading, subtitle?, align? }`), `MetricsBlock` type from `@/payload-types` (generated in Task 1).
- Produces: `MetricsBlock` — `React.FC<MetricsBlockProps>` (name the component export `MetricsBlock`, matching the `CardGridBlock` naming convention) — consumed by Task 4's registration in `RenderBlocks.tsx` and `RichText/index.tsx`.

The component:
- Props come straight from the generated `MetricsBlock` Payload type (`{ eyebrow, heading, items, link, blockName, blockType }`).
- Returns `null` if there's no `heading` and no `items`.
- Resolves the CTA URL the same way `CardGrid`'s `resolveUrl` does (reference vs custom URL) — duplicate the small helper locally (it's an 8-line pure function, not worth extracting into a shared util for one extra caller per project convention of keeping blocks self-contained).
- Renders `<section className="ak-metrics" aria-label={heading} data-ga-block={toSnakeCase(blockType)}>`.
- Renders `<SectionHeader eyebrow={eyebrow} heading={heading} align="center" />` (no `subtitle` — this block has none).
- Renders `<div className="ak-metrics__stats">` containing one `<div className="ak-metrics__stat">` per item, each with `<span className="ak-metrics__stat-value"><MetricsCounter value={item.value} /></span>` and `<p className="ak-metrics__stat-label">{item.label}</p>`.
- Renders the CTA `<Link className="ak-metrics__cta-btn">` only when `ctaUrl && link?.label`.

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/blocks/Metrics.test.tsx`:

```typescript
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MetricsBlock } from '@/blocks/Metrics/Component'
import type { MetricsBlock as MetricsBlockType } from '@/payload-types'

const base: MetricsBlockType = {
  blockType: 'metrics',
  blockName: 'Metrics — Home',
  id: 'm-1',
  heading: 'We connect brands with people in the moments that matter most',
  items: [
    { id: 's1', value: '10+', label: 'Years of Industry Experience' },
    { id: 's2', value: '1000+', label: 'Active Kiosks Deployed' },
  ],
}

describe('MetricsBlock', () => {
  afterEach(cleanup)

  it('renders section landmark with aria-label', () => {
    render(<MetricsBlock {...base} />)
    expect(
      screen.getByRole('region', { name: /we connect brands with people/i }),
    ).toBeInTheDocument()
  })

  it('renders the heading', () => {
    render(<MetricsBlock {...base} />)
    expect(
      screen.getByRole('heading', { name: /we connect brands with people/i }),
    ).toBeInTheDocument()
  })

  it('renders eyebrow when provided', () => {
    render(
      <MetricsBlock
        {...base}
        eyebrow="WHY AMERIKIOSKS"
      />,
    )
    expect(screen.getByText('WHY AMERIKIOSKS')).toBeInTheDocument()
  })

  it('renders all stat labels', () => {
    render(<MetricsBlock {...base} />)
    expect(screen.getByText('Years of Industry Experience')).toBeInTheDocument()
    expect(screen.getByText('Active Kiosks Deployed')).toBeInTheDocument()
  })

  it('renders the correct number of stats', () => {
    const { container } = render(<MetricsBlock {...base} />)
    expect(container.querySelectorAll('.ak-metrics__stat')).toHaveLength(2)
  })

  it('sets data-ga-block from the block type', () => {
    const { container } = render(<MetricsBlock {...base} />)
    expect(container.querySelector('.ak-metrics')).toHaveAttribute('data-ga-block', 'metrics')
  })

  it('returns null when there is no heading and no items', () => {
    const { container } = render(
      <MetricsBlock
        {...base}
        heading=""
        items={[]}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('does not render a CTA button when link label/url are missing', () => {
    render(<MetricsBlock {...base} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders the CTA button when link label and url are present', () => {
    render(
      <MetricsBlock
        {...base}
        link={{ label: 'Build Your Retail Experience', url: '/contact', type: 'custom' }}
      />,
    )
    expect(
      screen.getByRole('link', { name: /build your retail experience/i }),
    ).toHaveAttribute('href', '/contact')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec vitest run tests/unit/blocks/Metrics.test.tsx`
Expected: FAIL — `Cannot find module '@/blocks/Metrics/Component'`.

- [ ] **Step 3: Implement Component.tsx**

Create `src/blocks/Metrics/Component.tsx`:

```typescript
import Link from 'next/link'
import type React from 'react'
import { SectionHeader } from '@/components/SectionHeader'
import type { MetricsBlock as MetricsBlockProps, Page } from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import { MetricsCounter } from './MetricsCounter'
import './styles.css'

function resolveUrl(link: MetricsBlockProps['link']): string | null {
  if (!link) return null
  if (link.type === 'reference' && link.reference && typeof link.reference === 'object') {
    return `/${(link.reference as Page).slug}`
  }
  return link.url ?? null
}

export const MetricsBlock: React.FC<MetricsBlockProps> = ({
  eyebrow,
  heading,
  items,
  link,
  blockType,
}) => {
  if (!heading && (!items || items.length === 0)) return null

  const ctaUrl = resolveUrl(link)

  return (
    <section
      className="ak-metrics"
      aria-label={heading}
      data-ga-block={toSnakeCase(blockType)}
    >
      <div className="bp-content-grid">
        <div className="breakout ak-metrics__inner">
          {heading && (
            <SectionHeader
              eyebrow={eyebrow}
              heading={heading}
              align="center"
            />
          )}

          {items && items.length > 0 && (
            <div className="ak-metrics__stats">
              {items.map((item, i) => (
                <div
                  key={item.id ?? i}
                  className="ak-metrics__stat"
                >
                  <span className="ak-metrics__stat-value">
                    <MetricsCounter value={item.value} />
                  </span>
                  <p className="ak-metrics__stat-label">{item.label}</p>
                </div>
              ))}
            </div>
          )}

          {ctaUrl && link?.label && (
            <div className="ak-metrics__cta">
              <Link
                href={ctaUrl}
                className="ak-metrics__cta-btn"
                data-ga-event="metrics_cta_click"
              >
                {link.label}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec vitest run tests/unit/blocks/Metrics.test.tsx`
Expected: PASS (9 tests). Note: this will fail until Task 4 creates `styles.css` (the `import './styles.css'` line) — if running this task in isolation before Task 4, create an empty `src/blocks/Metrics/styles.css` file first as a placeholder; Task 4 fills it in.

- [ ] **Step 5: Commit**

```bash
git add src/blocks/Metrics/Component.tsx tests/unit/blocks/Metrics.test.tsx
git commit -m "feat: add metrics block component"
```

---

### Task 4: Styles — visual design, responsive grid, scroll-driven stagger

**Files:**
- Create/modify: `src/blocks/Metrics/styles.css`

**Interfaces:**
- Consumes: class names produced by Task 3's `Component.tsx` (`.ak-metrics`, `.ak-metrics__inner`, `.ak-metrics__stats`, `.ak-metrics__stat`, `.ak-metrics__stat-value`, `.ak-metrics__stat-label`, `.ak-metrics__cta`, `.ak-metrics__cta-btn`).
- Produces: nothing consumed by later tasks (leaf of the dependency graph).

- [ ] **Step 1: Write the stylesheet**

Create (or overwrite the Task 3 placeholder) `src/blocks/Metrics/styles.css`:

```css
/* ═══════════════════════════════════════════════════════════════
   Metrics block — heading + stats row + optional CTA
   ═══════════════════════════════════════════════════════════════ */

.ak-metrics {
  container-type: inline-size;
  container-name: metrics;
}

.ak-metrics__inner {
  padding-block: var(--bp-space-16, 4rem);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ak-metrics__stats {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: var(--bp-space-10, 2.5rem);
  width: 100%;
}

.ak-metrics__stat {
  flex: 1;
  min-width: 9rem;
  padding-inline: var(--bp-space-6, 1.5rem);
  text-align: center;
  border-left: 1px solid var(--ak-color-border);
}

.ak-metrics__stat:first-child {
  border-left: none;
}

.ak-metrics__stat-value {
  display: block;
  font-weight: 700;
  font-size: 2.75rem;
  line-height: 1;
  color: var(--ak-accent);
}

.ak-metrics__stat-label {
  margin: var(--bp-space-3, 0.75rem) 0 0;
  font-weight: 600;
  font-size: var(--bp-text-sm, 0.875rem);
  color: var(--ak-color-heading);
}

.ak-metrics__cta {
  display: flex;
  justify-content: center;
  margin-top: var(--bp-space-10, 2.5rem);
}

.ak-metrics__cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  border: 2px solid currentColor;
  border-radius: var(--bp-radius-md, 0.75rem);
  font-weight: 600;
  font-size: var(--bp-text-sm, 0.875rem);
  text-decoration: none;
  color: var(--ak-color-heading);
  transition:
    background-color 0.15s,
    color 0.15s;
}

.ak-metrics__cta-btn:hover {
  background-color: currentColor;
  color: white;
}

/* ─── Mobile: 2×2 grid instead of a squeezed single row ────────── */
@container metrics (max-width: 40rem) {
  .ak-metrics__stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--bp-space-6, 1.5rem) 0;
  }

  .ak-metrics__stat {
    border-left: none;
    border-top: 1px solid var(--ak-color-border);
    padding-top: var(--bp-space-4, 1rem);
  }

  /* First row (items 1-2) has no top border to sit on */
  .ak-metrics__stat:nth-child(1),
  .ak-metrics__stat:nth-child(2) {
    border-top: none;
    padding-top: 0;
  }
}

/* ─── Scroll-in stagger — progressive enhancement, no JS ────────── */
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    @keyframes metrics-rise {
      from {
        opacity: 0;
        transform: translateY(1rem);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .ak-metrics__stat {
      animation: metrics-rise ease-out;
      animation-timeline: view();
      animation-range: entry 0% entry 40%;
    }

    .ak-metrics__stat:nth-child(1) {
      animation-delay: 0ms;
    }
    .ak-metrics__stat:nth-child(2) {
      animation-delay: 60ms;
    }
    .ak-metrics__stat:nth-child(3) {
      animation-delay: 120ms;
    }
    .ak-metrics__stat:nth-child(4) {
      animation-delay: 180ms;
    }
    .ak-metrics__stat:nth-child(5) {
      animation-delay: 240ms;
    }
    .ak-metrics__stat:nth-child(6) {
      animation-delay: 300ms;
    }
  }
}
```

- [ ] **Step 2: Validate DS token compliance**

Run: `node scripts/validate-ds-tokens.mjs src/blocks/Metrics/styles.css`
Expected: exits 0, no output (no violations — this file uses only `--bp-*` tokens directly and `--ak-*` tokens only on custom `.ak-metrics*` selectors, never inside a `.bp-*` selector).

- [ ] **Step 3: Run the full test suite to confirm nothing broke**

Run: `pnpm exec vitest run tests/unit/blocks/Metrics.test.tsx tests/unit/blocks/MetricsCounter.test.tsx`
Expected: PASS (all tests from Tasks 2 and 3, now with the real stylesheet imported instead of a placeholder).

- [ ] **Step 4: Lint**

Run: `pnpm lint`
Expected: no errors on the new files (Biome auto-formats via the project's PostToolUse hook on save, but re-run explicitly to confirm CI would pass).

- [ ] **Step 5: Commit**

```bash
git add src/blocks/Metrics/styles.css
git commit -m "feat: add metrics block styles and scroll animation"
```

---

### Task 5: Register in RenderBlocks and RichText, generate importmap, write block README

**Files:**
- Modify: `src/blocks/RenderBlocks.tsx`
- Modify: `src/components/RichText/index.tsx`
- Create: `src/blocks/Metrics/README.md`
- Modify: `docs/blocks/README.md`

**Interfaces:**
- Consumes: `MetricsBlock` component (Task 3, `React.FC<MetricsBlockProps>`), `MetricsBlock` type (Task 1's generated `@/payload-types`).
- Produces: nothing consumed elsewhere — this is the final wiring task that makes the block actually render on pages and inside rich text.

- [ ] **Step 1: Register in RenderBlocks.tsx**

In `src/blocks/RenderBlocks.tsx`, add the import (alongside the other block component imports, keep the existing alphabetical-ish grouping):

```typescript
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { MetricsBlock } from '@/blocks/Metrics/Component'
```

Add to the `blockComponents` map:

```typescript
const blockComponents = {
  archive: ArchiveBlock,
  audienceShowcase: AudienceShowcaseServer,
  claimForm: ClaimFormServer,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  cardGrid: CardGridBlock,
  metrics: MetricsBlock,
  insightsShowcase: InsightsShowcaseBlock,
  projectsShowcase: ProjectsShowcaseBlock,
  trustStrip: TrustStripServer,
  formatsGrid: FormatsGridServer,
  processSteps: ProcessStepsBlock,
  faqWithForm: FAQWithFormServer,
  machinesListing: MachinesListingServer,
  supportHub: SupportHubBlock,
}
```

- [ ] **Step 2: Register in RichText's jsxConverters**

In `src/components/RichText/index.tsx`, update the imports:

```typescript
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { CardGridBlock } from '@/blocks/CardGrid/Component'
import { CodeBlock, type CodeBlockProps } from '@/blocks/Code/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { MetricsBlock } from '@/blocks/Metrics/Component'
import type {
  BannerBlock as BannerBlockProps,
  CardGridBlock as CardGridBlockProps,
  ContentBlock as ContentBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
  MetricsBlock as MetricsBlockProps,
} from '@/payload-types'
```

Update the `NodeTypes` union:

```typescript
type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<
      | CTABlockProps
      | MediaBlockProps
      | BannerBlockProps
      | CodeBlockProps
      | ContentBlockProps
      | CardGridBlockProps
      | MetricsBlockProps
    >
```

Add to `jsxConverters.blocks`:

```typescript
    cardGrid: ({ node }) => <CardGridBlock {...node.fields} />,
    metrics: ({ node }) => <MetricsBlock {...node.fields} />,
```

- [ ] **Step 3: Generate importmap**

Run: `pnpm generate:importmap`
Expected: completes without error; regenerates the Payload admin import map to include the new block's admin-relevant references (if any custom admin components were added — none in this plan, but the command must still be run per project convention after any block registration change).

- [ ] **Step 4: Typecheck and run full test suite**

Run: `pnpm exec tsc --noEmit`
Expected: no new errors.

Run: `pnpm test:int`
Expected: all tests pass (previous Metrics/MetricsCounter tests plus the full existing suite — confirms the new block registration didn't break anything elsewhere, e.g. `RenderBlocks.test.tsx` if one exists).

- [ ] **Step 5: Write the block README**

Copy `src/blocks/_template.md` to `src/blocks/Metrics/README.md` and fill in from the code (per `src/blocks/CLAUDE.md` process):

```markdown
# Metrics

> Displays a heading with a row of 2-6 key stats (animated number + label) and an optional CTA button. Use it to show credibility numbers ("10+ years", "1000+ active kiosks") on the home page or any layout page.

## Admin Location
- **Ruta:** `Pages → [page] → Layout → Metrics`
- **Tipo:** `Layout Block` (also insertable inside a `Content` block's rich text via the block toolbar)

## Fields

| Campo | Tipo | Requerido | Localizado | Descripción |
|-------|------|-----------|------------|-------------|
| `eyebrow` | text | ✗ | ✓ | Small label above the heading |
| `heading` | textarea | ✓ | ✓ | Main heading. Supports `**bold**` markdown |
| `items` | array (2-6) | ✓ | ✓ | Each stat: `value` (e.g. "10+") and `label` |
| `link` | group | ✗ | — | Optional CTA button: `label`, `url`, `type` (custom/reference), `reference` |

## Behavior

- Numbers animate (count-up) once the block scrolls into view. Values with 3+ digits (e.g. "1000+") start the count from 60% of the target instead of 0, so the animation reads quickly.
- Stats fade/rise into place with a staggered delay on scroll, using native CSS scroll-driven animations — this is a progressive enhancement; browsers without support (older Safari/Firefox) simply show the stats statically.
- All animation respects `prefers-reduced-motion: reduce` — values render immediately with no motion.
- Mobile switches the stats row to a 2×2 grid.
```

- [ ] **Step 6: Update the consolidated block index**

Add a row to `docs/blocks/README.md`:

```markdown
| [Metrics](../src/blocks/Metrics/README.md) | Layout Block | 100% | Heading + animated stats + optional CTA |
```

(Match the exact table format already used in that file — read it first to confirm column order before inserting.)

- [ ] **Step 7: Commit**

```bash
git add src/blocks/RenderBlocks.tsx src/components/RichText/index.tsx src/blocks/Metrics/README.md docs/blocks/README.md
git commit -m "feat: register metrics block in RenderBlocks and RichText"
```

---

### Task 6: Manual verification in the browser

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run: `pnpm dev`

- [ ] **Step 2: Add a Metrics block to a page in the admin**

Navigate to `/admin`, open a page (or create a test page), add a `Metrics` block to its layout with the sample data from the spec (`We connect brands with people in the moments that matter most`, 4 stats: `10+`/`Years of Industry Experience`, `1000+`/`Active Kiosks Deployed`, `20+`/`Leading Brand Partners`, `30`/`States & International`, plus a CTA `Build Your Retail Experience` → `/contact`).

- [ ] **Step 3: View the published/preview page**

Confirm:
- Numbers count up from a lower value to the final value when the block scrolls into view (open DevTools → Rendering → emulate `prefers-reduced-motion: reduce` and confirm numbers render immediately instead).
- Stats show vertical dividers on desktop, switch to a 2×2 grid under ~640px width (resize the window or use device toolbar).
- Stats rise into place with a slight stagger on scroll, in Chrome/Edge (scroll-driven animations); confirm Safari/Firefox show the stats without animation but with no layout break.
- CTA button renders and links correctly; removing the link in the admin hides the button.
- Insert a `Metrics` block inside a `Content` block's rich text editor and confirm it renders the same way.

This step has no automated pass/fail — report back what you observed, especially any visual issues, before considering the plan complete.
