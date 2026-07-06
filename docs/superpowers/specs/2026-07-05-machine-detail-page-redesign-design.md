# Machine detail page (`/machines/[slug]`) redesign

## Context

The `/machines/[slug]` detail page (`src/app/(frontend)/[locale]/machines/[slug]/page.tsx`) currently renders a hero (`MachineHero` — either a scroll-pinned `ZoomFadeHero` or a 360° `RotationScrubHero`), a CTA bar, a `SpecRow` list driven by `machine.specs` (label/value pairs), and a `FeatureRow` list driven by `machine.features` (heading/body/image, alternating layout).

A new Figma reference (`Machine detail (1).png`) shows a different page: a static hero with an eyebrow, title, subtitle, and two CTA buttons (brochure download + Contact Sales) above a product image; an icon-based "Why [Model]" benefits carousel; a two-column plain-text capabilities list with a small product-photo carousel; a labeled technical-dimensions diagram; a "explore more models" section; and a bottom CTA banner. This redesign brings the collection schema and the page in line with that reference.

`specs` and `features` are used only by this page (confirmed via repo-wide grep — no other component reads `machine.specs`/`machine.features`) and are superseded by the new `capabilities`/`highlights` fields, so they are removed rather than kept alongside the new fields. `layout` (an empty, unused `blocks` field) is also removed — a Lexical-blocks approach for this page's sections was considered and explicitly rejected in favor of fixed structured fields, since every machine's detail page should render with identical section layout/styling (a product spec-sheet, not an editor-customizable marketing page).

## Goals

1. Update the `Machines` collection schema: remove `layout`, `specs`, `features`; add `heroEyebrow`, `brochure`, `highlights`, `capabilities`, `dimensions`, `dimensionDiagrams`.
2. Redesign the hero: static (non-scroll-linked) eyebrow/title/subtitle/buttons block, followed by the existing scroll-scale image treatment applied only to the image (not the text).
3. Replace `SpecRow`/`FeatureRow` with new `Highlights` and `Capabilities` sections matching the new fields.
4. Add a `Dimensions` section rendering the labeled technical diagrams.
5. Add "explore more models" and a bottom CTA banner to the page — checking the current `page.tsx`, neither section exists there today (an earlier draft of this spec incorrectly assumed they did). Both are new additions, built from existing pieces: "explore more models" reuses `MachineCard` (from `src/blocks/MachinesListing/MachineCard.tsx`) to render other machines; the bottom banner reuses the existing `CallToActionBlock` component (`src/blocks/CallToAction/Component.tsx`), rendered directly with the machine's name interpolated into the heading and its `cta` field for the link — the same component the `/machines` listing page uses via the Payload blocks system, just invoked directly here since this page is a hardcoded route, not a CMS blocks-driven `Pages` document.

## Out of scope

