# Block Analytics Attribution

**Date:** 2026-06-03  
**Status:** Approved

## Problem

GA events fired from within blocks carry a hardcoded `data-ga-section` value per element. There is no consistent way to answer "how does this block type perform overall?" or "does this block perform better in one page context vs another?".

## Solution

Add two data attributes to every block's root `<section>`:

| Attribute | Source | Example | Purpose |
|---|---|---|---|
| `data-ga-block` | `blockType` → snake_case | `trust_strip` | Aggregate performance across all instances of a block type |
| `data-ga-section` | `blockName` (CMS instance label) | `Partner Brands` | Identify placement context |

## Architecture

### 1. Utility — `toSnakeCase`

A small pure function in `src/utilities/toSnakeCase.ts`:

```ts
export const toSnakeCase = (str: string) =>
  str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')
// "trustStrip" → "trust_strip"
```

### 2. Block components

Each active block component adds to its root `<section>`:

```tsx
<section
  data-ga-block={toSnakeCase(blockType)}
  data-ga-section={blockName ?? undefined}
  ...
>
```

`blockName` is already part of Payload's block type — no schema change needed.

Active blocks in scope: `TrustStripBlock`, `ValuePropsBlock`.

### 3. GAListener update

After resolving the clicked `[data-ga-event]` element, walk up to the nearest `[data-ga-block]` ancestor and attach to the GA event:

```ts
const blockEl = el.closest<HTMLElement>('[data-ga-block]')
g('event', el.dataset.gaEvent, {
  block: blockEl?.dataset.gaBlock ?? undefined,
  section: el.dataset.gaSection ?? blockEl?.dataset.gaSection ?? undefined,
  label: ...,
  locale: ...,
})
```

Element-level `data-ga-section` wins over block-level — existing hardcoded sections are not broken.

### 4. Seeds

All active `pages/` seed blocks get a descriptive `blockName`:

| Block | blockName (EN) |
|---|---|
| `valueProps` on home | `"Value Props — Home"` |
| `trustStrip` on home | `"Trust Strip — Home"` |

Other page seeds follow the same `"Block Type — Page"` convention.

## Out of scope

- Impression / scroll tracking (handled per-block, e.g. `TrustStripTracker`)
- Block position tracking
- Legacy seed files (`home.ts`, `post-*.ts`)

## Success criteria

- GA events from any `[data-ga-event]` element inside a block carry both `block` and `section` params
- No existing `data-ga-section` on individual elements is overridden
- `toSnakeCase("trustStrip") === "trust_strip"`
