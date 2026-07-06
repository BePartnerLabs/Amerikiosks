# Migrate `/machines` listing into a Payload Page (pilot) + new `simple` hero + `MachinesListing` block

## Context

`/machines` is currently a hardcoded Next.js route (`src/app/(frontend)/[locale]/machines/page.tsx`) backed by client components `MachinesClient.tsx` and `MachineTile.tsx`. It is not a Payload `Pages` document, so its heading/copy/layout are not admin-editable — unlike `/faq` and `/insights`, which follow the same pattern (hardcoded route, `<h1>` in code), this is a real inconsistency in the codebase but out of scope to fix everywhere at once.

This spec redesigns `/machines` to match a new visual mockup (`Machine detail.png`: light-blue centered header with eyebrow + title, red pill filter tabs, uniform 3-column card grid with description + "Learn more" button, red CTA banner at the bottom) **and**, instead of just reskinning the hardcoded route, migrates it to be a real `Pages` document. This is the pilot for a broader initiative (not in this spec) to migrate `/faq`, `/insights`, and `/projects` the same way once this pattern is validated.

No changes to the `Machines` collection schema (`name`, `slug`, `tagline`, `image`, `tags`) — it already covers everything the new card design needs. `machine.name` becomes the card title text as-is (per product decision, card titles may read as scenario/use-case names going forward, e.g. "Consignment Model" — this is a content/naming decision for editors, not a schema change).

## Goals

1. `/machines` becomes a `Pages` collection document (slug `machines`), rendered through the existing `[locale]/[slug]/page.tsx` catch-all route — admin-editable hero and block layout.
2. A new hero variant, `simple`, for pages needing a centered eyebrow+title header with no media/breadcrumbs/accent bar (distinct look from `LowImpact`, which is dark/left-aligned/breadcrumb-driven and used elsewhere — must not be touched).
3. A new block, `MachinesListing`, rendering the full machine catalog with interactive tag-pill filtering and pagination — distinct from the existing `FormatsGrid` block (which stays as-is for curated/picked-machine use elsewhere, e.g. via `filterTags`/`items`).
4. The bottom CTA banner uses the existing `CallToAction` block, added as a second layout entry on this page — no new component or schema.
5. `/machines/[slug]` (machine detail pages) are untouched — still a hardcoded nested route, unaffected by this migration since it's a more specific path than the `[slug]` catch-all.

## Out of scope

- Migrating `/faq`, `/insights`, `/projects` to `Pages` docs — separate follow-up initiative, only the pattern established here should inform it later.
- Any change to `/machines/[slug]` detail pages or the `Machines` collection schema.
- A generic/polymorphic "content index" block spanning multiple collections — rejected in favor of one small, purpose-built listing block per collection (`MachinesListing` now; `FaqListing`/`InsightsListing`/`ProjectsListing` later, following the same Server+pagination pattern, not a shared generic component).

## Routing change

- Delete `src/app/(frontend)/[locale]/machines/page.tsx`.
- `/machines` now resolves via `src/app/(frontend)/[locale]/[slug]/page.tsx` against a `Pages` doc with slug `machines`.
- `src/app/(frontend)/[locale]/machines/[slug]/page.tsx` (detail) is unaffected — Next.js matches the more specific `machines/[slug]` segment before falling back to the top-level `[slug]` catch-all.

## New hero variant: `simple`

`src/heros/config.ts`:
- Add `{ label: 'Simple', value: 'simple' }` to the `type` select options.
- Extend the `tags` field's `condition` to include `'simple'` (same array-of-labels rendering as `lowImpact`/`mediumImpact`).
- `media`/`backgroundVideo` conditions are unchanged (`simple` never shows or requires them).
- `richText` is reused as-is — editors write the eyebrow as a small leading paragraph/text and the title as an `<h1>` in the same Lexical field (the editor already exposes `HeadingFeature` for h1-h4).

New component `src/heros/Simple/index.tsx` (+ `simple.css`), registered in `src/heros/RenderHero.tsx`'s switch as the `simple` case:
- No breadcrumbs, no accent bar, no media/video, no links row unless `links` present (optional, rendered centered below the heading if provided).
- Centered content, light background using existing DS tokens (`--ak-surface`/equivalent — no new `--ak-*` tokens, Level 2 overrides only where a DS default doesn't fit, per this repo's CSS variable rules).
- `richText` rendered the same way as `LowImpactHero` (via `RichText` component), just without the `.ak-hero-page__accent` bar/flex row — plain centered block.
- Optional `tags` array rendered centered below, reusing `.ak-hero-page__tag` styling patterns (new BEM root, e.g. `.ak-hero-simple`, not reusing `.ak-hero-page__*` classes directly since the visual context differs).

