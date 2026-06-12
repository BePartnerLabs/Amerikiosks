# For Brands Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/who-its-for/for-brands` audience page with two new Payload collections (Machines, FAQItems), three new layout blocks (FormatsGrid, ProcessSteps, FAQWithForm), a seed script, and a standalone `/faq` page.

**Architecture:** Two new Payload collections power reusable content. Three new blocks follow the established Server.tsx + Component.tsx + styles.css pattern. The For Brands page is seeded as a Payload page entry. The /faq page is a Next.js App Router server+client component pair.

**Tech Stack:** Payload CMS 3.x, Next.js 16 App Router, TypeScript, TailwindCSS v4 / BPL DS, React Hook Form 7.78, next-intl, Vitest + Testing Library

---

## File Map

### New files
```
src/collections/Machines/index.ts
src/collections/FAQItems/index.ts
src/blocks/FormatsGrid/config.ts
src/blocks/FormatsGrid/Server.tsx
src/blocks/FormatsGrid/Component.tsx
src/blocks/FormatsGrid/styles.css
src/blocks/ProcessSteps/config.ts
src/blocks/ProcessSteps/Component.tsx
src/blocks/ProcessSteps/styles.css
src/blocks/FAQWithForm/config.ts
src/blocks/FAQWithForm/Server.tsx
src/blocks/FAQWithForm/Component.tsx
src/blocks/FAQWithForm/BrandForm.tsx
src/blocks/FAQWithForm/styles.css
src/app/(frontend)/[locale]/faq/page.tsx
src/app/(frontend)/[locale]/faq/FaqClient.tsx
src/app/(frontend)/[locale]/faq/faq.css
src/seed/for-brands.ts
tests/unit/blocks/FormatsGrid.test.tsx
tests/unit/blocks/ProcessSteps.test.tsx
tests/unit/blocks/FAQWithForm.test.tsx
```

### Modified files
```
src/payload.config.ts                     — add Machines, FAQItems to collections[]
src/collections/Pages/index.ts            — add FormatsGrid, ProcessSteps, FAQWithForm to layout blocks[]
src/blocks/RenderBlocks.tsx               — register formatsGrid, processSteps, faqWithForm
```

---

## Task 1: `Machines` collection

**Files:**
- Create: `src/collections/Machines/index.ts`
- Modify: `src/payload.config.ts`

- [ ] **Step 1: Create the collection**

```ts
// src/collections/Machines/index.ts
import { FixedToolbarFeature, InlineToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'

export const Machines: CollectionConfig = {
  slug: 'machines',
  admin: {
    defaultColumns: ['name', 'updatedAt'],
    useAsTitle: 'name',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  versions: {
    drafts: { autosave: { interval: 100 } },
    maxPerDoc: 50,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    ...slugField(),
    {
      name: 'tagline',
      type: 'text',
      localized: true,
      admin: { description: 'Short label shown on cards, e.g. "Full-size branded machine"' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'tags',
      type: 'array',
      admin: { description: 'e.g. full-size, compact, campaign, premium — used for block-level filtering' },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'layout',
      type: 'blocks',
      localized: true,
      blocks: [], // blocks added in Tasks 3–5
    },
  ],
}
```

- [ ] **Step 2: Register in payload.config.ts**

In `src/payload.config.ts`, add the import at the top with other collection imports:

```ts
import { Machines } from './collections/Machines'
```

Then add `Machines` to the `collections` array:

```ts
collections: [Pages, Insights, Media, Categories, Users, Partners, Machines],
```

- [ ] **Step 3: Create migration and regenerate types**

```bash
pnpm payload migrate:create --name add_machines_collection
pnpm payload migrate
pnpm generate:types
pnpm generate:importmap
```

