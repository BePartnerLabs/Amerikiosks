# Metrics block — design

## Problem

The home page needs a "stats" section (heading + a row of key numbers + optional CTA) — see `metrics.png` (Figma). The Figma layout was flat: number and label had equal visual weight, laid out in a rigid 4-column row with no dividers or contrast.

## Goals

- Give the numbers strong visual hierarchy (bigger, accent-colored) instead of blending into the label.
- Break the rigid equal-width row with dividers, while staying responsive down to mobile.
- Reuse existing patterns (`SectionHeader`, CardGrid's CTA button, container-query responsive approach) instead of inventing new ones.

## Non-goals

- Icon or image support per stat (not requested; can be added later as a variant if needed).
- Animated counters / count-up-on-scroll (not requested).

## Decisions (from brainstorming)

Explored 4 layout directions with the user via visual mockups (flat row, big-number-with-dividers, boxed cards, vertical list). User picked **big-number-with-dividers**, then asked to reuse the shared `SectionHeader` component for the heading instead of custom spacing rules — solves the "title needs more room" feedback for free since `SectionHeader` already has tuned spacing.

- **Stats count:** flexible array, min 2 / max 6 (like `CardGrid.items`), not fixed at 4.
- **CTA:** optional, same show/hide behavior as `CardGrid` pillar variant (hidden unless both `label` and `url`/reference resolve).
- **Eyebrow:** included as an optional field for consistency with `CardGrid`/`TrustStrip`, even though the reference Figma doesn't show one.
- **Mobile layout:** 2×2 grid (not vertical stack, not carousel).
- **Block name:** "Metrics" (`slug: 'metrics'`, admin labels "Metrics" / "Métricas").
- **Registration:** registered as a top-level Payload layout Block on `Pages` (same pattern as `CardGrid`/`TrustStrip`), **and** added to the `Content` block's Lexical `BlocksFeature` list so editors can also insert it inside a rich-text body later — mirrors how `CardGrid` is registered in both places already.

## Fields (`src/blocks/Metrics/config.ts`)

| Field | Type | Required | Localized | Notes |
|---|---|---|---|---|
| `eyebrow` | text | no | yes | Small label above heading, e.g. "WHY AMERIKIOSKS" |
| `heading` | textarea | yes | yes | Supports `**bold**` markdown via `renderBoldText`, matches `CardGrid.heading` pattern |
| `items` | array (min 2, max 6) | yes | yes | Each row: `value` (text, required, e.g. "10+", "1000+"), `label` (text, required, e.g. "Years of Industry Experience") |
| `link` | group | no | — | `label` (text, localized), `url` (text), `type` (radio: custom/reference, default custom), `reference` (relationship to `pages`, shown when `type === 'reference'`) — same shape as `CardGridBlock.link` |

## Component (`src/blocks/Metrics/Component.tsx`)

- Renders `<SectionHeader eyebrow heading align="center" />` (no `subtitle` prop passed — this block has none).
- Renders each `items` entry as a `.ak-metrics__stat`: `value` and `label`.
- Renders the CTA link only when `ctaUrl` (resolved the same way `CardGrid.resolveUrl` does) and `link.label` are both present — reuse or duplicate the small `resolveUrl` helper.
- `data-ga-block={toSnakeCase(blockType)}` on the `<section>` (no variant — this block has a single visual treatment, unlike `CardGrid`).

## Styles (`src/blocks/Metrics/styles.css`)

- `.ak-metrics` section: `container-type: inline-size` (same container-query pattern as `CardGrid`).
- `.ak-metrics__stats`: flex row, each `.ak-metrics__stat` has `border-left: 1px solid var(--ak-color-border)` except `:first-child`.
- `.ak-metrics__stat-value`: ~2.75rem / 700 weight, color `var(--ak-accent)`.
- `.ak-metrics__stat-label`: ~0.9rem / 600 weight, color `var(--ak-color-heading)`.
- `@container ak-metrics (max-width: 40rem)` (mobile breakpoint, matching `CardGrid`'s existing 40rem threshold): `.ak-metrics__stats` switches to `grid-template-columns: repeat(2, 1fr)`; vertical dividers replaced with a bottom border on rows except the last row (exact selector TBD at implementation time based on real item counts).
- CTA button: reuse `.ak-card-grid__cta-btn` visual spec (border, radius, hover-fill) as a new `.ak-metrics__cta-btn` class — same declarations, not a shared class, to keep blocks independently stylable per project convention (each block owns its CSS file).
- Follows the DS 3-level variable rule: `--ak-*` tokens only referenced through `--_*`/Level 2 overrides inside `.bp-*` selectors (n/a here — no `.bp-*` DS components used directly), direct `--ak-*` usage is fine in `.ak-metrics-*` selectors per the existing `check-component-docs`-adjacent convention seen in `CardGrid/styles.css`.

## Registration

- `src/blocks/Metrics/config.ts` exported as `Metrics`.
- Added to `src/collections/Pages/index.ts` blocks array.
- Added to `src/blocks/RenderBlocks.tsx` (`blockComponents.metrics`).
- Added to `src/blocks/Content/config.ts` `BlocksFeature({ blocks: [CardGrid, MediaBlock, Metrics] })`.
- Added to `src/components/RichText/index.tsx` `jsxConverters.blocks.metrics`, mirroring the existing `cardGrid` entry.
- Run `pnpm generate:types` then `pnpm generate:importmap` after the config lands.

## Open questions

None outstanding — all resolved during brainstorming.