## New block: `MachinesListing`

Sibling to `FormatsGrid` (not a modification of it) — `src/blocks/MachinesListing/{config.ts,Component.tsx,Server.tsx,styles.css}`.

### `config.ts`

```ts
export const MachinesListing: Block = {
  slug: 'machinesListing',
  interfaceName: 'MachinesListingBlock',
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

No `filterTags`/`items` fields — unlike `FormatsGrid`, this block is always "the full catalog," filtered only by the tag pills at render time, not curated by an editor.

### `Server.tsx`

- Reads `page` and `tag` from the parent page's `searchParams` (passed down from `[locale]/[slug]/page.tsx`, same as the current `MachinesPage` does today).
- `payload.find({ collection: 'machines', where: tag ? { 'tags.label': { equals: tag } } : undefined, limit: itemsPerPage, page, depth: 1, overrideAccess: false, locale })`.
- Also fetches the distinct set of format tags present (`full-size`, `compact`, `campaign`, `premium` — same fixed order/allowlist logic as today's `machines/page.tsx`) for the filter pills, independent of the current tag filter (so switching tags doesn't hide other pills).
- Passes `docs`, `totalPages`, `page`, `allTags` to the Component.

### `Component.tsx`

- Tag pills: ports `MachinesClient`'s existing state/animated-indicator/URL-sync logic as a client sub-component, restyled to red pill/active-background per the mockup (Level 2 CSS override only — DS defaults for pill/chip shape, if any, checked first per the DS rule in `CLAUDE.md`). Changing tag resets `?page=` to 1 (or removes it).
- Grid: uniform 3-column `bp-card` grid (not the current masonry/aspect-ratio columns) — fixed-height image area (`object-fit: cover`), `machine.name` as title, `machine.tagline` as description, a "Learn more" button element inside the card. The whole card stays the real `<Link>` (matches existing `FormatsGrid`/`MachineTile` pattern — no nested interactive elements); the button is presentational.
- Pagination: numbered or prev/next controls using `?page=`, same `bp-btn` styling family as the tag pills, only rendered when `totalPages > 1`.

### Cleanup

Retire `src/app/(frontend)/[locale]/machines/MachinesClient.tsx`, `MachineTile.tsx`, and `machines.css` — their logic relocates into `MachinesListingBlock`'s Component, not duplicated.

## Bottom CTA banner

No new component. The seeded `Pages` doc for `machines` includes a second `layout` entry using the existing `cta` block (`CallToActionBlock`), with richText ("Ready to place GAMMA 13 in your location?") and a link ("Contact Sales"). Fully editable in the admin like any other page's CTA block — no hardcoded copy in code.

## Seed

New `src/endpoints/seed/pages/machines.ts` (or `src/seed/machines.ts`, matching whichever of the two existing seed directories is the current convention for page-level seeds — confirm against `pages/for-brands.ts` at implementation time), creating a `Pages` doc:
- `slug: 'machines'`
- `hero: { type: 'simple', richText: <eyebrow "EXPLORE OUR MODELS" + h1 "Find the right kiosk for your space."> }`
- `layout: [{ blockType: 'machinesListing', itemsPerPage: 12 }, { blockType: 'cta', richText: <"Ready to place GAMMA 13 in your location?">, links: [{ link: { label: 'Contact Sales', ... } }] }]`

Wired into the seed endpoint alongside the other `pages/*.ts` entries.

## Testing

- Unit: `MachinesListingBlock` Component — tag filter changes reset pagination; renders correct `totalPages`/pills from given props.
- Unit: `SimpleHero` — renders richText/tags, omits breadcrumb/accent/media regardless of props.
- Integration: `/machines` (via `[slug]` catch-all) renders hero + listing + CTA in the expected order from a seeded `Pages` doc; `/machines/[slug]` still resolves to the untouched detail route.
- Manual: verify old `/machines` bookmarked URLs still work (same path, new resolution mechanism) and that filter+pagination state round-trips via the URL as it does today.

## Migration/rollback note

This is a routing-mechanism change (hardcoded route → CMS-resolved route) as well as a visual redesign. If the seeded `Pages` doc is missing or misconfigured, `/machines` would 404 via the catch-all's `notFound()` — the seed script must run (or the doc must be created in admin) before removing the old route file, to avoid downtime.
