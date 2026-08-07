# Machine Lineup

> A pinned, dark, scroll-driven scene that walks through every machine family in turn — one machine and one characteristic per family — and links to the family page currently on screen.

## Business

*(Part 1 of [`docs/business/definition-of-done.md`](../../../docs/business/definition-of-done.md). Answered from the code and its comments; the ones I could not source are marked.)*

**Who is this for, and where are they?** **Cannot determine from the repo.** The
scene shows all families at equal weight with no specs, no footprint and no
price, which reads as an audience that does not yet know the line exists —
plausibly a brand evaluating the whole range near the top of a machines landing
page. But nothing in the repo states the intended audience: there is no brief,
no analytics target, and `docs/business/` contains only the Definition of Done.
This is an invented answer if I give one, so I am not giving one — it needs the
client or the person who specced the block.

**What question does it answer?** "What kinds of machines does Amerikiosks
make?" Each step pairs a family name with its featured highlight, and the
`CollectionPage` JSON-LD makes the same answer machine-readable — deliberately,
because it replaces a deleted `machines/page.tsx` route that used to emit the
only complete list of family URLs on the site (`Server.tsx:72-77`).

**What happens when it is empty?** It renders nothing. `Server.tsx:70` returns
`null` when no family survives filtering, and a family is filtered out unless it
has both a `slug` and a usable `thumbnail` (`Server.tsx:68`). A family with no
highlights still renders — its `featured` is `null` and the step shows only the
family name. A family whose editor never flagged a `featured` highlight falls
back to the first one rather than dropping out (`Server.tsx:34`), which is
tested.

**What can the client change, and what can't they?** The client controls only
`intro` on the block itself. Everything else is derived from the
`machine-families` collection: which families appear, their order (alphabetical
by `name`, hard-coded `sort: 'name'`), the images, and the line of copy each one
leads with. There is no way to hide a family, reorder them, or override the
featured highlight from this block — that is done by editing the family
document.

## Admin Location
- **Ruta:** `Pages → [page name] → Layout → Machine Lineup`
- **Tipo:** `Layout Block`

## Fields

| Campo | Tipo | Requerido | Localizado | Descripción |
|-------|------|-----------|------------|-------------|
| `intro` | text | ✗ | ✓ | Line shown before the first family while the scene enters. Hidden again once scroll progress passes 2%. Leave empty to start on the first family. |

Everything else the block shows comes from `machine-families` (name, slug,
`thumbnail`, `hoverThumbnail`, `highlights.items[]`) and is not editable here.

## Variants

| Variante | Descripción |
|----------|-------------|
| Pinned scene (default) | Sticky full-height dark stage; scroll drives the machine's rise and turn and steps the copy through the families. |
| `ak-lineup--static` | Automatic fallback under `prefers-reduced-motion: reduce` — a plain stacked `<ul>` of every family with image, name and highlight. Not selectable by the editor. |

## Screenshots

Not taken. The Definition of Done explicitly defers these: *"**Screenshots at
creation time.** The template asks for desktop and mobile captures, and they go
stale faster than anything else in the document. Take them when the block is
marked finished for client delivery."* This block is not marked finished.

## Quality Checklist

**Completeness: 21/30 (70%)**

> The template header says `0/21` and the Definition of Done says *"The
> denominator is 21"*, but the template's own boxes count 30 (5 + 3 + 3 + 3 + 1 +
> 11 + 4). Scoring 21/21 here would be 100% with nine unticked boxes. I have used
> the real count. See the notes at the end of this task.

### Accessibility AAA
- [ ] Contrast ratio minimum 7:1 — **cannot determine.** Muted copy is
      `--brand-color-palette-steel-100` on `navy-950` through a gradient; 7:1
      needs a measurement against the rendered background, not a token read.
- [x] All interactive elements keyboard navigable — the only control is the
      family `<Link>`; the scene itself is scroll-driven, and the reduced-motion
      fallback is a plain list.
- [x] ARIA labels on elements without visible text — off-step units and the
      turn image are `aria-hidden`, the progress ticks are `aria-hidden`.
- [x] Correct HTML landmarks — `<section>` present (`Component.tsx:119`, and
      `:71` in the static branch).
- [x] Focus visible on all interactive elements — `.ak-lineup__link:focus-visible`
      (`styles.css:168`).

### HTML Semantics
- [ ] Correct heading hierarchy — **the block emits one `<h2>` per family, all
      at once, and they are all in the DOM simultaneously.** Whether that is a
      skipped level depends on the page it is dropped into; five sibling `h2`s
      describing highlights rather than sections is at best odd for a screen
      reader walking the outline.
- [x] Semantic elements used — `section`, `ul`/`li` in the static branch, `h2`, `p`.
- [ ] Images have descriptive `alt` text — the front render uses
      `alt={family.name}`, which describes the family, not the image; the turn
      render is `alt=""` + `aria-hidden` (correct, it is decorative).

### Performance
- [x] Images use `next/image` with correct sizes — `sizes="(max-width: 720px) 60vw, 340px"`, `priority` on the first family only.
- [ ] No Cumulative Layout Shift — **cannot determine statically.** The stage is
      `fill`-based inside a sticky pin, which should be stable, but CLS is a
      measured metric.
