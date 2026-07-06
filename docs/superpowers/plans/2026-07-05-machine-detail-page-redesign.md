# Machine Detail Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/machines/[slug]` to match a new Figma reference — updated `Machines` collection schema, a redesigned hero (static text block + scroll-scaling image), new Highlights/Capabilities/Dimensions sections replacing the old spec/feature rows, and new "explore more models" + bottom CTA sections.

**Architecture:** Schema changes to `src/collections/Machines/index.ts` (remove `layout`/`specs`/`features`, add `heroEyebrow`/`brochure`/`highlights`/`capabilities`/`dimensions`/`dimensionDiagrams`) drive everything downstream. `MachineHero`'s two variants (`ZoomFadeHero`, `RotationScrubHero`) are restructured so hero text is a static block above a scroll-scaling image (previously both were pinned/faded together). Three new presentational components (`Highlights`, `Capabilities`, `Dimensions`) replace `FeatureRow`/`SpecRow` in `page.tsx`. Two new additions (`RelatedMachines`, reusing the existing `MachineCard`; a bottom CTA banner, reusing the existing `CallToActionBlock`) fill gaps that didn't exist in the page before this work.

**Tech Stack:** Next.js 16 App Router, Payload CMS 3.82.1 (Local API), React Server/Client Components, Vitest + Testing Library, CSS following the BPL DS 3-level variable contract.

## Global Constraints

- CSS must follow the 3-level variable contract enforced by `scripts/validate-ds-tokens.mjs` (pre-commit hook blocks violations) — see `src/blocks/_template.css` and `src/blocks/CLAUDE.md`.
- After the schema change, run `pnpm generate:types`, `pnpm generate:importmap`, and create+apply a migration (`pnpm payload migrate:create`, `pnpm payload migrate`) — this drops the `specs`/`features`/`layout` columns/tables and adds the new ones.
- Before applying the migration to any environment with real content, check whether any seeded machine has non-empty `specs`/`features` (`payload.find({ collection: 'machines' })` and inspect) — if so, flag it and decide whether to hand-port that content into `capabilities`/`highlights` first. This plan does not include an automated data migration step.
- "Download brochure" only renders when `machine.brochure` is set; otherwise only "Contact Sales" renders.
- `capabilities` has no `eyebrow` field (confirmed design decision); `highlights` does.
- The "DIMENSIONS" section label and "Dimensions are approximate and may vary." caption are fixed strings in the component, not fields — they don't vary per machine.
- Every task must leave `pnpm test:int` green before moving to the next task.

---

### Task 1: Schema changes — remove `specs`/`features`/`layout`, add new fields

**Files:**
- Modify: `src/collections/Machines/index.ts`
- Create: a new migration via `pnpm payload migrate:create` (filename is timestamp-generated, cannot be predicted — see Step 4)

**Interfaces:**
- Produces: the `Machine` type (regenerated in `src/payload-types.ts`) gains `heroEyebrow?: string | null`, `brochure?: (number | null) | Media`, `highlights?: { eyebrow?, heading?, items?: { icon?, title, description? }[] } | null`, `capabilities?: { heading?, items?: { text }[] } | null`, `dimensions?: { height?, width?, depth? } | null`, `dimensionDiagrams?: { image, label? }[] | null`, and loses `specs`, `features`, `layout`. Later tasks consume these exact property names.

- [ ] **Step 1: Edit the collection config**

In `src/collections/Machines/index.ts`, delete these two field blocks entirely:

```ts
{
  name: 'specs',
  type: 'array',
  fields: [
    { name: 'label', type: 'text', required: true, localized: true },
    { name: 'value', type: 'text', required: true, localized: true },
  ],
},
{
  name: 'features',
  type: 'array',
  fields: [
    { name: 'heading', type: 'text', required: true, localized: true },
    { name: 'body', type: 'textarea', localized: true },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
  ],
},
```

Delete this field block (the final one in the `fields` array):

```ts
{
  name: 'layout',
  type: 'blocks',
  localized: true,
  blocks: [],
},
```

Add a `heroEyebrow` field right after the existing `tagline` field:

```ts
{
  name: 'heroEyebrow',
  type: 'text',
  localized: true,
  admin: { description: 'Small kicker above the hero title, e.g. "NEXT GENERATION"' },
},
```

Add these fields right after the existing `cta` field (which stays unchanged):

```ts
{
  name: 'brochure',
  type: 'upload',
  relationTo: 'media',
  admin: {
    description:
      'Optional downloadable brochure (PDF). Hides the "Download brochure" hero button when empty.',
  },
},
{
  name: 'highlights',
  type: 'group',
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      admin: { description: 'e.g. "WHY GAMMA 13"' },
    },
    {
      name: 'heading',
      type: 'text',
      localized: true,
      admin: { description: 'e.g. "Engineered for performance. Designed for any location."' },
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'icon',
          type: 'text',
          admin: { description: 'Material Symbols icon name, e.g. "inventory_2"' },
        },
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'description', type: 'text', localized: true },
      ],
    },
  ],
},
{
  name: 'capabilities',
  type: 'group',
  fields: [
    {
      name: 'heading',
      type: 'text',
      localized: true,
      admin: { description: 'e.g. "Built for scale. Designed for ease."' },
    },
    {
      name: 'items',
      type: 'array',
      fields: [{ name: 'text', type: 'text', required: true, localized: true }],
    },
  ],
},
{
  name: 'dimensions',
  type: 'group',
  fields: [
    { name: 'height', type: 'text', admin: { description: 'e.g. 92"' } },
    { name: 'width', type: 'text', admin: { description: 'e.g. 74"' } },
    { name: 'depth', type: 'text', admin: { description: 'e.g. 40"' } },
  ],
},
{
  name: 'dimensionDiagrams',
  type: 'array',
  admin: { description: 'Labeled technical line-drawings (e.g. front, side, isometric views)' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'label', type: 'text', localized: true },
  ],
},
```

- [ ] **Step 2: Regenerate types and import map**

Run: `pnpm generate:types`
Run: `pnpm generate:importmap`

Confirm `src/payload-types.ts`'s `Machine` interface no longer has `specs`/`features`/`layout` and now has `heroEyebrow`, `brochure`, `highlights`, `capabilities`, `dimensions`, `dimensionDiagrams`.

