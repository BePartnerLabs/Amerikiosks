# Trust Strip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Trusted by Leading Brands and Venues" section with a CMS-managed partner logo carousel (infinite CSS marquee, pauses on hover) as a reusable layout-builder block.

**Architecture:** A new `Partners` Payload collection stores logo + name + order. A new `TrustStrip` block queries that collection via Local API and renders an infinite CSS marquee. The block is registered in the Pages and Posts layout builders.

**Tech Stack:** Payload CMS 3.x, Next.js App Router, TypeScript, CSS custom properties (no JS carousel library)

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/collections/Partners.ts` | Payload collection: name, logo, order |
| Modify | `src/payload.config.ts` | Register Partners collection |
| Create | `src/blocks/TrustStrip/config.ts` | Block field config: eyebrow, heading, limit |
| Create | `src/blocks/TrustStrip/Component.tsx` | Server component: fetches partners, renders marquee |
| Modify | `src/blocks/RenderBlocks.tsx` | Register TrustStrip in block map |
| Modify | `src/collections/Pages/index.ts` | Add TrustStrip to layout blocks |
| Modify | `src/collections/Posts/index.ts` | Add TrustStrip to layout blocks (if Posts has layout) |
| Create | `tests/unit/blocks/TrustStrip.test.tsx` | Unit tests for TrustStrip component |

---

## Task 1: Partners Collection

**Files:**
- Create: `src/collections/Partners.ts`
- Modify: `src/payload.config.ts`

- [ ] **Step 1: Create the Partners collection**

```ts
// src/collections/Partners.ts
import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'

export const Partners: CollectionConfig = {
  slug: 'partners',
  admin: {
    defaultColumns: ['name', 'order', 'updatedAt'],
    useAsTitle: 'name',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Lower number appears first. Use 1, 2, 3… to control display order.',
      },
    },
  ],
}
```

- [ ] **Step 2: Register Partners in payload.config.ts**

In `src/payload.config.ts`, add the import:
```ts
import { Partners } from './collections/Partners'
```

Then add `Partners` to the `collections` array:
```ts
collections: [Pages, Posts, Media, Categories, Users, Partners],
```

- [ ] **Step 3: Create and run the migration**

```bash
pnpm payload migrate:create --name add-partners-collection
pnpm payload migrate
```

Expected: migration files created under `src/migrations/`, migration runs without error.

- [ ] **Step 4: Regenerate types and import map**

```bash
pnpm generate:types
pnpm generate:importmap
```

Expected: `src/payload-types.ts` now includes a `Partners` type.

- [ ] **Step 5: Commit**

```bash
git add src/collections/Partners.ts src/payload.config.ts src/migrations/ src/payload-types.ts
git commit -m "feat(cms): add Partners collection with name, logo, order fields"
```

---

## Task 2: TrustStrip Block Config

**Files:**
- Create: `src/blocks/TrustStrip/config.ts`

- [ ] **Step 1: Create the block config**

```ts
// src/blocks/TrustStrip/config.ts
import type { Block } from 'payload'