- The "Contact Sales" button opening a drawer/modal form — for this iteration it is a plain link (to `cta.url`, falling back to `/contact`). The drawer interaction is an explicitly deferred future iteration.
- Migrating existing `specs`/`features` content into the new fields — these fields are dropped. (Confirm with the team whether any seeded machine currently has data in `specs`/`features` before merging the migration; if so, decide case-by-case whether to hand-migrate that specific machine's content into `capabilities`/`highlights` before the columns are dropped.)
- Any change to the `/machines` listing page or `MachinesListing` block (already shipped, unaffected by this work).
- A generic icon-picker admin UI for `highlights.items[].icon` — the field is a plain text field (an icon identifier string, e.g. a Material Symbols icon name, matching the pattern already used elsewhere in this codebase for icons — see `.material-symbols-outlined` usage in `LowImpactHero`).

## Schema changes — `src/collections/Machines/index.ts`

Remove these three fields entirely:

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
// ...
{
  name: 'layout',
  type: 'blocks',
  localized: true,
  blocks: [],
},
```

Add, after the existing `tagline` field (so `heroEyebrow` sits next to the other hero-text fields in the admin UI):

```ts
{
  name: 'heroEyebrow',
  type: 'text',
  localized: true,
  admin: { description: 'Small kicker above the hero title, e.g. "NEXT GENERATION"' },
},
```

Add, after the existing `cta` field:

```ts
{
  name: 'brochure',
  type: 'upload',
  relationTo: 'media',
  admin: { description: 'Optional downloadable brochure (PDF). Hides the "Download brochure" hero button when empty.' },
},
{
  name: 'highlights',
  type: 'group',
  fields: [
    { name: 'eyebrow', type: 'text', localized: true, admin: { description: 'e.g. "WHY GAMMA 13"' } },
    { name: 'heading', type: 'text', localized: true, admin: { description: 'e.g. "Engineered for performance. Designed for any location."' } },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'icon', type: 'text', admin: { description: 'Material Symbols icon name, e.g. "inventory_2"' } },
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
    { name: 'heading', type: 'text', localized: true, admin: { description: 'e.g. "Built for scale. Designed for ease."' } },
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

Unchanged: `name`, `slug`, `tagline`, `image`, `tags`, `gallery`, `cta`, `useRotationHero`, `rotationFrames`.

After this change: run `pnpm generate:types`, `pnpm generate:importmap`, and create a migration (`pnpm payload migrate:create`) — this drops two columns/tables (`specs`, `features`) and the unused `layout` blocks tables, and adds the new columns/tables above.

## Hero redesign — `src/components/MachineHero/`

### Current structure (for reference)

`MachineHero` (`index.tsx`) picks between `ZoomFadeHero` (default) and `RotationScrubHero` (`useRotationHero` + `rotationFrames`), passing `eyebrow={machine.tagline}` and `heading={machine.name}` to whichever is rendered. `ZoomFadeHero` renders eyebrow+heading *overlaid on top of* a full-bleed image inside a `position: sticky` wrapper; both the image (scale) and the text (opacity) animate together as the user scrolls, driven by `useScrollProgress`.

### New structure

`MachineHero` passes an additional `subtitle` (from `machine.tagline`) and a `links` array (brochure + contact-sales) to whichever hero variant renders, and `eyebrow` now comes from the new `machine.heroEyebrow` field instead of `machine.tagline`:

```tsx
// src/components/MachineHero/index.tsx
export const MachineHero: React.FC<Props> = ({ machine }) => {
  const image = typeof machine.image === 'object' ? (machine.image as Media) : null
  const imageUrl = getMediaUrl(image?.url)
  const brochure = typeof machine.brochure === 'object' ? (machine.brochure as Media) : null

  const frameUrls = /* unchanged rotation-frames logic */

  const heroText = {
    eyebrow: machine.heroEyebrow,
    heading: machine.name,
    subtitle: machine.tagline,
    brochureUrl: brochure?.url ?? null,
    ctaLabel: machine.cta?.label || 'Contact Sales',
    ctaUrl: machine.cta?.url || '/contact',
  }

  if (frameUrls.length > 0) {
    return <RotationScrubHero frameUrls={frameUrls} alt={machine.name} {...heroText} />
  }
  return <ZoomFadeHero imageUrl={imageUrl} alt={machine.name} {...heroText} />
}
```

`ZoomFadeHero` splits into a static text block (not inside the scroll-scale wrapper, doesn't fade) followed by the pinned/scaling image:

```tsx
// src/components/MachineHero/ZoomFadeHero.tsx
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
            <a href={brochureUrl} className="bp-btn bp-btn--dark" download>
              Download brochure
            </a>
          )}
          <a href={ctaUrl} className="bp-btn bp-btn--outline">
            {ctaLabel}
          </a>
        </div>
      </div>

      <div ref={wrapperRef} className="ak-machine-hero__image-pin-wrapper">
        <div className="ak-machine-hero__sticky">
          <div className="ak-machine-hero__image-wrap" style={{ transform: `scale(${scale})` }}>
            <Image src={imageUrl} alt={alt} fill priority className="ak-machine-hero__image" sizes="100vw" />
          </div>
        </div>
      </div>
    </div>
  )
}
```

`RotationScrubHero` receives the same new props (`subtitle`, `brochureUrl`, `ctaLabel`, `ctaUrl`) and renders the identical static text block above its existing canvas-scrub image area — the scrub/rotation behavior itself is unchanged, only the surrounding text/buttons markup is added, mirroring `ZoomFadeHero`'s split.

"Download brochure" is only rendered when `brochureUrl` is non-null (per the `brochure` field's optionality) — otherwise only the "Contact Sales" link renders.

## New sections — replacing `SpecRow`/`FeatureRow`

New components live alongside the existing `FeatureRow`/`SpecRow` files' location (`src/app/(frontend)/[locale]/machines/[slug]/`), replacing them:

### `Highlights.tsx`

Renders `machine.highlights.eyebrow` + `machine.highlights.heading`, then a horizontally-scrollable row of cards (icon + title + description) from `machine.highlights.items`. No new interactive JS beyond a simple CSS scroll-snap row (matching this codebase's established no-dependency approach to carousels, e.g. the gallery strip pattern already used elsewhere) — the mockup's dot indicators are decorative pagination hints, not required to be functionally wired to scroll position for this iteration.

### `Capabilities.tsx`

Renders `machine.capabilities.heading`, then `machine.capabilities.items` split into two columns (CSS multi-column or a simple even/odd split into two lists), alongside a small image carousel using the first 3 images from `machine.gallery` (same scroll-snap pattern as `Highlights`).

### `Dimensions.tsx`

Renders a "DIMENSIONS" label (static string, not a field — consistent with the capabilities heading decision that per-machine-varying creative copy gets a field, but this one section label doesn't vary), the `dimensionDiagrams` images each with their `label` caption, and the `dimensions.height`/`width`/depth values annotated per the mockup's arrows-and-numbers treatment, plus the fixed caption "Dimensions are approximate and may vary."

### Page assembly — `page.tsx`

Replace the `machine.specs`/`machine.features` conditional blocks with:

```tsx
{machine.highlights?.items && machine.highlights.items.length > 0 && (
  <Highlights highlights={machine.highlights} />
)}
{machine.capabilities?.items && machine.capabilities.items.length > 0 && (
  <Capabilities capabilities={machine.capabilities} gallery={machine.gallery} />
)}
{machine.dimensionDiagrams && machine.dimensionDiagrams.length > 0 && (
  <Dimensions diagrams={machine.dimensionDiagrams} dimensions={machine.dimensions} />
)}
```

### `RelatedMachines.tsx` and the bottom CTA banner

`RelatedMachines.tsx` (new) fetches up to 3 other published machines (excluding the current one, `payload.find` with `where: { slug: { not_equals: slug } }`, `limit: 3`) and renders them with the existing `MachineCard` component (`src/blocks/MachinesListing/MachineCard.tsx`) in a grid — reusing that card's exact markup/styling rather than inventing a new one.

The bottom CTA banner renders `CallToActionBlock` (`src/blocks/CallToAction/Component.tsx`) directly in `page.tsx`, with a `richText` heading built at render time (e.g. "Ready to place {machine.name} in your location?") and a link built from `machine.cta` (falling back to a default "Contact Sales" / `/contact` when empty, matching the hero's existing fallback pattern).

## Testing

- Unit: `MachineHero`/`ZoomFadeHero` — renders eyebrow/heading/subtitle; renders both buttons when `brochureUrl` is set; renders only the Contact Sales link when `brochureUrl` is null.
- Unit: `Highlights`, `Capabilities`, `Dimensions` — render from given props; each section is omitted entirely when its data is empty (matching the page assembly's conditional rendering).
- Integration: none required beyond the above — no new Payload query paths are introduced (the existing `getMachine` query in `page.tsx` already fetches the whole document; new fields are included automatically).

## Migration/rollback note

Dropping `specs`/`features`/`layout` is destructive at the database level (columns and their child tables are removed). Before running the migration against any environment with real content, check whether any seeded machine has non-empty `specs`/`features` and decide whether to hand-port that specific content into `highlights`/`capabilities` first — this spec does not include an automated data-migration step, per the Out of Scope section above.