- [ ] **Step 3: Check for existing data in the fields being dropped**

Run this against your dev database (adjust connection as needed for your environment) — or query via the admin/API if a dev server is running:

```
GET /api/machines?limit=200&depth=0
```

Inspect the response for any `specs`/`features` arrays that are non-empty. If found, note which machine(s) and stop here — decide with the team whether to hand-port that content into `highlights`/`capabilities` before continuing, per the Global Constraints section. If all are empty, proceed.

- [ ] **Step 4: Create and apply the migration**

Run: `pnpm payload migrate:create remove_specs_features_layout_add_hero_fields`

This generates a new file under `src/migrations/` (timestamped name) with `up`/`down` functions. Inspect the generated SQL: confirm `up` drops the `specs`/`features`/`layout`-related tables/columns on `machines` (and `_machines_v` if versioned) and creates the new ones for `hero_eyebrow`, `brochure_id`, and the `highlights`/`capabilities`/`dimensions`/`dimension_diagrams` groups/arrays; confirm `down` reverses it.

Run: `pnpm payload migrate`

Expected: migration applies cleanly against your dev database.

- [ ] **Step 5: Run full test suite and commit**

Run: `pnpm test:int`
Expected: all existing tests pass (no test currently asserts on `machine.specs`/`machine.features` directly outside the page/component files this plan will touch in later tasks — if any unrelated test fails here, stop and investigate before proceeding).

```bash
git add src/collections/Machines/index.ts src/payload-types.ts src/migrations
git commit -m "feat(machines): update schema for detail page redesign"
```

---

### Task 2: Hero redesign — static text block + scroll-scaling image only

**Files:**
- Modify: `src/components/MachineHero/index.tsx`
- Modify: `src/components/MachineHero/ZoomFadeHero.tsx`
- Modify: `src/components/MachineHero/RotationScrubHero.tsx`
- Modify: `src/components/MachineHero/styles.css`
- Modify: `tests/unit/MachineHero/MachineHero.test.tsx`
- Create: `tests/unit/MachineHero/ZoomFadeHero.test.tsx`

**Interfaces:**
- Consumes: `Machine`/`Media` types from `@/payload-types` (now including `heroEyebrow`, `brochure`, `cta` from Task 1); `useScrollProgress` (unchanged, `src/components/MachineHero/useScrollProgress.ts`); `usePrefersReducedMotion` (unchanged).
- Produces: `MachineHero: React.FC<{ machine: Machine }>` (unchanged public signature); `ZoomFadeHero`/`RotationScrubHero` gain new props `subtitle?: string | null`, `brochureUrl?: string | null`, `ctaLabel: string`, `ctaUrl: string` alongside their existing `imageUrl`/`frameUrls`, `alt`, `eyebrow`, `heading` — consumed only by `MachineHero`, not by later tasks.

- [ ] **Step 1: Write the failing test for the new hero text/button behavior**

Create `tests/unit/MachineHero/ZoomFadeHero.test.tsx`:

```tsx
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ZoomFadeHero } from '@/components/MachineHero/ZoomFadeHero'

describe('ZoomFadeHero', () => {
  afterEach(cleanup)

  const baseProps = {
    imageUrl: '/gamma-13.jpg',
    alt: 'Gamma 13',
    eyebrow: 'NEXT GENERATION',
    heading: 'GAMMA 13 MODEL',
    subtitle: 'A premium high-capacity vending solution.',
    ctaLabel: 'Contact Sales',
    ctaUrl: '/contact',
  }

  it('renders eyebrow, heading, and subtitle', () => {
    render(<ZoomFadeHero {...baseProps} brochureUrl={null} />)
    expect(screen.getByText('NEXT GENERATION')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'GAMMA 13 MODEL' })).toBeInTheDocument()
    expect(screen.getByText('A premium high-capacity vending solution.')).toBeInTheDocument()
  })

  it('renders both buttons when brochureUrl is set', () => {
    render(<ZoomFadeHero {...baseProps} brochureUrl="/gamma-13-brochure.pdf" />)
    expect(screen.getByRole('link', { name: 'Download brochure' })).toHaveAttribute(
      'href',
      '/gamma-13-brochure.pdf',
    )
    expect(screen.getByRole('link', { name: 'Contact Sales' })).toHaveAttribute('href', '/contact')
  })

  it('renders only the Contact Sales link when brochureUrl is null', () => {
    render(<ZoomFadeHero {...baseProps} brochureUrl={null} />)
    expect(screen.queryByRole('link', { name: 'Download brochure' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Contact Sales' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:int -- ZoomFadeHero`
Expected: FAIL — `ZoomFadeHero` doesn't accept `subtitle`/`brochureUrl`/`ctaLabel`/`ctaUrl` yet, subtitle/buttons not rendered.

- [ ] **Step 3: Rewrite `ZoomFadeHero`**

Replace `src/components/MachineHero/ZoomFadeHero.tsx` entirely:

```tsx
'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { useScrollProgress } from './useScrollProgress'

type Props = {
  imageUrl: string
  alt: string
  eyebrow?: string | null
  heading: string
  subtitle?: string | null
  brochureUrl?: string | null
  ctaLabel: string
  ctaUrl: string
}

export const ZoomFadeHero: React.FC<Props> = ({
  imageUrl,
  alt,
  eyebrow,
  heading,
  subtitle,
  brochureUrl,
  ctaLabel,
  ctaUrl,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const progress = useScrollProgress(wrapperRef)
  const scale = 1 + progress * 0.12

  return (
    <div className="ak-machine-hero">
      <div className="ak-machine-hero__text">
        {eyebrow && <p className="ak-machine-hero__eyebrow">{eyebrow}</p>}
        <h1 className="ak-machine-hero__heading">{heading}</h1>
        {subtitle && <p className="ak-machine-hero__subtitle">{subtitle}</p>}
        <div className="ak-machine-hero__actions">
          {brochureUrl && (
            <a
              href={brochureUrl}
              className="bp-btn bp-btn--dark"
              download
            >
              Download brochure
            </a>
          )}
          <a
            href={ctaUrl}
            className="bp-btn bp-btn--outline"
          >
            {ctaLabel}
          </a>
        </div>
      </div>

      <div
        ref={wrapperRef}
        className="ak-machine-hero__image-pin-wrapper"
      >
        <div className="ak-machine-hero__sticky">
          <div
            className="ak-machine-hero__image-wrap"
            style={{ transform: `scale(${scale})` }}
          >
            <Image
              src={imageUrl}
              alt={alt}
              fill
              priority
              className="ak-machine-hero__image"
              sizes="100vw"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test:int -- ZoomFadeHero`