export const TrustStrip: Block = {
  slug: 'trustStrip',
  interfaceName: 'TrustStripBlock',
  labels: {
    singular: 'Trust Strip',
    plural: 'Trust Strips',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow',
      admin: {
        description: 'Small label above the heading, e.g. "WHO WE WORK WITH"',
      },
      localized: true,
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Heading',
      required: true,
      localized: true,
    },
    {
      name: 'limit',
      type: 'number',
      label: 'Limit',
      defaultValue: 0,
      admin: {
        description: 'Max number of partners to show. 0 = show all.',
      },
    },
  ],
}
```

- [ ] **Step 2: Regenerate types**

```bash
pnpm generate:types
pnpm generate:importmap
```

Expected: `TrustStripBlock` interface appears in `src/payload-types.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/blocks/TrustStrip/config.ts src/payload-types.ts
git commit -m "feat(cms): add TrustStrip block config"
```

---

## Task 3: Register TrustStrip in Pages (and Posts if applicable)

**Files:**
- Modify: `src/collections/Pages/index.ts`
- Modify: `src/collections/Posts/index.ts` (check if Posts has a layout blocks field)

- [ ] **Step 1: Check if Posts has a layout field**

```bash
grep -n "layout\|blocks" src/collections/Posts/index.ts | head -20
```

- [ ] **Step 2: Add TrustStrip to Pages layout**

In `src/collections/Pages/index.ts`, add the import:
```ts
import { TrustStrip } from '../../blocks/TrustStrip/config'
```

Then add `TrustStrip` to the `blocks` array in the layout field:
```ts
blocks: [CallToAction, Content, MediaBlock, Archive, FormBlock, ValueProps, TrustStrip],
```

- [ ] **Step 3: Add TrustStrip to Posts layout (if Posts has layout)**

If the grep from Step 1 shows Posts has a layout/blocks field, apply the same pattern:
```ts
import { TrustStrip } from '../../blocks/TrustStrip/config'
// add TrustStrip to the blocks array
```

- [ ] **Step 4: Commit**

```bash
git add src/collections/Pages/index.ts src/collections/Posts/index.ts
git commit -m "feat(cms): register TrustStrip block in layout builders"
```

---

## Task 4: Write Failing Tests for TrustStrip Component

**Files:**
- Create: `tests/unit/blocks/TrustStrip.test.tsx`

The component will receive `eyebrow`, `heading`, `limit`, and `partners` (array of partner objects). Since it's a server component that fetches data, the test will receive pre-fetched partners as a prop — we'll extract the pure rendering logic into a testable presentational component.

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/unit/blocks/TrustStrip.test.tsx
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { TrustStripBlock } from '@/blocks/TrustStrip/Component'
import type { Page } from '@/payload-types'

type TrustStripType = Extract<NonNullable<Page['layout']>[number], { blockType: 'trustStrip' }>

const mockPartners = [
  { id: 'p1', name: 'Hilton', logo: { url: '/hilton.png', alt: 'Hilton' }, order: 1 },
  { id: 'p2', name: 'CVS', logo: { url: '/cvs.png', alt: 'CVS' }, order: 2 },
  { id: 'p3', name: 'Kroger', logo: { url: '/kroger.png', alt: 'Kroger' }, order: 3 },
]

const base: TrustStripType & { partners: typeof mockPartners } = {
  blockType: 'trustStrip',
  blockName: '',
  id: 'ts-1',
  eyebrow: 'WHO WE WORK WITH',
  heading: 'Trusted by Leading Brands and Venues',
  limit: 0,
  partners: mockPartners,
}

describe('TrustStripBlock', () => {
  afterEach(cleanup)

  it('renders section landmark with aria-label from heading', () => {
    render(<TrustStripBlock {...base} />)
    expect(
      screen.getByRole('region', { name: /trusted by leading brands/i }),
    ).toBeInTheDocument()
  })

  it('renders eyebrow text', () => {
    render(<TrustStripBlock {...base} />)
    expect(screen.getByText('WHO WE WORK WITH')).toBeInTheDocument()
  })

  it('renders heading', () => {
    render(<TrustStripBlock {...base} />)
    expect(
      screen.getByRole('heading', { name: /trusted by leading brands/i }),
    ).toBeInTheDocument()
  })

  it('renders all partner names as alt text', () => {
    render(<TrustStripBlock {...base} />)
    expect(screen.getAllByAltText('Hilton')).not.toHaveLength(0)
    expect(screen.getAllByAltText('CVS')).not.toHaveLength(0)
    expect(screen.getAllByAltText('Kroger')).not.toHaveLength(0)
  })

  it('hides eyebrow when not provided', () => {
    render(<TrustStripBlock {...base} eyebrow="" />)
    expect(screen.queryByText('WHO WE WORK WITH')).toBeNull()
  })

  it('renders duplicate track for seamless loop', () => {
    const { container } = render(<TrustStripBlock {...base} />)
    const tracks = container.querySelectorAll('.ak-trust-strip__track')
    expect(tracks).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
pnpm test:int --reporter=verbose tests/unit/blocks/TrustStrip.test.tsx
```

Expected: FAIL — `TrustStripBlock` not found / module does not exist.

---

## Task 5: Implement TrustStrip Component

**Files:**
- Create: `src/blocks/TrustStrip/Component.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/blocks/TrustStrip/Component.tsx
import React from 'react'
import Image from 'next/image'
import type { TrustStripBlock as TrustStripBlockProps } from '@/payload-types'
import type { Media } from '@/payload-types'

type Partner = {
  id: string
  name: string
  logo: Media
  order?: number | null
}

type Props = TrustStripBlockProps & {
  partners: Partner[]
}

export const TrustStripBlock: React.FC<Props> = ({ eyebrow, heading, partners }) => {
  if (!heading || !partners?.length) return null

  return (
    <section
      className="ak-trust-strip"
      aria-label={heading}
    >
      {eyebrow && <p className="ak-trust-strip__eyebrow">{eyebrow}</p>}
      <h2 className="ak-trust-strip__heading">{heading}</h2>

      <div className="ak-trust-strip__viewport">
        {[0, 1].map((i) => (
          <ul
            key={i}
            className="ak-trust-strip__track"
            aria-hidden={i === 1 ? 'true' : undefined}
          >
            {partners.map((partner) => (
              <li key={`${i}-${partner.id}`} className="ak-trust-strip__card">
                <Image
                  src={(partner.logo as Media).url ?? ''}
                  alt={partner.name}
                  width={120}
                  height={60}
                  style={{ objectFit: 'contain' }}
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Run the tests — confirm they pass**

```bash
pnpm test:int --reporter=verbose tests/unit/blocks/TrustStrip.test.tsx
```

Expected: All 6 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/blocks/TrustStrip/Component.tsx tests/unit/blocks/TrustStrip.test.tsx
git commit -m "feat(blocks): add TrustStrip component with marquee structure and tests"
```