- [ ] Off-viewport content lazy loaded — **the opposite is true by design.** All
      families are mounted at once and toggled with a class; only the first gets
      `priority`, the rest are lazy by `next/image` default but they are all
      inside the viewport-height pin.

### SEO / AIO / GEO
- [x] Content directly answers questions — family name + featured
      characteristic per step; the `CollectionPage` `hasPart` names and links
      every family.
- [x] Schema.org implemented (see section below).
- [x] Does not block indexing — server-rendered content, no `noindex`.

### Analytics (GA4)
- [x] GA4 events implemented — `data-ga-block="machineLineup"` on the section,
      `data-ga-event="machine_family_click"` on the link. **But see the
      `data-ga-section` mismatch noted below.**

### Design System (BPL DS) CSS
- [x] No `--_*` private DS variables used or overridden — the block declares its
      own `--_lineup-*` locals. **This item is ambiguous:** taken literally the
      block uses `--_*` variables everywhere; read as "does not touch the DS's
      private variables" it passes. Ticked on the second reading, which is what
      `validate-ds-tokens.mjs` actually implements (`--_*` is its *approved*
      channel, per Rule 1).
- [x] `--bp-*` base tokens not redeclared inside components — only read, with fallbacks.
- [x] DS component markup copied verbatim — N/A, no DS component used.
- [x] All DS component customisation via `--<component>-*` — N/A.
- [x] `--ak-*` not used directly in DS component CSS properties — no `.bp-*` selectors in this file.
- [x] Custom project components may use `--ak-*` and `--bp-*` directly — done.
- [ ] No inline `style=""` attributes — **fails literally.** `Component.tsx:123`
      and `:135` set `style={{ '--ak-lineup-progress': ... }}`. These are CSS
      custom properties written every animation frame, which is the only way to
      get scroll progress into CSS; the checklist item does not distinguish this
      from a hardcoded `style="color: red"`.
- [ ] State expressed via ARIA attributes / native pseudo-classes — **fails.**
      Active state is `ak-lineup__unit--on`, `ak-lineup__step--on`,
      `ak-lineup__tick--on`. `aria-hidden` is used alongside on the units, so
      the accessibility outcome is right, but the visual state is class-driven.
- [x] Component breakpoints use `@container`; full-viewport layouts use `@media` —
      `@media (min-width: 720px)` (`styles.css:222`), correct for a full-viewport pinned scene.
- [x] Animations respect `prefers-reduced-motion` — handled in JS
      (`Component.tsx:42`) with a whole alternative render, not in CSS.
- [x] DS grid used correctly — **this block is explicitly exempt** from
      `bp-content-grid` in `scripts/validate-block-markup.mjs`, with the reason
      recorded there ("full-bleed pinned scene… a content grid would inset the
      render and break the sticky geometry").

### Delivery
- [x] Unit tests added — `tests/unit/blocks/MachineLineup.test.tsx`, 7 tests
      covering featured pick, fallback, image choice, empty state, all-families
      render, the link, and the JSON-LD.
- [x] All fields documented in table above.
- [ ] Screenshots up to date — none taken, deliberately (see above).
- [x] Delivery notes written in non-technical language.

## GA4 Analytics

**Mismatch with the template.** The template documents the attribute contract as
`data-ga-event` + `data-ga-section` + `data-ga-label`, and its events table has a
`data-ga-section` column. This block emits **`data-ga-block="machineLineup"`** on
the `<section>` and no `data-ga-section` anywhere —
`validate-block-markup.mjs` requires `data-ga-block`, and the Definition of Done
lists "`data-ga-block` by `validate-block-markup.mjs`" as the enforcement. Nine
older blocks do emit `data-ga-section={blockName}`. I could not determine from
the repo whether `GAListener` reads one, the other, or both, so the table below
records what is in the markup.

**Events:**

| Event name | Trigger | Block attribute | Required | Implemented |
|------------|---------|-----------------|----------|-------------|
| `machine_family_click` | Click on the family link in the pin | `data-ga-block="machineLineup"` | ✓ | ✓ |

The `data-ga-label` is not set; the link's `innerText` (the family name) is the
fallback, per the template.

## Schema.org

- **Applicable type:** `CollectionPage`
- **Implemented:** ✓ (`Server.tsx:78-89`)
- **Snippet:**

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Model Lines",
  "url": "https://example.com/machines",
  "hasPart": [
    { "@type": "Thing", "name": "Family name", "description": "Featured highlight title", "url": "https://example.com/machines/family-slug" }
  ]
}
```

Note the `name` is the hardcoded English string `'Model Lines'` even on the
Spanish locale (`Server.tsx:81`).

## Delivery Notes

> This is the tall dark section where a machine stays on screen and turns while
> you scroll, and the text next to it changes from one machine line to the next.
>
> You cannot choose which lines appear here or in what order — every machine
> family on the site appears automatically, in alphabetical order. The picture
> and the line of text for each one come from that family's own page in the
> admin (its main image, its turn image, and the characteristic marked as
> "featured"; if none is marked, the first one is used).
>
> The only thing you edit on this block is the **intro** — a short line shown
> right at the start, before the first machine. Leave it empty and the section
> starts straight on the first family.
>
> A family will not appear here at all if it has no image or no address (slug).
> If a visitor has "reduce motion" turned on in their device settings, they see
> the same content as a simple stacked list instead of the moving scene.