Expected: PASS (3 tests)

- [ ] **Step 5: Update `RotationScrubHero`**

Replace `src/components/MachineHero/RotationScrubHero.tsx` entirely:

```tsx
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'
import { useScrollProgress } from './useScrollProgress'

type Props = {
  frameUrls: string[]
  alt: string
  eyebrow?: string | null
  heading: string
  subtitle?: string | null
  brochureUrl?: string | null
  ctaLabel: string
  ctaUrl: string
}

export const RotationScrubHero: React.FC<Props> = ({
  frameUrls,
  alt,
  eyebrow,
  heading,
  subtitle,
  brochureUrl,
  ctaLabel,
  ctaUrl,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const [framesReady, setFramesReady] = useState(false)
  const progress = useScrollProgress(wrapperRef)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    let loaded = 0
    const images = frameUrls.map((url) => {
      const img = new Image()
      img.src = url
      img.onload = () => {
        loaded += 1
        if (loaded === frameUrls.length) setFramesReady(true)
      }
      return img
    })
    framesRef.current = images
  }, [frameUrls])

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current
    const frame = framesRef.current[index]
    if (!canvas || !frame) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    const scale = Math.max(canvas.width / frame.width, canvas.height / frame.height)
    const w = frame.width * scale
    const h = frame.height * scale
    ctx.drawImage(frame, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
  }, [])

  useEffect(() => {
    if (!framesReady) return
    const frameIndex = reducedMotion
      ? 0
      : Math.min(frameUrls.length - 1, Math.floor(progress * (frameUrls.length - 1)))
    drawFrame(frameIndex)
  }, [progress, framesReady, reducedMotion, frameUrls.length, drawFrame])

  return (
    <div className="ak-machine-hero">
      <div className="ak-machine-hero__text">
        {eyebrow && <p className="ak-machine-hero__eyebrow">{eyebrow}</p>}
        <h1 className="ak-machine-hero__heading">{heading}</h1>
        {subtitle && <p className="ak-machine-hero__subtitle">{subtitle}</p>}
        <div className="ak-machine-hero__actions">
          {brochureUrl && (
            <a
              href={brochureUrl}
              className="bp-btn bp-btn--dark"
              download
            >
              Download brochure
            </a>
          )}
          <a
            href={ctaUrl}
            className="bp-btn bp-btn--outline"
          >
            {ctaLabel}
          </a>
        </div>
      </div>

      <div
        ref={wrapperRef}
        className="ak-machine-hero__image-pin-wrapper"
      >
        <div className="ak-machine-hero__sticky">
          {!framesReady && (
            <div
              className="ak-machine-hero__skeleton"
              aria-hidden
            />
          )}
          <canvas
            ref={canvasRef}
            className="ak-machine-hero__canvas"
            role="img"
            aria-label={alt}
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Update `MachineHero`**

Replace `src/components/MachineHero/index.tsx` entirely:

```tsx
import type { Machine, Media } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { RotationScrubHero } from './RotationScrubHero'
import { ZoomFadeHero } from './ZoomFadeHero'
import './styles.css'

type Props = {
  machine: Machine
}

export const MachineHero: React.FC<Props> = ({ machine }) => {
  const image = typeof machine.image === 'object' ? (machine.image as Media) : null
  const imageUrl = getMediaUrl(image?.url)
  const brochure = typeof machine.brochure === 'object' ? (machine.brochure as Media) : null

  const frameUrls =
    machine.useRotationHero && machine.rotationFrames && machine.rotationFrames.length > 0
      ? (machine.rotationFrames
          .map((f) => {
            const media = typeof f.image === 'object' ? (f.image as Media) : null
            return getMediaUrl(media?.url)
          })
          .filter(Boolean) as string[])
      : []

  const heroText = {
    eyebrow: machine.heroEyebrow,
    heading: machine.name,
    subtitle: machine.tagline,
    brochureUrl: brochure?.url ?? null,
    ctaLabel: machine.cta?.label || 'Contact Sales',
    ctaUrl: machine.cta?.url || '/contact',
  }

  if (frameUrls.length > 0) {
    return (
      <RotationScrubHero
        frameUrls={frameUrls}
        alt={machine.name}
        {...heroText}
      />
    )
  }

  return (
    <ZoomFadeHero
      imageUrl={imageUrl}
      alt={machine.name}
      {...heroText}
    />
  )
}
```

- [ ] **Step 7: Update the CSS for the split text/image layout**

Replace `src/components/MachineHero/styles.css` entirely:

```css
.ak-machine-hero {
  display: flex;
  flex-direction: column;
}

.ak-machine-hero__text {
  padding-block: var(--bp-space-16, 4rem) var(--bp-space-10, 2.5rem);
  text-align: center;
  max-width: 40rem;
  margin-inline: auto;
}

.ak-machine-hero__eyebrow {
  font-size: var(--bp-font-size-sm, 0.875rem);
  font-weight: var(--bp-font-weight-semibold, 600);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ak-accent);
  margin: 0 0 var(--bp-space-2, 0.5rem);
}

.ak-machine-hero__heading {
  font-size: var(--bp-font-size-4xl, 2.25rem);
  font-weight: var(--bp-font-weight-bold, 700);
  margin: 0 0 var(--bp-space-3, 0.75rem);
}

.ak-machine-hero__subtitle {
  color: var(--bp-color-text-muted);
  margin: 0 0 var(--bp-space-6, 1.5rem);
}

.ak-machine-hero__actions {
  display: flex;
  justify-content: center;
  gap: var(--bp-space-3, 0.75rem);
  flex-wrap: wrap;
}

.ak-machine-hero__image-pin-wrapper {
  position: relative;
  height: 300vh;
}

@media (max-width: 639px) {
  .ak-machine-hero__image-pin-wrapper {
    height: 180vh;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ak-machine-hero__image-pin-wrapper {
    height: auto;
  }

  .ak-machine-hero__sticky {
    position: relative;
  }
}

.ak-machine-hero__sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ak-color-surface);
}

