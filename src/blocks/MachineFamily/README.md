# Machine Family

> One machine family shown in full: its name, description, link to the family page, and a mosaic of up to four characteristic tiles plus a derived model count. One block per family.

## Business

*(Part 1 of [`docs/business/definition-of-done.md`](../../../docs/business/definition-of-done.md).)*

**Who is this for, and where are they?** **Cannot determine from the repo.**
The block's own doc comment says what it is *not* ("the visitor picks nothing —
that is the point"), and the content it surfaces is characteristics plus a model
count, which suits someone already narrowing between lines rather than
discovering them. But the audience is not written down anywhere I could find,
and the DoD warns that *"If the answer is 'everyone', the block has no job"* —
so this needs an answer from the client, not from me.

**What question does it answer?** "What is the *X* line, and what makes it
different?" The heading falls back through `highlights.heading` → `tagline` →
`name`, the body is the family `description`, and the tiles are the family's
highlights. The model count answers "how many models are in this line?" — and
answers it correctly, because it is counted, not typed.

**What happens when it is empty?** It renders nothing, in two places: no
`family.slug` (`Server.tsx:44`), and no highlights at all (`Server.tsx:81`).
The latter is tested. Partial data degrades rather than breaks: no
`description` hides the paragraph, no `ctaLabel` uses the family name as the
link text, a highlight with no `image` falls back to a rotating pool of the
family's renders and its machines' shots (`Component.tsx:111-114`), and the
count tile disappears when `modelCount` is 0 even if `showModelCount` is on.
**Only the first four highlights past the lead are used** — `rest.slice(0, 2)`
plus `rest[2]`; a family with eight highlights silently shows four. That is a
too-much-data case the DoD asks about ("*The block renders correctly with no
data and with too much data*") and it is not covered by a test.

**What can the client change, and what can't they?** Authorable on the block:
which family, and the three eyebrow labels. Derived and must stay derived: the
model count — the config field description says so out loud ("*The number is
counted from the machines collection, never typed, so it cannot fall out of
sync*"), which matches the DoD's own example verbatim. Everything else (name,
headline, description, CTA label, images, highlights) is authored on the
`machine-families` document, not here.

## Admin Location
- **Ruta:** `Pages → [page name] → Layout → Machine Family`
- **Tipo:** `Layout Block`

## Fields

| Campo | Tipo | Requerido | Localizado | Descripción |
|-------|------|-----------|------------|-------------|
| `family` | relationship → `machine-families` | ✓ | ✗ | Which family this section shows. Name, description, characteristics and the link all come from that document. |
| `tileEyebrow` | text | ✗ | ✓ | Small label above each secondary characteristic tile. Default `Feature`. |
| `leadEyebrow` | text | ✗ | ✓ | Label for the large first tile. Default `Main highlight`. |
| `showModelCount` | checkbox | ✗ | ✗ | Shows how many models the line has. Default on. The number is derived from the machines collection. |
| `countEyebrow` | text | ✗ | ✓ | Label on the count tile. Default `Models in line`. Only visible in the admin when `showModelCount` is on. |

## Variants

| Variante | Descripción |
|----------|-------------|
| Standard | Head row (eyebrow, heading, description, CTA button) over a tile mosaic: one lead tile, an optional wide count tile, up to two standard tiles, and one full-width tile. |

There is no editor-selectable variant. The mosaic shape changes only with how
many highlights the family has.

## Screenshots

Not taken — deferred per the Definition of Done ("*Take them when the block is
marked finished for client delivery, not while it is still moving*").

## Quality Checklist

**Completeness: 18/30 (60%)**

> Denominator: the template says 21, its boxes count 30. See the note in
> MachineLineup's README and the report for this task.

### Accessibility AAA
- [ ] Contrast ratio minimum 7:1 — **cannot determine.** Light surface with
      `--ak-color-muted` body copy; needs measurement.
- [x] All interactive elements keyboard navigable — the only control is the
      `.bp-btn` link. The tiles have `onPointerMove` only, no click behaviour,
      so nothing is mouse-only.
- [x] ARIA labels on elements without visible text — every tile image is
      `alt="" aria-hidden="true"` (decorative by design, they are filler
      renders).
- [x] Correct HTML landmarks — `<section>` (`Component.tsx:117`).
- [ ] Focus visible on all interactive elements — **cannot determine from this
      block.** `styles.css` defines no `:focus-visible`; the link is a DS
      `.bp-btn` and presumably inherits the DS focus ring, but that is an
      assumption about `ds.bepartnerlabs.com`, not something this repo shows.

### HTML Semantics
- [x] Correct heading hierarchy — one `<h2>` for the family, `<h3>` per tile.
- [x] Semantic elements used — `section`, `h2`, `h3`, `p`, `a`.
- [x] Images have descriptive `alt` text — all images here are decorative and
      correctly marked as such, so descriptive alt would be wrong.

### Performance
- [x] Images use `next/image` with correct sizes — `fill` + `sizes="320px"`.
- [ ] No Cumulative Layout Shift — **cannot determine statically.** The tiles
      animate in via `IntersectionObserver` + a class; whether that shifts
      layout depends on the CSS transform used, which is a visual check.
- [x] Off-viewport content lazy loaded — `next/image` default lazy, and the
      reveal is `IntersectionObserver`-gated.

### SEO / AIO / GEO
- [x] Content directly answers questions — named characteristics with
      descriptions, plus a concrete model count.
- [ ] Schema.org implemented — **not implemented.** No JSON-LD in this block,
      unlike its two siblings. See the section below.
- [x] Does not block indexing.

### Analytics (GA4)
- [x] GA4 events implemented — `data-ga-block="machineFamily"` +
      `data-ga-event="machine_family_click"`. Same `data-ga-section` mismatch as
      the other machine blocks (see below).

### Design System (BPL DS) CSS
- [x] No `--_*` private DS variables used or overridden — declares its own
      `--_fam-*` locals; same ambiguity as noted in MachineLineup's README.
- [x] `--bp-*` base tokens not redeclared inside components.
- [ ] DS component markup copied verbatim from `ds.bepartnerlabs.com/components/<name>/` —
      **cannot evaluate offline.** The block uses `.bp-btn .bp-btn--secondary`
      and `.bp-content-grid`; verifying "verbatim" requires fetching the DS site,
      which I cannot do from the code alone.
- [x] All DS component customisation via `--<component>-*` class variables only —
      the block adds no rules to `.bp-btn` at all, so nothing is customised.
- [x] `--ak-*` brand tokens not used directly in DS component CSS properties — no `.bp-*` rules.
- [x] Custom project components may use `--ak-*` and `--bp-*` directly — done.
- [ ] No inline `style=""` attributes — **fails in spirit.** No `style` attribute
      in JSX, but `Component.tsx:54-55` writes `--ak-famtile-x/y` onto the
      element with `style.setProperty` on every pointer move, which produces an
      inline style at runtime. A checklist read against the source passes this;
      a checklist read against the DOM fails it.
- [x] State expressed via ARIA attributes / native pseudo-classes — **borderline
      tick.** `ak-famtile--in` is a reveal-animation class, not a UI state a
      user can act on, and there is no `.is-active`/`.hidden`.
- [ ] Component breakpoints use `@container`; full-viewport layouts use `@media` —
      **fails.** This is a normal in-page section, not a hero/header/footer, and
      it uses `@media (min-width: 860px)` and `@media (min-width: 900px)`
      (`styles.css:34`, `:79`).
- [x] Animations respect `prefers-reduced-motion` — checked in JS
      (`Component.tsx:36`); reduced motion reveals every tile immediately. Note
      the pointer-glow is not gated, but it is pointer-driven, not autonomous.
- [x] DS grid used correctly — `bp-content-grid` > `.content`, no competing
      `max-width`.

### Delivery
- [x] Unit tests added — `tests/unit/blocks/MachineFamily.test.tsx`, 5 tests:
      count scoping, empty state, CTA label, count toggle, image fallback.
- [x] All fields documented in table above.
- [ ] Screenshots up to date — none taken, deliberately.
- [x] Delivery notes written in non-technical language.

## GA4 Analytics

Same attribute mismatch as MachineLineup: the template documents
`data-ga-section`, this block emits `data-ga-block`, and
`validate-block-markup.mjs` requires `data-ga-block`.

**Events:**

| Event name | Trigger | Block attribute | Required | Implemented |
|------------|---------|-----------------|----------|-------------|
| `machine_family_click` | Click on the family CTA button | `data-ga-block="machineFamily"` | ✓ | ✓ |

Note the same event name is emitted by MachineLineup. There is no
`data-ga-label` on either, so the two are distinguishable only by the section's
`data-ga-block` — whether GA4 receives that attribute is the open question above.

## Schema.org

- **Applicable type:** `ProductGroup` (or `ItemList` of the family's models) —
  this block knows the family, its description, and its exact model count, all of
  which map cleanly.
- **Implemented:** ✗
- **Snippet:** none — not implemented. The two sibling blocks
  (`MachineLineup` → `CollectionPage`, `MachineModels` → `ItemList` of
  `Product`) both emit structured data; this one is the gap. Whether that is
  deliberate (to avoid emitting overlapping graphs on the same page) is not
  recorded anywhere in the code, and I am not going to guess a snippet into
  existence.

## Delivery Notes

> This section presents one machine line in full: its name, its description, a
> button through to its page, and a mosaic of tiles showing what makes it
> different. Use one of these blocks per line you want to feature — the section
> never lets the visitor switch lines, so if you want three lines, add three
> blocks.
>
> **What you edit here:** which family to show, and the three small labels above
> the tiles ("Feature", "Main highlight", "Models in line"). You can also turn
> the model-count tile off.
>
> **What you edit on the family's own page:** the name, the headline, the
> description, the button text, the images, and the characteristics. Changes
> there show up here automatically.
>
> **The model count is not typed by anyone.** It is counted from the machines in
> that family, so it is always right — add a machine and the number goes up by
> itself.
>
> Two things worth knowing: the section shows **at most five characteristics**
> (one big one plus four), so extra ones on the family page will not appear here;
> and if a characteristic has no image of its own, the section fills the tile
> with one of the family's or its machines' pictures.