Expected: migration file created in `src/migrations/`, types updated with `Machines` and `Machine` types in `payload-types.ts`.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/collections/Machines/index.ts src/payload.config.ts src/migrations/ src/payload-types.ts src/app/\(payload\)/admin/importMap.js
git commit -m "feat(collections): add Machines collection"
```

---

## Task 2: `FAQItems` collection

**Files:**
- Create: `src/collections/FAQItems/index.ts`
- Modify: `src/payload.config.ts`

- [ ] **Step 1: Create the collection**

```ts
// src/collections/FAQItems/index.ts
import { FixedToolbarFeature, InlineToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'
import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'

export const FAQItems: CollectionConfig = {
  slug: 'faqItems',
  admin: {
    defaultColumns: ['question', 'weight', 'updatedAt'],
    useAsTitle: 'question',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'answer',
      type: 'richText',
      localized: true,
      required: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
    {
      name: 'weight',
      type: 'number',
      defaultValue: 10,
      admin: {
        description: 'Higher weight appears first. Use multiples of 10 (10, 20, 30…) so items can be inserted between existing ones.',
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: { description: 'e.g. brands, venues, replenishment, branding, pricing' },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
```

- [ ] **Step 2: Register in payload.config.ts**

```ts
import { FAQItems } from './collections/FAQItems'
```

```ts
collections: [Pages, Insights, Media, Categories, Users, Partners, Machines, FAQItems],
```

- [ ] **Step 3: Create migration and regenerate types**

```bash
pnpm payload migrate:create --name add_faq_items_collection
pnpm payload migrate
pnpm generate:types
pnpm generate:importmap
```

Expected: `FaqItem` type available in `payload-types.ts`.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/collections/FAQItems/index.ts src/payload.config.ts src/migrations/ src/payload-types.ts src/app/\(payload\)/admin/importMap.js
git commit -m "feat(collections): add FAQItems collection"
```

---

## Task 3: `FormatsGrid` block

**Files:**
- Create: `src/blocks/FormatsGrid/config.ts`
- Create: `src/blocks/FormatsGrid/Server.tsx`
- Create: `src/blocks/FormatsGrid/Component.tsx`
- Create: `src/blocks/FormatsGrid/styles.css`
- Create: `tests/unit/blocks/FormatsGrid.test.tsx`
- Modify: `src/collections/Pages/index.ts`
- Modify: `src/blocks/RenderBlocks.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/unit/blocks/FormatsGrid.test.tsx
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { FormatsGridBlock } from '@/blocks/FormatsGrid/Component'
import type { FormatsGridBlock as FormatsGridBlockType } from '@/payload-types'
import type { Machine, Media } from '@/payload-types'

const makeMedia = (url: string): Media =>
  ({ id: url, url, alt: 'machine image', updatedAt: '', createdAt: '' }) as unknown as Media

const makeMachine = (slug: string, name: string): Machine => ({
  id: slug,
  slug,
  name,
  tagline: `${name} tagline`,
  image: makeMedia(`/${slug}.jpg`),
  tags: [{ label: 'full-size', id: 't1' }],
  layout: [],
  updatedAt: '',
  createdAt: '',
}) as unknown as Machine

const base: FormatsGridBlockType & { resolvedMachines: Machine[] } = {
  blockType: 'formatsGrid',
  blockName: 'Formats Grid',
  id: 'fg-1',
  heading: 'Formats built around your brand moment.',
  eyebrow: 'FORMATS',
  resolvedMachines: [
    makeMachine('full-size', 'Full-size branded machine'),
    makeMachine('compact', 'Compact footprint machine'),
  ],
}

describe('FormatsGridBlock', () => {
  afterEach(cleanup)

  it('renders section landmark with aria-label from heading', () => {
    render(<FormatsGridBlock {...base} />)
    expect(screen.getByRole('region', { name: /formats built/i })).toBeInTheDocument()
  })

  it('renders heading', () => {
    render(<FormatsGridBlock {...base} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Formats built around your brand moment.')
  })

  it('renders eyebrow text', () => {
    render(<FormatsGridBlock {...base} />)
    expect(screen.getByText('FORMATS')).toBeInTheDocument()
  })

  it('renders a card link for each machine', () => {
    render(<FormatsGridBlock {...base} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', '/machines/full-size')
    expect(links[1]).toHaveAttribute('href', '/machines/compact')
  })

  it('renders machine name as card title', () => {
    render(<FormatsGridBlock {...base} />)
    expect(screen.getByText('Full-size branded machine')).toBeInTheDocument()
    expect(screen.getByText('Compact footprint machine')).toBeInTheDocument()
  })

  it('renders images with machine name as alt text', () => {
    render(<FormatsGridBlock {...base} />)
    const imgs = screen.getAllByRole('img')
    expect(imgs[0]).toHaveAttribute('alt', 'Full-size branded machine')
    expect(imgs[1]).toHaveAttribute('alt', 'Compact footprint machine')
  })

  it('renders GA4 attributes on block root', () => {
    const { container } = render(<FormatsGridBlock {...base} />)
    const section = container.querySelector('section')
    expect(section?.getAttribute('data-ga-block')).toBe('formats_grid')
    expect(section?.getAttribute('data-ga-section')).toBe('Formats Grid')
  })

  it('renders ga-event on each card link', () => {
    render(<FormatsGridBlock {...base} />)
    const links = screen.getAllByRole('link')
    for (const link of links) {
      expect(link.getAttribute('data-ga-event')).toBe('machine_card_click')
    }
  })

  it('renders nothing when heading is missing', () => {
    const { container } = render(<FormatsGridBlock {...base} heading={undefined} />)
    expect(container.firstChild).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
pnpm test:int 2>/dev/null; pnpm vitest run tests/unit/blocks/FormatsGrid.test.tsx
```

Expected: FAIL — `Cannot find module '@/blocks/FormatsGrid/Component'`

- [ ] **Step 3: Create block config**

```ts
// src/blocks/FormatsGrid/config.ts
import type { Block } from 'payload'

export const FormatsGrid: Block = {
  slug: 'formatsGrid',
  interfaceName: 'FormatsGridBlock',
  imageURL: '/block-previews/formats-grid.png',
  imageAltText: 'Formats Grid block — machine format card grid',
  labels: { singular: 'Formats Grid', plural: 'Formats Grids' },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      admin: { description: 'Small label above heading, e.g. "FORMATS"' },
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
      name: 'filterTags',
      type: 'array',
      admin: {
        description: 'Show machines matching these tags. Leave empty to show all. Ignored if items are set.',
      },
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
    {
      name: 'items',
      type: 'array',
      admin: { description: 'Explicit machine picks. Overrides filterTags.' },
      fields: [
        {
          name: 'machine',
          type: 'relationship',
          relationTo: 'machines',
          required: true,
        },
      ],
    },
  ],
}
```

- [ ] **Step 4: Create Component.tsx**

```tsx
// src/blocks/FormatsGrid/Component.tsx
import Image from 'next/image'
import Link from 'next/link'
import type React from 'react'
import { SectionHeader } from '@/components/SectionHeader'
import type { FormatsGridBlock as FormatsGridBlockProps, Machine } from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import './styles.css'

type Props = FormatsGridBlockProps & { resolvedMachines?: Machine[] }

export const FormatsGridBlock: React.FC<Props> = ({
  eyebrow,
  heading,
  subheading,
  blockName,
  blockType,
  resolvedMachines = [],
}) => {
  if (!heading) return null

  return (
    <section
      className="ak-formats-grid"
      aria-label={heading}
      data-ga-block={toSnakeCase(blockType)}
      data-ga-section={blockName ?? undefined}
    >
      <div className="bp-content-grid">
        <div className="breakout ak-formats-grid__inner">
          <SectionHeader eyebrow={eyebrow} heading={heading} subtitle={subheading} align="center" />

          {resolvedMachines.length > 0 && (
            <div className="ak-formats-grid__grid">
              {resolvedMachines.map((machine) => (
                <Link
                  key={machine.id}
                  href={`/machines/${machine.slug}`}
                  className="bp-card bp-card--interactive ak-formats-grid__card"
                  data-ga-event="machine_card_click"
                  data-ga-label={machine.name}
                  aria-label={machine.name}
                >
                  {typeof machine.image === 'object' && machine.image?.url && (
                    <div className="bp-card__image ak-formats-grid__card-image">
                      <Image
                        src={machine.image.url}
                        alt={machine.name}
                        fill
                        className="ak-formats-grid__img"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                  )}
                  <div className="bp-card__body ak-formats-grid__card-body">
                    <p className="ak-formats-grid__card-name">{machine.name}</p>
                    {machine.tagline && (
                      <p className="ak-formats-grid__card-tagline">{machine.tagline}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Create Server.tsx**

```tsx
// src/blocks/FormatsGrid/Server.tsx
import config from '@payload-config'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type React from 'react'
import type { FormatsGridBlock as FormatsGridBlockProps, Machine } from '@/payload-types'
import { FormatsGridBlock } from './Component'

export const FormatsGridServer: React.FC<FormatsGridBlockProps> = async (props) => {
  const { items, filterTags, ...rest } = props
  const payload = await getPayload({ config })
  const locale = await getLocale()

  let machines: Machine[] = []

  if (items && items.length > 0) {
    const resolved = await Promise.all(
      items.map(async (item) => {
        if (!item.machine) return null
        const id =
          typeof item.machine === 'object' ? item.machine.id : Number(item.machine)
        return payload.findByID({
          collection: 'machines',
          id,
          depth: 1,
          overrideAccess: false,
          locale: locale as 'en' | 'es',
        })
      }),
    )
    machines = resolved.filter((m): m is Machine => m !== null)
  } else {
    const where =
      filterTags && filterTags.length > 0
        ? { 'tags.label': { in: filterTags.map((t) => t.tag) } }
        : {}
    const result = await payload.find({
      collection: 'machines',
      where,
      depth: 1,
      overrideAccess: false,
      locale: locale as 'en' | 'es',
    })
    machines = result.docs
  }

  return <FormatsGridBlock {...rest} resolvedMachines={machines} />
}
```

- [ ] **Step 6: Create styles.css**

```css
/* src/blocks/FormatsGrid/styles.css */
.ak-formats-grid {
  background: var(--formats-grid-bg, var(--ak-section-bg, #fff));
}

.ak-formats-grid__inner {
  padding-block: var(--bp-space-16, 4rem);
}

.ak-formats-grid__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--bp-space-4, 1rem);
  margin-top: var(--bp-space-10, 2.5rem);
}

.ak-formats-grid__card {
  display: flex;
  flex-direction: column;
  text-decoration: none;
}

.ak-formats-grid__card-image {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
}

.ak-formats-grid__img {
  object-fit: contain;
}

.ak-formats-grid__card-body {
  padding: var(--bp-space-3, 0.75rem) 0;
}

.ak-formats-grid__card-name {
  font-weight: var(--bp-font-weight-semibold, 600);
  color: var(--bp-color-text, currentColor);
}

.ak-formats-grid__card-tagline {
  font-size: var(--bp-font-size-sm, 0.875rem);
  color: var(--bp-color-text-muted, #6b7280);
  margin-top: var(--bp-space-1, 0.25rem);
}

@media (max-width: 1023px) {
  .ak-formats-grid__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 639px) {
  .ak-formats-grid__grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 7: Register block in Pages collection**

In `src/collections/Pages/index.ts`, add import at top:

```ts
import { FormatsGrid } from '../../blocks/FormatsGrid/config'
```

Add `FormatsGrid` to the `blocks` array (line ~88):

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
  FormatsGrid,       // ← add
],
```

- [ ] **Step 8: Register in RenderBlocks.tsx**

```tsx
// Add import at top of src/blocks/RenderBlocks.tsx:
import { FormatsGridServer } from '@/blocks/FormatsGrid/Server'

// Add to blockComponents object:
formatsGrid: FormatsGridServer,
```

- [ ] **Step 9: Regenerate importmap**

```bash
pnpm generate:importmap
```

- [ ] **Step 10: Run test — expect pass**

```bash
pnpm vitest run tests/unit/blocks/FormatsGrid.test.tsx
```

Expected: all tests pass.

- [ ] **Step 11: Verify TypeScript**

```bash
tsc --noEmit
```

- [ ] **Step 12: Commit**

```bash
git add src/blocks/FormatsGrid/ src/collections/Pages/index.ts src/blocks/RenderBlocks.tsx src/app/\(payload\)/admin/importMap.js tests/unit/blocks/FormatsGrid.test.tsx
git commit -m "feat(blocks): add FormatsGrid block"
```

---

## Task 4: `ProcessSteps` block

**Files:**
- Create: `src/blocks/ProcessSteps/config.ts`
- Create: `src/blocks/ProcessSteps/Component.tsx`
- Create: `src/blocks/ProcessSteps/styles.css`
- Create: `tests/unit/blocks/ProcessSteps.test.tsx`
- Modify: `src/collections/Pages/index.ts`
- Modify: `src/blocks/RenderBlocks.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/unit/blocks/ProcessSteps.test.tsx
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ProcessStepsBlock } from '@/blocks/ProcessSteps/Component'
import type { ProcessStepsBlock as ProcessStepsBlockType } from '@/payload-types'

const base: ProcessStepsBlockType = {
  blockType: 'processSteps',
  blockName: 'How It Works',
  id: 'ps-1',
  eyebrow: 'HOW IT WORKS',
  heading: 'From first opportunity to daily operation.',
  steps: [
    { id: 's1', title: 'Define the moment', body: { root: { children: [], type: 'root', version: 1 } } as any },
    { id: 's2', title: 'Match the context', body: { root: { children: [], type: 'root', version: 1 } } as any },
  ],
}

describe('ProcessStepsBlock', () => {
  afterEach(cleanup)

  it('renders section landmark with aria-label from heading', () => {
    render(<ProcessStepsBlock {...base} />)
    expect(screen.getByRole('region', { name: /from first opportunity/i })).toBeInTheDocument()
  })

  it('renders heading', () => {
    render(<ProcessStepsBlock {...base} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('From first opportunity to daily operation.')
  })

  it('renders steps as an ordered list', () => {
    render(<ProcessStepsBlock {...base} />)
    expect(screen.getByRole('list')).toBeInTheDocument()
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
  })

  it('renders step titles', () => {
    render(<ProcessStepsBlock {...base} />)
    expect(screen.getByText('Define the moment')).toBeInTheDocument()
    expect(screen.getByText('Match the context')).toBeInTheDocument()
  })

  it('each list item has aria-label with step number and title', () => {
    render(<ProcessStepsBlock {...base} />)
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveAttribute('aria-label', 'Step 1: Define the moment')
    expect(items[1]).toHaveAttribute('aria-label', 'Step 2: Match the context')
  })

  it('renders GA4 attributes on block root', () => {
    const { container } = render(<ProcessStepsBlock {...base} />)
    const section = container.querySelector('section')
    expect(section?.getAttribute('data-ga-block')).toBe('process_steps')
    expect(section?.getAttribute('data-ga-section')).toBe('How It Works')
  })

  it('renders CTA button with ga-event when cta is provided', () => {
    const withCta: ProcessStepsBlockType = {
      ...base,
      cta: [{ link: { label: 'Start a Brand Program', url: '/contact', type: 'custom', appearance: 'default' }, id: 'cta-1' }],
    }
    render(<ProcessStepsBlock {...withCta} />)
    const link = screen.getByRole('link', { name: /start a brand program/i })
    expect(link).toBeInTheDocument()
    expect(link.getAttribute('data-ga-event')).toBe('cta_click')
    expect(link.getAttribute('data-ga-label')).toBe('Start a Brand Program')
  })

  it('renders nothing when heading is missing', () => {
    const { container } = render(<ProcessStepsBlock {...base} heading={undefined} />)
    expect(container.firstChild).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
pnpm vitest run tests/unit/blocks/ProcessSteps.test.tsx
```

Expected: FAIL — `Cannot find module '@/blocks/ProcessSteps/Component'`

- [ ] **Step 3: Create block config**

```ts
// src/blocks/ProcessSteps/config.ts
import { FixedToolbarFeature, InlineToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'
import { linkGroup } from '@/fields/linkGroup'

export const ProcessSteps: Block = {
  slug: 'processSteps',
  interfaceName: 'ProcessStepsBlock',
  imageURL: '/block-previews/process-steps.png',
  imageAltText: 'Process Steps block — numbered step sequence',
  labels: { singular: 'Process Steps', plural: 'Process Steps' },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      admin: { description: 'Small label above heading, e.g. "HOW IT WORKS"' },
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
      name: 'steps',
      type: 'array',
      required: true,
      minRows: 2,
      maxRows: 8,
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'body',
          type: 'richText',
          localized: true,
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [
              ...rootFeatures,
              FixedToolbarFeature(),
              InlineToolbarFeature(),
            ],
          }),
        },
      ],
    },
    linkGroup({
      overrides: {
        name: 'cta',
        label: 'CTA Button (optional)',
        maxRows: 1,
      },
    }),
  ],
}
```

- [ ] **Step 4: Create Component.tsx**

```tsx
// src/blocks/ProcessSteps/Component.tsx
import Link from 'next/link'
import type React from 'react'
import { SectionHeader } from '@/components/SectionHeader'
import type { ProcessStepsBlock as ProcessStepsBlockType } from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import './styles.css'

export const ProcessStepsBlock: React.FC<ProcessStepsBlockType> = ({
  eyebrow,
  heading,
  subheading,
  steps,
  cta,
  blockName,
  blockType,
}) => {
  if (!heading) return null

  const ctaLink = cta?.[0]?.link

  return (
    <section
      className="ak-process-steps"
      aria-label={heading}
      data-ga-block={toSnakeCase(blockType)}
      data-ga-section={blockName ?? undefined}
    >
      <div className="bp-content-grid">
        <div className="breakout ak-process-steps__inner">
          <SectionHeader eyebrow={eyebrow} heading={heading} subtitle={subheading} align="center" />

          {steps && steps.length > 0 && (
            <ol className="ak-process-steps__list">
              {steps.map((step, index) => (
                <li
                  key={step.id ?? index}
                  className="ak-process-steps__item"
                  aria-label={`Step ${index + 1}: ${step.title}`}
                >
                  <span className="ak-process-steps__number" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="ak-process-steps__content">
                    <p className="ak-process-steps__title">{step.title}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}

          {ctaLink && (
            <div className="ak-process-steps__cta">
              <Link
                href={ctaLink.url ?? ctaLink.reference?.value?.toString() ?? '#'}
                className="bp-btn bp-btn--primary"
                data-ga-event="cta_click"
                data-ga-label={ctaLink.label ?? ''}
              >
                {ctaLink.label}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Create styles.css**

```css
/* src/blocks/ProcessSteps/styles.css */
.ak-process-steps {
  background: var(--process-steps-bg, var(--ak-section-bg-alt, #f9fafb));
}

.ak-process-steps__inner {
  padding-block: var(--bp-space-16, 4rem);
}

.ak-process-steps__list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--bp-space-4, 1rem);
  list-style: none;
  padding: 0;
  margin: var(--bp-space-10, 2.5rem) 0 0;
}

.ak-process-steps__item {
  display: flex;
  flex-direction: column;
  gap: var(--bp-space-3, 0.75rem);
}

.ak-process-steps__number {
  font-size: var(--bp-font-size-2xl, 1.5rem);
  font-weight: var(--bp-font-weight-bold, 700);
  color: var(--ak-color-primary, #e11d48);
  line-height: 1;
}

.ak-process-steps__title {
  font-weight: var(--bp-font-weight-semibold, 600);
  color: var(--bp-color-text, currentColor);
}

.ak-process-steps__cta {
  display: flex;
  justify-content: center;
  margin-top: var(--bp-space-10, 2.5rem);
}

@media (max-width: 1023px) {
  .ak-process-steps__list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 639px) {
  .ak-process-steps__list {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 6: Register in Pages collection and RenderBlocks**

In `src/collections/Pages/index.ts`, add:

```ts
import { ProcessSteps } from '../../blocks/ProcessSteps/config'
```

Add `ProcessSteps` to blocks array:

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
  FormatsGrid,
  ProcessSteps,    // ← add
],
```

In `src/blocks/RenderBlocks.tsx`, add:

```tsx
import { ProcessStepsBlock } from '@/blocks/ProcessSteps/Component'

// in blockComponents:
processSteps: ProcessStepsBlock,
```

- [ ] **Step 7: Regenerate types and importmap**

```bash
pnpm generate:types
pnpm generate:importmap
```

- [ ] **Step 8: Run test — expect pass**

```bash
pnpm vitest run tests/unit/blocks/ProcessSteps.test.tsx
```

Expected: all tests pass.

- [ ] **Step 9: Verify TypeScript**

```bash
tsc --noEmit
```

- [ ] **Step 10: Commit**

```bash
git add src/blocks/ProcessSteps/ src/collections/Pages/index.ts src/blocks/RenderBlocks.tsx src/app/\(payload\)/admin/importMap.js src/payload-types.ts tests/unit/blocks/ProcessSteps.test.tsx
git commit -m "feat(blocks): add ProcessSteps block"
```

---

## Task 5: `FAQWithForm` block

**Files:**
- Create: `src/blocks/FAQWithForm/config.ts`
- Create: `src/blocks/FAQWithForm/Server.tsx`
- Create: `src/blocks/FAQWithForm/Component.tsx`
- Create: `src/blocks/FAQWithForm/BrandForm.tsx`
- Create: `src/blocks/FAQWithForm/styles.css`
- Create: `tests/unit/blocks/FAQWithForm.test.tsx`
- Modify: `src/collections/Pages/index.ts`
- Modify: `src/blocks/RenderBlocks.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/unit/blocks/FAQWithForm.test.tsx
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { FAQWithFormBlock } from '@/blocks/FAQWithForm/Component'
import type { FAQWithFormBlock as FAQWithFormBlockType } from '@/payload-types'
import type { FaqItem } from '@/payload-types'

const makeFaqItem = (id: string, question: string): FaqItem => ({
  id,
  question,
  answer: { root: { children: [{ type: 'paragraph', version: 1, children: [{ text: `Answer to ${question}`, type: 'text', version: 1 }] }], type: 'root', version: 1 } } as any,
  weight: 10,
  tags: [{ label: 'brands', id: 't1' }],
  updatedAt: '',
  createdAt: '',
})

const base: FAQWithFormBlockType & { resolvedFaqs: FaqItem[] } = {
  blockType: 'faqWithForm',
  blockName: 'Start A Program',
  id: 'fwf-1',
  heading: 'Answers before your brand shows up.',
  filterTags: [{ tag: 'brands', id: 'ft1' }],
  form: {
    heading: 'Start a brand program',
    odooEndpoint: 'https://odoo.example.com/api/leads',
  },
  resolvedFaqs: [
    makeFaqItem('faq-1', 'Do we control pricing?'),
    makeFaqItem('faq-2', 'Who handles replenishment?'),
  ],
}

describe('FAQWithFormBlock', () => {
  afterEach(cleanup)

  it('renders section landmark with aria-label from heading', () => {
    render(<FAQWithFormBlock {...base} />)
    expect(screen.getByRole('region', { name: /answers before/i })).toBeInTheDocument()
  })

  it('renders main heading', () => {
    render(<FAQWithFormBlock {...base} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Answers before your brand shows up.')
  })

  it('renders FAQ questions as summary elements', () => {
    render(<FAQWithFormBlock {...base} />)
    expect(screen.getByText('Do we control pricing?')).toBeInTheDocument()
    expect(screen.getByText('Who handles replenishment?')).toBeInTheDocument()
  })

  it('renders form heading', () => {
    render(<FAQWithFormBlock {...base} />)
    expect(screen.getByText('Start a brand program')).toBeInTheDocument()
  })

  it('renders GA4 attributes on block root', () => {
    const { container } = render(<FAQWithFormBlock {...base} />)
    const section = container.querySelector('section')
    expect(section?.getAttribute('data-ga-block')).toBe('faq_with_form')
    expect(section?.getAttribute('data-ga-section')).toBe('Start A Program')
  })

  it('renders FAQ summaries with ga-event attribute', () => {
    const { container } = render(<FAQWithFormBlock {...base} />)
    const summaries = container.querySelectorAll('summary')
    for (const summary of summaries) {
      expect(summary.getAttribute('data-ga-event')).toBe('faq_expand')
    }
  })

  it('renders nothing when heading is missing', () => {
    const { container } = render(<FAQWithFormBlock {...base} heading={undefined} />)
    expect(container.firstChild).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
pnpm vitest run tests/unit/blocks/FAQWithForm.test.tsx
```

Expected: FAIL — `Cannot find module '@/blocks/FAQWithForm/Component'`

- [ ] **Step 3: Create block config**

```ts
// src/blocks/FAQWithForm/config.ts
import type { Block } from 'payload'

export const FAQWithForm: Block = {
  slug: 'faqWithForm',
  interfaceName: 'FAQWithFormBlock',
  imageURL: '/block-previews/faq-with-form.png',
  imageAltText: 'FAQ with Form block — accordion FAQ + lead capture form',
  labels: { singular: 'FAQ With Form', plural: 'FAQ With Forms' },
  fields: [
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
      name: 'filterTags',
      type: 'array',
      required: true,
      admin: { description: 'Pull FAQItems matching these tags, sorted by weight descending.' },
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
    {
      name: 'form',
      type: 'group',
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
          localized: true,
          admin: { description: 'Heading shown above the form, e.g. "Start a brand program"' },
        },
        {
          name: 'odooEndpoint',
          type: 'text',
          admin: { description: 'Odoo API URL for form submission, e.g. https://odoo.example.com/api/leads' },
        },
      ],
    },
  ],
}
```

- [ ] **Step 4: Create BrandForm.tsx (client component)**

```tsx
// src/blocks/FAQWithForm/BrandForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import type React from 'react'

type FormValues = {
  brandName: string
  workEmail: string
  productCategory: string
  targetVenues: string
  desiredTimeline: string
  placementGoal: string
  message: string
}

type Props = {
  heading: string
  odooEndpoint?: string | null
}

export const BrandForm: React.FC<Props> = ({ heading, odooEndpoint }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormValues>()

  const onSubmit = async (data: FormValues) => {
    if (!odooEndpoint) return
    try {
      const res = await fetch(odooEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(await res.text())
      document.dispatchEvent(new CustomEvent('ga4', { detail: { event: 'brand_form_submit' } }))
      reset()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      document.dispatchEvent(new CustomEvent('ga4', { detail: { event: 'brand_form_error', label: msg } }))
      throw err
    }
  }

  return (
    <div className="ak-faq-form__panel">
      <h3 className="ak-faq-form__form-heading">{heading}</h3>

      {isSubmitSuccessful ? (
        <p role="status" className="ak-faq-form__success">
          Thank you! We'll be in touch shortly.
        </p>
      ) : (
        <form
          className="ak-faq-form__form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-label={heading}
        >
          <div className="ak-faq-form__row">
            <div className="ak-faq-form__field">
              <label htmlFor="brandName">Brand name</label>
              <input
                id="brandName"
                type="text"
                className="bp-input"
                aria-required="true"
                aria-describedby={errors.brandName ? 'brandName-error' : undefined}
                {...register('brandName', { required: 'Brand name is required' })}
              />
              {errors.brandName && (
                <span id="brandName-error" role="alert" className="ak-faq-form__error">
                  {errors.brandName.message}
                </span>
              )}
            </div>
            <div className="ak-faq-form__field">
              <label htmlFor="workEmail">Work email</label>
              <input
                id="workEmail"
                type="email"
                className="bp-input"
                aria-required="true"
                aria-describedby={errors.workEmail ? 'workEmail-error' : undefined}
                {...register('workEmail', {
                  required: 'Work email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                })}
              />
              {errors.workEmail && (
                <span id="workEmail-error" role="alert" className="ak-faq-form__error">
                  {errors.workEmail.message}
                </span>
              )}
            </div>
          </div>

          <div className="ak-faq-form__row">
            <div className="ak-faq-form__field">
              <label htmlFor="productCategory">Product category</label>
              <input id="productCategory" type="text" className="bp-input" {...register('productCategory')} />
            </div>
            <div className="ak-faq-form__field">
              <label htmlFor="targetVenues">Target venues</label>
              <input id="targetVenues" type="text" className="bp-input" {...register('targetVenues')} />
            </div>
          </div>

          <div className="ak-faq-form__row">
            <div className="ak-faq-form__field">
              <label htmlFor="desiredTimeline">Desired timeline</label>
              <input id="desiredTimeline" type="text" className="bp-input" {...register('desiredTimeline')} />
            </div>
            <div className="ak-faq-form__field">
              <label htmlFor="placementGoal">Placement goal</label>
              <input id="placementGoal" type="text" className="bp-input" {...register('placementGoal')} />
            </div>
          </div>

          <div className="ak-faq-form__field">
            <label htmlFor="message">Message / notes</label>
            <textarea id="message" className="bp-input ak-faq-form__textarea" rows={4} {...register('message')} />
          </div>

          <button
            type="submit"
            className="bp-btn bp-btn--primary ak-faq-form__submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Sending…' : 'Submit Brand Program Request'}
          </button>
        </form>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Create Component.tsx**

```tsx
// src/blocks/FAQWithForm/Component.tsx
import type React from 'react'
import { SectionHeader } from '@/components/SectionHeader'
import type { FAQWithFormBlock as FAQWithFormBlockProps, FaqItem } from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import { BrandForm } from './BrandForm'
import './styles.css'

type Props = FAQWithFormBlockProps & { resolvedFaqs?: FaqItem[] }

export const FAQWithFormBlock: React.FC<Props> = ({
  heading,
  subheading,
  form,
  blockName,
  blockType,
  resolvedFaqs = [],
}) => {
  if (!heading) return null

  return (
    <section
      className="ak-faq-form"
      aria-label={heading}
      data-ga-block={toSnakeCase(blockType)}
      data-ga-section={blockName ?? undefined}
    >
      <div className="bp-content-grid">
        <div className="breakout ak-faq-form__inner">
          <SectionHeader heading={heading} subtitle={subheading} align="center" />

          <div className="ak-faq-form__columns">
            <div className="ak-faq-form__faq-side">
              {resolvedFaqs.length > 0 && (
                <div className="bp-accordion">
                  {resolvedFaqs.map((item) => (
                    <details
                      key={item.id}
                      className="bp-accordion__item"
                      name={`faq-${blockName ?? 'block'}`}
                    >
                      <summary
                        className="bp-accordion__summary"
                        data-ga-event="faq_expand"
                        data-ga-label={item.question}
                      >
                        {item.question}
                      </summary>
                      <div className="bp-accordion__body">
                        {typeof item.answer === 'object' && (
                          <p>{/* RichText rendered via existing RichText component if available */}</p>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </div>

            <div className="ak-faq-form__form-side">
              <BrandForm
                heading={form?.heading ?? ''}
                odooEndpoint={form?.odooEndpoint}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Create Server.tsx**

```tsx
// src/blocks/FAQWithForm/Server.tsx
import config from '@payload-config'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type React from 'react'
import type { FAQWithFormBlock as FAQWithFormBlockProps, FaqItem } from '@/payload-types'
import { FAQWithFormBlock } from './Component'

export const FAQWithFormServer: React.FC<FAQWithFormBlockProps> = async (props) => {
  const { filterTags, ...rest } = props
  const payload = await getPayload({ config })
  const locale = await getLocale()

  const tags = (filterTags ?? []).map((t) => t.tag).filter(Boolean)

  const result = await payload.find({
    collection: 'faqItems',
    where: tags.length > 0 ? { 'tags.label': { in: tags } } : {},
    sort: '-weight',
    depth: 0,
    overrideAccess: false,
    locale: locale as 'en' | 'es',
  })

  return <FAQWithFormBlock {...rest} resolvedFaqs={result.docs as FaqItem[]} />
}
```

- [ ] **Step 7: Create styles.css**

```css
/* src/blocks/FAQWithForm/styles.css */
.ak-faq-form {
  background: var(--faq-form-bg, var(--ak-section-bg-alt, #f9fafb));
}

.ak-faq-form__inner {
  padding-block: var(--bp-space-16, 4rem);
}

.ak-faq-form__columns {
  display: grid;
  grid-template-columns: 55fr 45fr;
  gap: var(--bp-space-12, 3rem);
  margin-top: var(--bp-space-10, 2.5rem);
  align-items: start;
}

.ak-faq-form__panel {
  background: var(--bp-color-bg-elevated, #fff);
  border-radius: var(--bp-radius-lg, 0.75rem);
  padding: var(--bp-space-8, 2rem);
  border: 1px solid var(--bp-color-border, #e5e7eb);
}

.ak-faq-form__form-heading {
  font-size: var(--bp-font-size-xl, 1.25rem);
  font-weight: var(--bp-font-weight-bold, 700);
  margin-bottom: var(--bp-space-6, 1.5rem);
}

.ak-faq-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--bp-space-4, 1rem);
}

.ak-faq-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--bp-space-1, 0.25rem);
  margin-bottom: var(--bp-space-4, 1rem);
}

.ak-faq-form__field label {
  font-size: var(--bp-font-size-sm, 0.875rem);
  font-weight: var(--bp-font-weight-medium, 500);
  color: var(--bp-color-text, currentColor);
}

.ak-faq-form__textarea {
  resize: vertical;
}

.ak-faq-form__error {
  font-size: var(--bp-font-size-sm, 0.875rem);
  color: var(--ak-color-primary, #e11d48);
}

.ak-faq-form__submit {
  width: 100%;
  margin-top: var(--bp-space-4, 1rem);
}

.ak-faq-form__success {
  padding: var(--bp-space-4, 1rem);
  color: var(--bp-color-success, #16a34a);
  text-align: center;
}

@media (max-width: 1023px) {
  .ak-faq-form__columns {
    grid-template-columns: 1fr;
  }
  .ak-faq-form__row {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 8: Register in Pages collection and RenderBlocks**

In `src/collections/Pages/index.ts`, add:

```ts
import { FAQWithForm } from '../../blocks/FAQWithForm/config'
```

Add `FAQWithForm` to blocks array:

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
  FormatsGrid,
  ProcessSteps,
  FAQWithForm,     // ← add
],
```

In `src/blocks/RenderBlocks.tsx`, add:

```tsx
import { FAQWithFormServer } from '@/blocks/FAQWithForm/Server'

// in blockComponents:
faqWithForm: FAQWithFormServer,
```

- [ ] **Step 9: Regenerate types and importmap**

```bash
pnpm generate:types
pnpm generate:importmap
```

- [ ] **Step 10: Run test — expect pass**

```bash
pnpm vitest run tests/unit/blocks/FAQWithForm.test.tsx
```

Expected: all tests pass.

- [ ] **Step 11: Verify TypeScript**

```bash
tsc --noEmit
```

- [ ] **Step 12: Commit**

```bash
git add src/blocks/FAQWithForm/ src/collections/Pages/index.ts src/blocks/RenderBlocks.tsx src/app/\(payload\)/admin/importMap.js src/payload-types.ts tests/unit/blocks/FAQWithForm.test.tsx
git commit -m "feat(blocks): add FAQWithForm block with RHF → Odoo form"
```

---

## Task 6: Seed data — Machines, FAQItems, For Brands page

**Files:**
- Create: `src/seed/for-brands.ts`

> **Note:** Run this seed script once against a local or dev database. It requires `DATABASE_URL` and `PAYLOAD_SECRET` set in `.env`.

- [ ] **Step 1: Create seed script**

```ts
// src/seed/for-brands.ts
import config from '@payload-config'
import { getPayload } from 'payload'

async function seed() {
  const payload = await getPayload({ config })

  // ── Machines ─────────────────────────────────────────────────────────────
  const machineNames = [
    { name: 'Full-size branded machine', slug: 'full-size-branded-machine', tagline: 'Full-size branded machine', tag: 'full-size' },
    { name: 'Campaign activation unit', slug: 'campaign-activation-unit', tagline: 'Campaign activation unit', tag: 'campaign' },
    { name: 'Compact footprint machine', slug: 'compact-footprint-machine', tagline: 'Compact footprint machine', tag: 'compact' },
    { name: 'Premium venue configuration', slug: 'premium-venue-configuration', tagline: 'Premium venue configuration', tag: 'premium' },
  ]

  const machineIds: Record<string, number> = {}

  for (const m of machineNames) {
    // Machines require an image — upload a placeholder via media if needed.
    // For the seed, reuse any existing media ID. Replace mediaId below with a real ID.
    const mediaId = 1 // ← replace with a real media ID from your DB

    const existing = await payload.find({ collection: 'machines', where: { slug: { equals: m.slug } }, limit: 1 })
    if (existing.totalDocs > 0) {
      machineIds[m.slug] = existing.docs[0]!.id as number
      console.log(`Machine exists: ${m.name}`)
      continue
    }

    const machine = await payload.create({
      collection: 'machines',
      data: {
        name: m.name,
        slug: m.slug,
        tagline: m.tagline,
        image: mediaId,
        tags: [{ label: m.tag }],
        layout: [],
        _status: 'published',
      },
    })
    machineIds[m.slug] = machine.id as number
    console.log(`Created machine: ${m.name}`)
  }

  // ── FAQItems ─────────────────────────────────────────────────────────────
  const faqs = [
    { question: 'Do we control pricing?', answer: 'Pricing can be defined with your team based on product strategy, venue context, and commercial goals.', weight: 40, tags: ['brands'] },
    { question: 'Who handles replenishment?', answer: 'Amerikiosks manages replenishment workflows, inventory monitoring, and operational coordination.', weight: 30, tags: ['brands', 'replenishment'] },
    { question: 'Can the machine be fully branded?', answer: 'Yes. Wraps, screen content, product presentation, and campaign messaging can be tailored to your brand system.', weight: 20, tags: ['brands', 'branding'] },
    { question: 'Can we test locations?', answer: 'Yes. Programs can test venues, assortments, pricing, and campaign messages before scaling.', weight: 10, tags: ['brands'] },
  ]

  for (const faq of faqs) {
    const existing = await payload.find({ collection: 'faqItems', where: { question: { equals: faq.question } }, limit: 1 })
    if (existing.totalDocs > 0) {
      console.log(`FAQ exists: ${faq.question}`)
      continue
    }

    await payload.create({
      collection: 'faqItems',
      data: {
        question: faq.question,
        answer: {
          root: {
            type: 'root',
            version: 1,
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [{ type: 'text', version: 1, text: faq.answer }],
              },
            ],
          },
        },
        weight: faq.weight,
        tags: faq.tags.map((label) => ({ label })),
      },
    })
    console.log(`Created FAQ: ${faq.question}`)
  }

  // ── For Brands page ───────────────────────────────────────────────────────
  const slug = 'who-its-for/for-brands'
  const existing = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1 })
  if (existing.totalDocs > 0) {
    console.log(`Page exists: ${slug}`)
    process.exit(0)
  }

  await payload.create({
    collection: 'pages',
    data: {
      title: 'For Brands',
      slug,
      hero: {
        type: 'mediumImpact',
        breadcrumb: "Home / Who it's for / For brands",
        richText: {
          root: {
            type: 'root',
            version: 1,
            children: [
              { type: 'heading', tag: 'h1', version: 1, children: [{ type: 'text', version: 1, text: 'For brands ready to show up with intent.' }] },
              { type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'Launch branded retail experiences in premium venues without building stores, hiring staff, or managing daily operations.' }] },
            ],
          },
        },
        links: [
          { link: { label: 'Start a Brand Program', type: 'custom', url: '/contact', appearance: 'default' } },
          { link: { label: 'See case studies', type: 'custom', url: '/insights', appearance: 'outline' } },
        ],
        tags: [{ label: 'Brand-controlled' }, { label: 'Fully managed' }, { label: 'Built to learn' }],
        media: 1, // ← replace with kiosk venue image media ID
      },
      layout: [
        {
          blockType: 'insightsShowcase',
          blockName: 'Real Brand Moments',
          eyebrow: 'REAL BRAND MOMENTS',
          heading: 'Real brand moments, built to sell.',
        },
        {
          blockType: 'cardGrid',
          blockName: 'One Program Four Decisions',
          variant: 'pillar',
          eyebrow: 'FOR BRANDS',
          heading: 'One program. Four decisions your team controls.',
          subheading: 'Amerikiosks gives brand teams control over where the experience appears, how it looks, how it operates, and what can be learned before scaling.',
          items: [
            { eyebrow: 'PLACEMENT', title: 'Place with intent', body: { root: { type: 'root', version: 1, children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'Show up in premium contexts where attention, need, and brand relevance already meet.' }] }] } } },
            { eyebrow: 'EXPRESSION', title: 'Control the experience', body: { root: { type: 'root', version: 1, children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'Wraps, screen content, assortment, pricing strategy, and campaign expression stay on-brand.' }] }] } } },
            { eyebrow: 'OPERATIONS', title: 'Launch without overhead', body: { root: { type: 'root', version: 1, children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'Installation, replenishment, venue coordination, service, and support move through one partner.' }] }] } } },
            { eyebrow: 'LEARNING', title: 'Learn before scaling', body: { root: { type: 'root', version: 1, children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'Use sales, inventory, location, and product-level signals to understand what deserves scale.' }] }] } } },
          ],
        },
        {
          blockType: 'formatsGrid',
          blockName: 'Formats Grid',
          eyebrow: 'FORMATS',
          heading: 'Formats built around your brand moment.',
          filterTags: [{ tag: 'full-size' }, { tag: 'campaign' }, { tag: 'compact' }, { tag: 'premium' }],
        },
        {
          blockType: 'processSteps',
          blockName: 'How It Works',
          eyebrow: 'HOW IT WORKS',
          heading: 'From first opportunity to daily operation.',
          subheading: 'You get physical retail presence without building a retail operation. Amerikiosks plans, launches, operates, and optimizes the program with your team.',
          steps: [
            { title: 'Define the moment', body: { root: { type: 'root', version: 1, children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'We define your category, audience, venue fit, campaign goal, and the consumer your brand should own.' }] }] } } },
            { title: 'Match the context', body: { root: { type: 'root', version: 1, children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'We identify high-intent venues that fit your audience, product, and desired retail behavior.' }] }] } } },
            { title: 'Design the experience', body: { root: { type: 'root', version: 1, children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'Machine format, wrap, screen content, assortment, payment flow, and inventory plan come together.' }] }] } } },
            { title: 'Launch with one partner', body: { root: { type: 'root', version: 1, children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'Amerikiosks coordinates installation, venue setup, replenishment workflows, and go-live support.' }] }] } } },
            { title: 'Operate and optimize', body: { root: { type: 'root', version: 1, children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'We monitor sales, inventory, and location performance to refine assortment and campaign decisions.' }] }] } } },
          ],
          cta: [{ link: { label: 'Start a Brand Program', type: 'custom', url: '/contact', appearance: 'default' } }],
        },
        {
          blockType: 'faqWithForm',
          blockName: 'Start A Program',
          heading: 'Answers before your brand shows up.',
          subheading: 'A focused form and practical FAQ help qualify the right program without turning the page into a generic contact flow.',
          filterTags: [{ tag: 'brands' }],
          form: {
            heading: 'Start a brand program',
            odooEndpoint: process.env.ODOO_ENDPOINT ?? '',
          },
        },
      ],
      _status: 'published',
    },
  })
  console.log(`Created page: ${slug}`)
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 2: Add ODOO_ENDPOINT to .env**

In `.env`, add:

```
ODOO_ENDPOINT=https://your-odoo-instance.com/api/leads
```

In `.env.example`, add:

```
ODOO_ENDPOINT=
```

- [ ] **Step 3: Run the seed script**

```bash
pnpm tsx src/seed/for-brands.ts
```

Expected output:
```
Created machine: Full-size branded machine
Created machine: Campaign activation unit
Created machine: Compact footprint machine
Created machine: Premium venue configuration
Created FAQ: Do we control pricing?
Created FAQ: Who handles replenishment?
Created FAQ: Can the machine be fully branded?
Created FAQ: Can we test locations?
Created page: who-its-for/for-brands
```

> **Note:** Update the `mediaId = 1` placeholder in the seed to a real media ID from your database. Find it via Payload admin → Media, or `SELECT id FROM media LIMIT 5;`.

- [ ] **Step 4: Commit**

```bash
git add src/seed/for-brands.ts .env.example
git commit -m "feat(seed): add For Brands page seed with machines and FAQ items"
```

---

## Task 7: `/faq` page route

**Files:**
- Create: `src/app/(frontend)/[locale]/faq/page.tsx`
- Create: `src/app/(frontend)/[locale]/faq/FaqClient.tsx`
- Create: `src/app/(frontend)/[locale]/faq/faq.css`

- [ ] **Step 1: Create FaqClient.tsx (client component — filter UI)**

```tsx
// src/app/(frontend)/[locale]/faq/FaqClient.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type React from 'react'
import type { FaqItem } from '@/payload-types'

type Props = {
  faqs: FaqItem[]
  allTags: string[]
}

export const FaqClient: React.FC<Props> = ({ faqs, allTags }) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTag = searchParams.get('tag') ?? ''

  const filtered = activeTag ? faqs.filter((f) => f.tags?.some((t) => t.label === activeTag)) : faqs

  const setTag = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (tag) {
      params.set('tag', tag)
    } else {
      params.delete('tag')
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <>
      <div className="ak-faq-page__filters" role="group" aria-label="Filter by topic">
        <button
          className="bp-btn ak-faq-page__filter-btn"
          aria-pressed={activeTag === ''}
          onClick={() => setTag('')}
          data-ga-block="faq_page"
          data-ga-event="faq_filter"
          data-ga-label="all"
        >
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            className="bp-btn ak-faq-page__filter-btn"
            aria-pressed={activeTag === tag}
            onClick={() => setTag(tag)}
            data-ga-block="faq_page"
            data-ga-event="faq_filter"
            data-ga-label={tag}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="bp-accordion ak-faq-page__accordion">
        {filtered.map((item) => (
          <details key={item.id} className="bp-accordion__item" name="faq-page">
            <summary
              className="bp-accordion__summary"
              data-ga-event="faq_expand"
              data-ga-label={item.question}
            >
              {item.question}
            </summary>
            <div className="bp-accordion__body">
              <p>{/* RichText render here */}</p>
            </div>
          </details>
        ))}
        {filtered.length === 0 && (
          <p className="ak-faq-page__empty">No questions found for this topic.</p>
        )}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Create page.tsx (server component)**

```tsx
// src/app/(frontend)/[locale]/faq/page.tsx
import config from '@payload-config'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type { Metadata } from 'next'
import type { FaqItem } from '@/payload-types'
import { FaqClient } from './FaqClient'
import './faq.css'

export const metadata: Metadata = {
  title: 'FAQ — Amerikiosks',
  description: 'Frequently asked questions about Amerikiosks brand programs, venue partnerships, and operations.',
}

export default async function FaqPage() {
  const payload = await getPayload({ config })
  const locale = await getLocale()

  const result = await payload.find({
    collection: 'faqItems',
    sort: '-weight',
    depth: 0,
    overrideAccess: false,
    locale: locale as 'en' | 'es',
    limit: 200,
  })

  const faqs = result.docs as FaqItem[]

  const allTags = Array.from(
    new Set(faqs.flatMap((f) => (f.tags ?? []).map((t) => t.label)).filter(Boolean)),
  ) as string[]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: typeof item.answer === 'string' ? item.answer : item.question, // simplification; replace with richText → plainText util
      },
    })),
  }

  return (
    <main className="ak-faq-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bp-content-grid">
        <div className="content ak-faq-page__inner">
          <h1 className="ak-faq-page__heading">Frequently Asked Questions</h1>
          <FaqClient faqs={faqs} allTags={allTags} />
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Create faq.css**

```css
/* src/app/(frontend)/[locale]/faq/faq.css */
.ak-faq-page {
  padding-block: var(--bp-space-16, 4rem);
}

.ak-faq-page__inner {
  max-width: 48rem;
  margin-inline: auto;
}

.ak-faq-page__heading {
  font-size: var(--bp-font-size-4xl, 2.25rem);
  font-weight: var(--bp-font-weight-bold, 700);
  margin-bottom: var(--bp-space-8, 2rem);
}

.ak-faq-page__filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--bp-space-2, 0.5rem);
  margin-bottom: var(--bp-space-8, 2rem);
}

.ak-faq-page__filter-btn[aria-pressed="true"] {
  --btn-background: var(--ak-color-primary, #e11d48);
  --btn-color: #fff;
}

.ak-faq-page__accordion {
  margin-top: var(--bp-space-4, 1rem);
}

.ak-faq-page__empty {
  color: var(--bp-color-text-muted, #6b7280);
  padding: var(--bp-space-4, 1rem) 0;
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
tsc --noEmit
```

- [ ] **Step 5: Run all unit tests**

```bash
pnpm vitest run tests/unit/
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(frontend\)/\[locale\]/faq/
git commit -m "feat(pages): add /faq page with tag filter and JSON-LD"
```

---

## Post-implementation checklist

- [ ] Run `pnpm dev` and navigate to `/who-its-for/for-brands` — verify all blocks render
- [ ] Navigate to `/faq` — verify tag filter works and URL updates
- [ ] Open Payload admin → verify Machines and FAQItems collections appear
- [ ] Check browser DevTools → verify `data-ga-*` attributes on all tracked elements
- [ ] Run `pnpm lint:fix` and fix any issues
- [ ] Run full test suite: `pnpm vitest run`
- [ ] Validate JSON-LD at https://search.google.com/test/rich-results
- [ ] Open axe DevTools / Lighthouse accessibility audit on `/who-its-for/for-brands` and `/faq`