.ak-machine-hero__image-wrap {
  position: absolute;
  inset: 0;
}

.ak-machine-hero__image {
  object-fit: cover;
}

.ak-machine-hero__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.ak-machine-hero__skeleton {
  position: absolute;
  inset: 0;
  background: var(--bp-color-border);
  animation: ak-machine-hero-pulse 1.4s ease-in-out infinite;
}

@keyframes ak-machine-hero-pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
```

- [ ] **Step 8: Update the existing `MachineHero` test for the new fixture shape**

Edit `tests/unit/MachineHero/MachineHero.test.tsx` — update `baseMachine` (remove the now-nonexistent `layout: []` property, it's harmless either way since the object is cast `as unknown as Machine`, but remove it for cleanliness) and update the two mock components to also accept/ignore the new props (no assertion changes needed since they only check `heading`/`frameUrls`):

```tsx
vi.mock('@/components/MachineHero/ZoomFadeHero', () => ({
  ZoomFadeHero: ({ heading }: { heading: string }) => (
    <div data-testid="zoom-fade-hero">{heading}</div>
  ),
}))

vi.mock('@/components/MachineHero/RotationScrubHero', () => ({
  RotationScrubHero: ({ heading, frameUrls }: { heading: string; frameUrls: string[] }) => (
    <div data-testid="rotation-scrub-hero">
      {heading}:{frameUrls.length}
    </div>
  ),
}))

const baseMachine = {
  id: 'm1',
  slug: 'turntable-kiosk',
  name: 'Turntable Kiosk',
  tagline: 'Spin to win',
  image: { id: 'img1', url: '/turntable.jpg' },
  tags: [],
  updatedAt: '',
  createdAt: '',
} as unknown as Machine
```

(Everything else in the file — the three `it()` blocks — is unchanged; they only assert on `heading`/`frameUrls`, which the new prop shape still provides.)

- [ ] **Step 9: Run full test suite and commit**

Run: `pnpm test:int`
Expected: all tests pass, including the 3 new `ZoomFadeHero` tests and the updated `MachineHero` tests.

```bash
git add src/components/MachineHero tests/unit/MachineHero
git commit -m "feat(machines): redesign hero with static text block and buttons"
```

---

### Task 3: New sections — `Highlights`, `Capabilities`, `Dimensions`

**Files:**
- Create: `src/app/(frontend)/[locale]/machines/[slug]/Highlights.tsx`
- Create: `src/app/(frontend)/[locale]/machines/[slug]/Capabilities.tsx`
- Create: `src/app/(frontend)/[locale]/machines/[slug]/Dimensions.tsx`
- Modify: `src/app/(frontend)/[locale]/machines/[slug]/machine-detail.css`
- Create: `tests/unit/machine-detail/Highlights.test.tsx`
- Create: `tests/unit/machine-detail/Capabilities.test.tsx`
- Create: `tests/unit/machine-detail/Dimensions.test.tsx`

**Interfaces:**
- Consumes: `Machine['highlights']`, `Machine['capabilities']`, `Machine['dimensions']`, `Machine['dimensionDiagrams']`, `Machine['gallery']` types from `@/payload-types` (Task 1); `Media` type; `getMediaUrl` from `@/utilities/getMediaUrl`.
- Produces: `Highlights: React.FC<{ highlights: NonNullable<Machine['highlights']> }>`, `Capabilities: React.FC<{ capabilities: NonNullable<Machine['capabilities']>; gallery?: Machine['gallery'] }>`, `Dimensions: React.FC<{ diagrams: NonNullable<Machine['dimensionDiagrams']>; dimensions?: Machine['dimensions'] }>` — all consumed by Task 4's `page.tsx` rewiring.

- [ ] **Step 1: Write the failing test for `Highlights`**

Create `tests/unit/machine-detail/Highlights.test.tsx`:

```tsx
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Highlights } from '@/app/(frontend)/[locale]/machines/[slug]/Highlights'