---

## Task 6: CSS — Infinite Marquee Styles

**Files:**
- Modify: the project's main frontend CSS file (check `src/app/(frontend)/frontend.css` or equivalent)

- [ ] **Step 1: Find the frontend CSS file**

```bash
find src/app -name "*.css" | head -10
```

- [ ] **Step 2: Add TrustStrip styles**

Append to the frontend CSS file:

```css
/* ── Trust Strip ─────────────────────────────────────── */
.ak-trust-strip {
  padding: var(--ak-section-py, 4rem) 0;
  text-align: center;
  overflow: hidden;
}

.ak-trust-strip__eyebrow {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ak-color-primary, #1e3a5f);
  margin-bottom: 0.75rem;
}

.ak-trust-strip__heading {
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 700;
  color: var(--ak-color-heading, #0f2040);
  margin-bottom: 2.5rem;
}

.ak-trust-strip__viewport {
  display: flex;
  gap: 0;
  overflow: hidden;
  mask-image: linear-gradient(
    to right,
    transparent,
    black 8%,
    black 92%,
    transparent
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent,
    black 8%,
    black 92%,
    transparent
  );
}

.ak-trust-strip__viewport:hover .ak-trust-strip__track {
  animation-play-state: paused;
}

.ak-trust-strip__track {
  display: flex;
  gap: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
  animation: ak-marquee 40s linear infinite;
  flex-shrink: 0;
}

.ak-trust-strip__card {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgb(0 0 0 / 0.06);
  padding: 1rem 1.5rem;
  min-width: 160px;
  height: 88px;
  flex-shrink: 0;
}

@keyframes ak-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-100%); }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/
git commit -m "feat(styles): add TrustStrip infinite marquee CSS"
```

---

## Task 7: Server-Side Data Fetching Wrapper

The `TrustStripBlock` component we built is a pure presentational component that receives `partners` as a prop. We need a server wrapper that fetches from the Local API and passes the data in.

**Files:**
- Create: `src/blocks/TrustStrip/Server.tsx`
- Modify: `src/blocks/RenderBlocks.tsx`

- [ ] **Step 1: Create the server wrapper**

```tsx
// src/blocks/TrustStrip/Server.tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import type { TrustStripBlock as TrustStripBlockProps } from '@/payload-types'
import { TrustStripBlock } from './Component'

export const TrustStripServer: React.FC<TrustStripBlockProps> = async (props) => {
  const { limit } = props
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'partners',
    sort: 'order',
    limit: limit && limit > 0 ? limit : 0,
    overrideAccess: false,
  })

  return <TrustStripBlock {...props} partners={result.docs as any} />
}
```

- [ ] **Step 2: Register in RenderBlocks**

In `src/blocks/RenderBlocks.tsx`, add the import:
```ts
import { TrustStripServer } from '@/blocks/TrustStrip/Server'
```

Add to the `blockComponents` map:
```ts
const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  valueProps: ValuePropsBlock,
  trustStrip: TrustStripServer,
}
```

- [ ] **Step 3: Run full test suite to ensure nothing broke**

```bash
pnpm test:int
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/blocks/TrustStrip/Server.tsx src/blocks/RenderBlocks.tsx
git commit -m "feat(blocks): wire TrustStrip server data fetching to RenderBlocks"
```

---

## Task 8: Smoke Test in Dev

- [ ] **Step 1: Start dev server**

```bash
pnpm dev
```

- [ ] **Step 2: Add test partners in admin**

Open `http://localhost:3000/admin` → Partners → Add 3–4 partners with name + logo + order numbers.

- [ ] **Step 3: Add TrustStrip block to a page**

Open any page in the admin, add a TrustStrip block, fill in eyebrow + heading, save and preview.

Expected: logos scroll left in a loop at a slow, smooth pace. Hovering over the carousel pauses it. Edge fades visible.

- [ ] **Step 4: Final commit if any tweaks were made**

```bash
git add -p
git commit -m "fix(trust-strip): visual tweaks from smoke test"
```

---

## Post-Implementation Checklist

- [ ] `pnpm lint` passes
- [ ] `tsc --noEmit` passes
- [ ] `pnpm test:int` all green
- [ ] Partners visible and manageable in `/admin`
- [ ] TrustStrip block available in page layout builder
- [ ] Marquee scrolls, pauses on hover, edge fades visible
