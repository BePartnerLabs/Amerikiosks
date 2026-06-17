# Machines pages — listing + detail, Apple-style hero

## Context

The `Machines` collection (`src/collections/Machines/index.ts`) already exists with `name`, `slug`, `tagline`, `image`, `tags`, and an empty `layout` blocks array. The `FormatsGrid` block (`src/blocks/FormatsGrid/`) already renders machine cards on CMS pages and links each card to `/machines/[slug]` — but neither `/machines` (listing) nor `/machines/[slug]` (detail) exists yet as a route. This spec adds both routes plus the schema needed for an Apple-product-page-style detail experience.

## Goals

- A `/machines` listing page with a masonry grid (tile height driven by real image aspect ratio) and tag filter pills.
- A `/machines/[slug]` detail page with an Apple-style pinned/scroll-driven hero, spec list, feature callouts, gallery, and sticky CTA.
- Two selectable hero treatments per machine: a default lightweight zoom+fade, and an opt-in full rotation-frame scrub (the literal "iPhone" effect) for machines with turntable photography.
- No new animation/3D dependency — built with `IntersectionObserver`, scroll position math, and CSS, consistent with how `LanguageSwitcher` and `FAQWithForm`'s accordion already handle motion in this codebase.
- Respect `prefers-reduced-motion: reduce` (this repo's Claude settings already set `prefersReducedMotion: true`).

## Schema changes — `src/collections/Machines/index.ts`

Add to `fields`:

```ts
{
  name: 'gallery',
  type: 'array',
  fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
},
{
  name: 'specs',
  type: 'array',
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'value', type: 'text', required: true },
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
{
  name: 'cta',
  type: 'group',
  fields: [
    { name: 'label', type: 'text', localized: true, defaultValue: 'Request a quote' },
    { name: 'url', type: 'text' },
  ],
},
{
  name: 'useRotationHero',
  type: 'checkbox',
  defaultValue: false,
  admin: { description: 'Show the full rotation-scrub hero instead of the default zoom+fade hero.' },
},
{
  name: 'rotationFrames',
  type: 'array',
  admin: {
    description: 'Ordered turntable frames (e.g. 60-120 images, 0–360°). Required when "useRotationHero" is checked.',
    condition: (_, siblingData) => Boolean(siblingData?.useRotationHero),
  },
  fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
},
```

After this change: run `pnpm generate:types` then `pnpm generate:importmap`, and create a migration (`pnpm payload migrate:create`).

## `/machines` listing page

New route: `src/app/(frontend)/[locale]/machines/page.tsx` (+ `Client.tsx` for the filter/grid interactivity, following the `FaqClient.tsx` pattern of a server page that fetches data and a client component for filter state).

- Server component fetches all `machines` docs (`payload.find`, `overrideAccess: false`, localized).
- Tag filter pills reuse the same pattern as `ak-faq-page__filters` / `bp-btn` — `?tag=` query param via `useRouter`/`useSearchParams`.
- Grid: CSS masonry via `grid-template-rows: masonry` is not broadly supported yet, so implement with a standard multi-column CSS grid where each tile's height is set inline from the image's natural aspect ratio (`aspect-ratio: var(--ratio)` computed from `media.width`/`media.height`, both already stored on Payload's `media` docs). This avoids needing a JS masonry library.
- Each tile fades/scales in (`opacity 0→1`, `translateY 12px→0`) via a shared `useInView` hook (thin wrapper around `IntersectionObserver`, new file `src/utilities/useInView.ts`) — same dependency-free approach already used elsewhere in this codebase.
- Each tile links to `/machines/${slug}`.

## `/machines/[slug]` detail page

New route: `src/app/(frontend)/[locale]/machines/[slug]/page.tsx`.

Server component fetches the one `Machine` doc by slug (404 via `notFound()` if missing), passes data to a client `MachineHero` component plus server-rendered sections below.

### Hero (client component, `src/components/MachineHero/`)

Shared scroll-progress hook: `useScrollProgress(wrapperRef)` — returns 0→1 based on how far the user has scrolled through a tall wrapper (`height: 300vh` desktop, shorter on mobile via CSS custom property), while an inner element is `position: sticky; top: 0; height: 100vh`. This hook is the single source of truth consumed by both hero variants below, so swapping treatments per machine is just a render branch, not a rewrite.

- **`useRotationHero: false` (default) → `ZoomFadeHero`**
  - Single `<Image>` (the `image` field) inside the sticky element.
  - `transform: scale(...)` interpolated 1 → 1.12 from progress, headline/eyebrow `opacity` interpolated 1 → 0 over the first ~40% of progress.
  - No preloading needed beyond the normal `next/image` hero treatment.

- **`useRotationHero: true` → `RotationScrubHero`**
  - `rotationFrames` images preloaded into an array of in-memory `Image()` objects on mount (show a simple skeleton/spinner until the first frame is ready).
  - A `<canvas>` fills the sticky element; on every `requestAnimationFrame` tied to scroll (throttled — only redraw when progress actually changed), draw `frames[Math.floor(progress * (frames.length - 1))]`.
  - Falls back to a static first-frame render (no scrubbing) when `prefers-reduced-motion: reduce` is set, or if `rotationFrames` is empty despite the flag being checked (defensive — treat as `ZoomFadeHero` using `image` instead).

Both variants release at the bottom of the pin wrapper into normal document flow — no remaining pinned elements once the hero scroll distance is consumed.

### Sections below the hero (server-rendered, no special motion budget needed beyond simple scroll-reveal)

1. **Sticky CTA bar** — appears once hero is scrolled past (`position: sticky; top: 0`), `bp-btn--primary` using `cta.label`/`cta.url` (falls back to a default mailto/contact link if empty).
2. **Specs** — two-column label/value rows from `specs`, each row fades in via the same `useInView` hook as the listing grid.
3. **Feature callouts** — one row per `features` entry, alternating image-left/image-right, fade+slide in on scroll.
4. **Gallery** — horizontal scroll-snap strip of `gallery` images (`scroll-snap-type: x mandatory`), no autoplay.

## Out of scope

- Real-time 3D/WebGL product viewer (explicitly rejected in favor of the simpler pre-rendered frame sequence, matching how Apple actually builds these pages).
- A general masonry/animation utility library — everything here uses primitives already idiomatic to this codebase (`IntersectionObserver`, CSS, plain canvas).
- Editing/seeding rotation frame photography itself — that's a content/photography task, not a code task. Machines without frames simply use the default `ZoomFadeHero`.

## Testing

- Unit (Vitest): `useScrollProgress` and `useInView` hooks — pure logic, mockable `IntersectionObserver`/scroll math.
- Integration: listing page renders tag-filtered results; detail page renders correct hero variant based on `useRotationHero`; falls back to `ZoomFadeHero` when `rotationFrames` is empty.
- Manual: verify `prefers-reduced-motion: reduce` disables scrubbing/scaling on both hero variants (Chrome DevTools emulation), verify on a real touch device that sticky/scroll-snap behaves as expected on iOS Safari (historically the trickiest engine for `position: sticky` + transform combos).