describe('Highlights', () => {
  afterEach(cleanup)

  it('renders eyebrow, heading, and each item', () => {
    render(
      <Highlights
        highlights={{
          eyebrow: 'WHY GAMMA 13',
          heading: 'Engineered for performance. Designed for any location.',
          items: [
            { icon: 'inventory_2', title: 'High Capacity', description: '800-1,100 products across 90 SKUs.' },
            { icon: 'monitor', title: '22" Touch Screen', description: 'Intuitive interface for customers.' },
          ],
        }}
      />,
    )
    expect(screen.getByText('WHY GAMMA 13')).toBeInTheDocument()
    expect(
      screen.getByText('Engineered for performance. Designed for any location.'),
    ).toBeInTheDocument()
    expect(screen.getByText('High Capacity')).toBeInTheDocument()
    expect(screen.getByText('800-1,100 products across 90 SKUs.')).toBeInTheDocument()
    expect(screen.getByText('22" Touch Screen')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:int -- Highlights`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `Highlights`**

Create `src/app/(frontend)/[locale]/machines/[slug]/Highlights.tsx`:

```tsx
import type { Machine } from '@/payload-types'

type Props = {
  highlights: NonNullable<Machine['highlights']>
}

export const Highlights: React.FC<Props> = ({ highlights }) => {
  const items = highlights.items ?? []
  if (items.length === 0) return null

  return (
    <section className="ak-machine-detail__highlights">
      <div className="bp-content-grid">
        <div className="content ak-machine-detail__highlights-inner">
          {highlights.eyebrow && (
            <p className="ak-machine-detail__highlights-eyebrow">{highlights.eyebrow}</p>
          )}
          {highlights.heading && (
            <h2 className="ak-machine-detail__highlights-heading">{highlights.heading}</h2>
          )}
          <div className="ak-machine-detail__highlights-strip">
            {items.map((item, i) => (
              <div
                key={item.id ?? i}
                className="ak-machine-detail__highlight-card"
              >
                {item.icon && (
                  <span
                    className="material-symbols-outlined ak-machine-detail__highlight-icon"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                )}
                <p className="ak-machine-detail__highlight-title">{item.title}</p>
                {item.description && (
                  <p className="ak-machine-detail__highlight-description">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test:int -- Highlights`
Expected: PASS

- [ ] **Step 5: Write the failing test for `Capabilities`**

Create `tests/unit/machine-detail/Capabilities.test.tsx`:

```tsx
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Capabilities } from '@/app/(frontend)/[locale]/machines/[slug]/Capabilities'

describe('Capabilities', () => {
  afterEach(cleanup)

  it('renders heading and each bullet item', () => {
    render(
      <Capabilities
        capabilities={{
          heading: 'Built for scale. Designed for ease.',
          items: [{ text: 'All-steel.' }, { text: '22 touch screen.' }, { text: 'Direct push slot.' }],
        }}
        gallery={[]}
      />,
    )
    expect(screen.getByText('Built for scale. Designed for ease.')).toBeInTheDocument()
    expect(screen.getByText('All-steel.')).toBeInTheDocument()
    expect(screen.getByText('22 touch screen.')).toBeInTheDocument()
    expect(screen.getByText('Direct push slot.')).toBeInTheDocument()
  })

  it('does not render an eyebrow element', () => {
    const { container } = render(
      <Capabilities
        capabilities={{ heading: 'Heading', items: [{ text: 'Bullet.' }] }}
        gallery={[]}
      />,
    )
    expect(container.querySelector('.ak-machine-detail__capabilities-eyebrow')).toBeNull()
  })
})
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `pnpm test:int -- Capabilities`
Expected: FAIL — module not found.

- [ ] **Step 7: Implement `Capabilities`**

Create `src/app/(frontend)/[locale]/machines/[slug]/Capabilities.tsx`:

```tsx
import Image from 'next/image'
import type { Machine, Media } from '@/payload-types'

type Props = {
  capabilities: NonNullable<Machine['capabilities']>
  gallery?: Machine['gallery']
}

export const Capabilities: React.FC<Props> = ({ capabilities, gallery }) => {
  const items = capabilities.items ?? []
  if (items.length === 0) return null

  const midpoint = Math.ceil(items.length / 2)
  const columnA = items.slice(0, midpoint)
  const columnB = items.slice(midpoint)
  const photos = (gallery ?? []).slice(0, 3)

  return (
    <section className="ak-machine-detail__capabilities">
      <div className="bp-content-grid">
        <div className="content ak-machine-detail__capabilities-inner">
          <div className="ak-machine-detail__capabilities-text">
            {capabilities.heading && (
              <h2 className="ak-machine-detail__capabilities-heading">{capabilities.heading}</h2>
            )}
            <div className="ak-machine-detail__capabilities-columns">
              <ul className="ak-machine-detail__capabilities-list">
                {columnA.map((item, i) => (
                  <li key={item.id ?? `a-${i}`}>{item.text}</li>
                ))}
              </ul>
              <ul className="ak-machine-detail__capabilities-list">
                {columnB.map((item, i) => (
                  <li key={item.id ?? `b-${i}`}>{item.text}</li>
                ))}
              </ul>
            </div>
          </div>

          {photos.length > 0 && (
            <div className="ak-machine-detail__capabilities-carousel">
              {photos.map((item, i) => {
                const image = typeof item.image === 'object' ? (item.image as Media) : null
                if (!image?.url) return null
                return (
                  <div
                    key={item.id ?? i}
                    className="ak-machine-detail__capabilities-photo"
                  >
                    <Image
                      src={image.url}
                      alt=""
                      fill
                      className="ak-machine-detail__capabilities-photo-img"
                      sizes="(max-width: 640px) 90vw, 33vw"
                    />
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

- [ ] **Step 8: Run the test to verify it passes**

Run: `pnpm test:int -- Capabilities`
Expected: PASS (2 tests)

- [ ] **Step 9: Write the failing test for `Dimensions`**

Create `tests/unit/machine-detail/Dimensions.test.tsx`:

```tsx
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Dimensions } from '@/app/(frontend)/[locale]/machines/[slug]/Dimensions'

describe('Dimensions', () => {
  afterEach(cleanup)

  it('renders each diagram with its label, the dimensions values, and the fixed caption', () => {
    render(
      <Dimensions
        diagrams={[
          { id: 'd1', image: { id: 'i1', url: '/front.png' }, label: 'Front view' },
          { id: 'd2', image: { id: 'i2', url: '/side.png' }, label: 'Side view' },
        ]}
        dimensions={{ height: '92"', width: '74"', depth: '40"' }}
      />,
    )
    expect(screen.getByText('DIMENSIONS')).toBeInTheDocument()
    expect(screen.getByText('Front view')).toBeInTheDocument()
    expect(screen.getByText('Side view')).toBeInTheDocument()
    expect(screen.getByText('92"')).toBeInTheDocument()
    expect(screen.getByText('74"')).toBeInTheDocument()
    expect(screen.getByText('40"')).toBeInTheDocument()
    expect(screen.getByText('Dimensions are approximate and may vary.')).toBeInTheDocument()
  })
})
```

- [ ] **Step 10: Run the test to verify it fails**

Run: `pnpm test:int -- Dimensions`
Expected: FAIL — module not found.

- [ ] **Step 11: Implement `Dimensions`**

Create `src/app/(frontend)/[locale]/machines/[slug]/Dimensions.tsx`:

```tsx
import Image from 'next/image'
import type { Machine, Media } from '@/payload-types'

type Props = {
  diagrams: NonNullable<Machine['dimensionDiagrams']>
  dimensions?: Machine['dimensions']
}

export const Dimensions: React.FC<Props> = ({ diagrams, dimensions }) => {
  if (diagrams.length === 0) return null

  return (
    <section className="ak-machine-detail__dimensions">
      <div className="bp-content-grid">
        <div className="content ak-machine-detail__dimensions-inner">
          <p className="ak-machine-detail__dimensions-label">DIMENSIONS</p>

          <div className="ak-machine-detail__dimensions-diagrams">
            {diagrams.map((diagram, i) => {
              const image = typeof diagram.image === 'object' ? (diagram.image as Media) : null
              if (!image?.url) return null
              return (
                <figure
                  key={diagram.id ?? i}
                  className="ak-machine-detail__dimensions-diagram"
                >
                  <div className="ak-machine-detail__dimensions-diagram-image">
                    <Image
                      src={image.url}
                      alt={diagram.label ?? ''}
                      fill
                      className="ak-machine-detail__dimensions-diagram-img"
                      sizes="(max-width: 640px) 90vw, 33vw"
                    />
                  </div>
                  {diagram.label && (
                    <figcaption className="ak-machine-detail__dimensions-diagram-label">
                      {diagram.label}
                    </figcaption>
                  )}
                </figure>
              )
            })}
          </div>

          {dimensions && (dimensions.height || dimensions.width || dimensions.depth) && (
            <dl className="ak-machine-detail__dimensions-values">
              {dimensions.height && (
                <div>
                  <dt>Height</dt>
                  <dd>{dimensions.height}</dd>
                </div>
              )}
              {dimensions.width && (
                <div>
                  <dt>Width</dt>
                  <dd>{dimensions.width}</dd>
                </div>
              )}
              {dimensions.depth && (
                <div>
                  <dt>Depth</dt>
                  <dd>{dimensions.depth}</dd>
                </div>
              )}
            </dl>
          )}

          <p className="ak-machine-detail__dimensions-caption">
            Dimensions are approximate and may vary.
          </p>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 12: Run the test to verify it passes**

Run: `pnpm test:int -- Dimensions`
Expected: PASS

- [ ] **Step 13: Add CSS for the three new sections**

Append to `src/app/(frontend)/[locale]/machines/[slug]/machine-detail.css` (existing `.ak-machine-detail__specs*`/`.ak-machine-detail__feature*` rules are removed in Task 4 once `page.tsx` no longer references them — leave them in place for now, this task only adds new rules):

```css
.ak-machine-detail__highlights {
  padding-block: var(--bp-space-16, 4rem);
  background: var(--ak-color-surface);
}

.ak-machine-detail__highlights-eyebrow {
  font-size: var(--bp-font-size-sm, 0.875rem);
  font-weight: var(--bp-font-weight-semibold, 600);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ak-accent);
  text-align: center;
  margin: 0 0 var(--bp-space-2, 0.5rem);
}

.ak-machine-detail__highlights-heading {
  font-size: var(--bp-font-size-2xl, 1.5rem);
  font-weight: var(--bp-font-weight-bold, 700);
  text-align: center;
  max-width: 40rem;
  margin: 0 auto var(--bp-space-8, 2rem);
}

.ak-machine-detail__highlights-strip {
  display: flex;
  gap: var(--bp-space-4, 1rem);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-block: var(--bp-space-2, 0.5rem);
}

.ak-machine-detail__highlight-card {
  flex: 0 0 15rem;
  scroll-snap-align: start;
  padding: var(--bp-space-5, 1.25rem);
  border: 1px solid var(--ak-surface-border);
  border-radius: var(--bp-radius-lg, 0.75rem);
  background: var(--ak-surface-background);
}

.ak-machine-detail__highlight-icon {
  font-size: 1.75rem;
  color: var(--ak-accent);
}

.ak-machine-detail__highlight-title {
  font-weight: var(--bp-font-weight-semibold, 600);
  margin: var(--bp-space-2, 0.5rem) 0 var(--bp-space-1, 0.25rem);
}

.ak-machine-detail__highlight-description {
  font-size: var(--bp-font-size-sm, 0.875rem);
  color: var(--bp-color-text-muted);
}

.ak-machine-detail__capabilities {
  padding-block: var(--bp-space-16, 4rem);
}

.ak-machine-detail__capabilities-inner {
  display: flex;
  gap: var(--bp-space-10, 2.5rem);
  align-items: flex-start;
}

.ak-machine-detail__capabilities-heading {
  font-size: var(--bp-font-size-2xl, 1.5rem);
  font-weight: var(--bp-font-weight-bold, 700);
  margin: 0 0 var(--bp-space-6, 1.5rem);
}

.ak-machine-detail__capabilities-columns {
  display: flex;
  gap: var(--bp-space-8, 2rem);
  flex: 1 1 60%;
}

.ak-machine-detail__capabilities-list {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1 1 50%;
}

.ak-machine-detail__capabilities-list li {
  position: relative;
  padding-left: var(--bp-space-4, 1rem);
  margin-bottom: var(--bp-space-3, 0.75rem);
  color: var(--bp-color-text-muted);
}

.ak-machine-detail__capabilities-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5em;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ak-accent);
}

.ak-machine-detail__capabilities-carousel {
  flex: 1 1 40%;
  display: flex;
  gap: var(--bp-space-3, 0.75rem);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.ak-machine-detail__capabilities-photo {
  position: relative;
  flex: 0 0 100%;
  aspect-ratio: 4 / 3;
  scroll-snap-align: start;
  border-radius: var(--bp-radius-lg, 0.75rem);
  overflow: hidden;
}

.ak-machine-detail__capabilities-photo-img {
  object-fit: contain;
  background: var(--ak-surface-background);
}

@media (max-width: 767px) {
  .ak-machine-detail__capabilities-inner {
    flex-direction: column;
  }
}

.ak-machine-detail__dimensions {
  padding-block: var(--bp-space-16, 4rem);
  background: var(--ak-color-surface);
}

.ak-machine-detail__dimensions-label {
  font-size: var(--bp-font-size-sm, 0.875rem);
  font-weight: var(--bp-font-weight-semibold, 600);
  letter-spacing: 0.08em;
  margin: 0 0 var(--bp-space-6, 1.5rem);
}

.ak-machine-detail__dimensions-diagrams {
  display: flex;
  gap: var(--bp-space-6, 1.5rem);
  flex-wrap: wrap;
}

.ak-machine-detail__dimensions-diagram {
  flex: 1 1 15rem;
  margin: 0;
}

.ak-machine-detail__dimensions-diagram-image {
  position: relative;
  aspect-ratio: 1;
}

.ak-machine-detail__dimensions-diagram-img {
  object-fit: contain;
}

.ak-machine-detail__dimensions-diagram-label {
  text-align: center;
  font-size: var(--bp-font-size-sm, 0.875rem);
  color: var(--bp-color-text-muted);
  margin-top: var(--bp-space-2, 0.5rem);
}

.ak-machine-detail__dimensions-values {
  display: flex;
  gap: var(--bp-space-8, 2rem);
  margin: var(--bp-space-8, 2rem) 0 var(--bp-space-4, 1rem);
}

.ak-machine-detail__dimensions-values dt {
  font-size: var(--bp-font-size-sm, 0.875rem);
  color: var(--bp-color-text-muted);
}

.ak-machine-detail__dimensions-values dd {
  margin: 0;
  font-weight: var(--bp-font-weight-semibold, 600);
}

.ak-machine-detail__dimensions-caption {
  font-size: var(--bp-font-size-sm, 0.875rem);
  color: var(--bp-color-text-muted);
}
```

Run: `node scripts/validate-ds-tokens.mjs "src/app/(frontend)/[locale]/machines/[slug]/machine-detail.css"`
Expected: `DS token validation passed`

- [ ] **Step 14: Run full test suite and commit**

Run: `pnpm test:int`
Expected: all tests pass, including the 4 new tests across `Highlights`/`Capabilities`/`Dimensions`.

```bash
git add "src/app/(frontend)/[locale]/machines/[slug]/Highlights.tsx" "src/app/(frontend)/[locale]/machines/[slug]/Capabilities.tsx" "src/app/(frontend)/[locale]/machines/[slug]/Dimensions.tsx" "src/app/(frontend)/[locale]/machines/[slug]/machine-detail.css" tests/unit/machine-detail
git commit -m "feat(machines): add Highlights, Capabilities, Dimensions sections"
```

---

### Task 4: `RelatedMachines`, bottom CTA banner, and page rewiring

**Files:**
- Create: `src/app/(frontend)/[locale]/machines/[slug]/RelatedMachines.tsx`
- Modify: `src/app/(frontend)/[locale]/machines/[slug]/page.tsx`
- Modify: `src/app/(frontend)/[locale]/machines/[slug]/machine-detail.css`
- Delete: `src/app/(frontend)/[locale]/machines/[slug]/FeatureRow.tsx`
- Delete: `src/app/(frontend)/[locale]/machines/[slug]/SpecRow.tsx`
- Create: `tests/unit/machine-detail/RelatedMachines.test.tsx`

**Interfaces:**
- Consumes: `Highlights`, `Capabilities`, `Dimensions` from Task 3 (exact prop shapes above); `MachineCard` from `src/blocks/MachinesListing/MachineCard.tsx` (existing, `{ machine: Machine; index?: number }`); `CallToActionBlock` from `src/blocks/CallToAction/Component.tsx` (existing, `{ richText, links, blockName?, blockType }`); `Machine`/`Media` types.
- Produces: `RelatedMachines: React.FC<{ currentSlug: string; locale: 'en' | 'es' }>` (server component, fetches its own data) — not consumed elsewhere.

- [ ] **Step 1: Write the failing test for `RelatedMachines`' rendering logic**

Since `RelatedMachines` is a Server Component that calls `payload.find`, follow this repo's established pattern for testing Payload-dependent server code (mock `payload`/`@payload-config`, see `tests/unit/app/robots.test.ts` for the pattern):

Create `tests/unit/machine-detail/RelatedMachines.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))
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

const find = vi.fn()
vi.mock('payload', () => ({ getPayload: vi.fn().mockResolvedValue({ find }) }))

const makeMachine = (slug: string, name: string) => ({
  id: slug,
  slug,
  name,
  tagline: `${name} tagline`,
  image: { id: slug, url: `/${slug}.jpg`, width: 800, height: 600 },
  tags: [],
})

describe('RelatedMachines', () => {
  it('excludes the current machine and renders up to 3 others', async () => {
    find.mockResolvedValue({
      docs: [makeMachine('compact', 'Compact'), makeMachine('campaign', 'Campaign')],
    })

    const { RelatedMachines } = await import(
      '@/app/(frontend)/[locale]/machines/[slug]/RelatedMachines'
    )
    const ui = await RelatedMachines({ currentSlug: 'gamma-13', locale: 'en' })
    render(ui)

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'machines',
        where: { slug: { not_equals: 'gamma-13' } },
        limit: 3,
      }),
    )
    expect(screen.getByText('Compact')).toBeInTheDocument()
    expect(screen.getByText('Campaign')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:int -- RelatedMachines`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `RelatedMachines`**

Create `src/app/(frontend)/[locale]/machines/[slug]/RelatedMachines.tsx`:

```tsx
import config from '@payload-config'
import { getPayload } from 'payload'
import type React from 'react'
import { MachineCard } from '@/blocks/MachinesListing/MachineCard'
import type { Machine } from '@/payload-types'

type Props = {
  currentSlug: string
  locale: 'en' | 'es'
}

export const RelatedMachines: React.FC<Props> = async ({ currentSlug, locale }) => {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'machines',
    where: { slug: { not_equals: currentSlug } },
    depth: 1,
    overrideAccess: false,
    locale,
    limit: 3,
  })

  const machines = result.docs as Machine[]
  if (machines.length === 0) return null

  return (
    <section className="ak-machine-detail__related">
      <div className="bp-content-grid">
        <div className="content ak-machine-detail__related-inner">
          <p className="ak-machine-detail__related-eyebrow">EXPLORE MORE MODELS</p>
          <h2 className="ak-machine-detail__related-heading">Find the right kiosk for your space.</h2>
          <div className="ak-machine-detail__related-grid">
            {machines.map((machine, i) => (
              <MachineCard
                key={machine.id}
                machine={machine}
                index={i}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test:int -- RelatedMachines`
Expected: PASS

- [ ] **Step 5: Delete `FeatureRow`/`SpecRow` and rewire `page.tsx`**

```bash
git rm "src/app/(frontend)/[locale]/machines/[slug]/FeatureRow.tsx" "src/app/(frontend)/[locale]/machines/[slug]/SpecRow.tsx"
```

Replace `src/app/(frontend)/[locale]/machines/[slug]/page.tsx` entirely:

```tsx
import config from '@payload-config'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { MachineHero } from '@/components/MachineHero'
import type { Machine, Media } from '@/payload-types'
import { Capabilities } from './Capabilities'
import { Dimensions } from './Dimensions'
import { Highlights } from './Highlights'
import './machine-detail.css'
import { RelatedMachines } from './RelatedMachines'

type Props = {
  params: Promise<{ slug: string }>
}

async function getMachine(slug: string, locale: 'en' | 'es') {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'machines',
    where: { slug: { equals: slug } },
    depth: 2,
    overrideAccess: false,
    locale,
    limit: 1,
  })
  return (result.docs[0] as Machine) ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const locale = await getLocale()
  const machine = await getMachine(slug, locale as 'en' | 'es')
  if (!machine) return {}
  return {
    title: `${machine.name} — Amerikiosks`,
    description: machine.tagline ?? undefined,
  }
}

export default async function MachineDetailPage({ params }: Props) {
  const { slug } = await params
  const locale = (await getLocale()) as 'en' | 'es'
  const machine = await getMachine(slug, locale)

  if (!machine) notFound()

  const ctaLabel = machine.cta?.label || 'Contact Sales'
  const ctaUrl = machine.cta?.url || '/contact'

  return (
    <main className="ak-machine-detail">
      <MachineHero machine={machine} />

      {machine.highlights && <Highlights highlights={machine.highlights} />}

      {machine.capabilities && (
        <Capabilities
          capabilities={machine.capabilities}
          gallery={machine.gallery}
        />
      )}

      {machine.dimensionDiagrams && machine.dimensionDiagrams.length > 0 && (
        <Dimensions
          diagrams={machine.dimensionDiagrams}
          dimensions={machine.dimensions}
        />
      )}

      {machine.gallery && machine.gallery.length > 0 && (
        <section className="ak-machine-detail__gallery">
          <div className="ak-machine-detail__gallery-strip">
            {machine.gallery.map((item, i) => {
              const image = typeof item.image === 'object' ? (item.image as Media) : null
              if (!image?.url) return null
              return (
                <div
                  key={item.id ?? i}
                  className="ak-machine-detail__gallery-item"
                >
                  <Image
                    src={image.url}
                    alt={`${machine.name} gallery image ${i + 1}`}
                    fill
                    className="ak-machine-detail__gallery-img"
                    sizes="(max-width: 640px) 90vw, 50vw"
                  />
                </div>
              )
            })}
          </div>
        </section>
      )}

      <RelatedMachines
        currentSlug={slug}
        locale={locale}
      />

      <CallToActionBlock
        blockType="cta"
        richText={{
          root: {
            type: 'root',
            children: [
              {
                type: 'heading',
                tag: 'h2',
                version: 1,
                children: [
                  { type: 'text', version: 1, text: `Ready to place ${machine.name} in your location?` },
                ],
              },
            ],
            direction: null,
            format: '',
            indent: 0,
            version: 1,
          },
        }}
        links={[
          {
            link: {
              label: ctaLabel,
              type: 'custom',
              url: ctaUrl,
              appearance: 'default',
            },
          },
        ]}
      />
    </main>
  )
}
```

- [ ] **Step 6: Remove the now-dead CSS for the old CTA bar / specs / features sections**

In `src/app/(frontend)/[locale]/machines/[slug]/machine-detail.css`, delete these rule blocks (no longer referenced by `page.tsx`): `.ak-machine-detail__cta-bar`, `.ak-machine-detail__cta-bar-inner`, `.ak-machine-detail__cta-bar-name`, `.ak-machine-detail__specs`, `.ak-machine-detail__specs-inner`, `.ak-machine-detail__spec-row`, `.ak-machine-detail__spec-row--in-view`, `.ak-machine-detail__spec-label`, `.ak-machine-detail__spec-value`, `.ak-machine-detail__feature-row`, `.ak-machine-detail__feature-row--in-view`, `.ak-machine-detail__feature-inner`, `.ak-machine-detail__feature-row--reverse .ak-machine-detail__feature-inner`, `.ak-machine-detail__feature-image`, `.ak-machine-detail__feature-img`, `.ak-machine-detail__feature-text`, `.ak-machine-detail__feature-heading`, `.ak-machine-detail__feature-body`, and the `@media (max-width: 767px)` block targeting `.ak-machine-detail__feature-inner`. Also update the `@media (prefers-reduced-motion: reduce)` block at the bottom, which currently targets `.ak-machine-detail__spec-row, .ak-machine-detail__feature-row` — remove it entirely (nothing left to target; the new sections don't use scroll-reveal animation).

Keep `.ak-machine-detail__gallery`, `.ak-machine-detail__gallery-strip`, `.ak-machine-detail__gallery-item`, `.ak-machine-detail__gallery-img` — still used by `page.tsx`.

Add CSS for the new "related machines" section:

```css
.ak-machine-detail__related {
  padding-block: var(--bp-space-16, 4rem);
}

.ak-machine-detail__related-eyebrow {
  font-size: var(--bp-font-size-sm, 0.875rem);
  font-weight: var(--bp-font-weight-semibold, 600);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ak-accent);
  text-align: center;
  margin: 0 0 var(--bp-space-2, 0.5rem);
}

.ak-machine-detail__related-heading {
  font-size: var(--bp-font-size-2xl, 1.5rem);
  font-weight: var(--bp-font-weight-bold, 700);
  text-align: center;
  margin: 0 0 var(--bp-space-8, 2rem);
}

.ak-machine-detail__related-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--bp-space-6, 1.5rem);
}

@media (min-width: 40rem) {
  .ak-machine-detail__related-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 64rem) {
  .ak-machine-detail__related-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

Run: `node scripts/validate-ds-tokens.mjs "src/app/(frontend)/[locale]/machines/[slug]/machine-detail.css"`
Expected: `DS token validation passed`

- [ ] **Step 7: Verify no dangling references to the deleted components**

Run: `grep -rn "FeatureRow\|SpecRow" src tests --include="*.ts" --include="*.tsx"`
Expected: no output (empty) — nothing else imports the deleted files.

- [ ] **Step 8: Run the full test suite, typecheck, and lint**

Run: `pnpm test:int`
Expected: all tests pass, including the new `RelatedMachines` test.

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 9: Manually verify the live page**

Run: `pnpm dev` (or use an already-running dev server), seed at least one machine with `heroEyebrow`, `brochure`, `highlights`, `capabilities`, `dimensions`, `dimensionDiagrams` filled in via the admin panel, then visit `/machines/<that-slug>` and confirm: hero shows eyebrow/title/subtitle/both buttons (and only "Contact Sales" if brochure is cleared), the image scales while scrolling, Highlights/Capabilities/Dimensions sections render, the gallery strip still works, "explore more models" shows up to 3 other machines, and the bottom CTA banner shows the machine's name in its heading.

- [ ] **Step 10: Commit**

```bash
git add "src/app/(frontend)/[locale]/machines/[slug]" tests/unit/machine-detail
git commit -m "feat(machines): add RelatedMachines + CTA banner, rewire detail page"
```
