# Machine Models

> A flat carousel of every machine model on the site — image, family name, up to three specs and a link per card — optionally narrowed to a single family.

## Business

*(Part 1 of [`docs/business/definition-of-done.md`](../../../docs/business/definition-of-done.md).)*

**Who is this for, and where are they?** **Cannot determine from the repo.**
The card content — a render, the family it belongs to, and three specs — is the
comparison view, which the DoD's own example ("a venue manager comparing
footprints") describes almost exactly. The component's doc comment also says the
family eyebrow exists so "*a visitor scrolling ten near-identical machines still
knows which line each belongs to*", which implies someone comparing within a
narrow set. But which of the three audiences Amerikiosks sells to this is
aimed at is not written down, and I will not invent it.

**What question does it answer?** "Which exact model do I want, and how do they
differ?" The JSON-LD comment states the GEO intent directly: search and
generative engines answering *"what hot-food kiosks exist"* cite an `ItemList`
of `Product`s, and this block is the only place on the site where every model
appears together (`Server.tsx:75-78`).

**What happens when it is empty?** It renders nothing (`Server.tsx:73`) — "*renders
nothing rather than an empty carousel*" is a named test. A model is dropped
unless it has both a `slug` and a resolvable family (`Server.tsx:70`). Per-card
degradation: no image hides the render, no family name hides the eyebrow, no
specs hides the `<dl>`. **A carousel with one item** — one of the DoD's explicit
failure cases — is not handled here; it is the shared `@/components/Carousel`'s
concern and is not tested from this block.

**What can the client change, and what can't they?** Authorable on the block:
the eyebrow, the heading (required), the per-card link text, and an optional
family filter. Derived: which models appear, their order (alphabetical by name,
hard-coded `sort: 'name'`), and the specs — the first three that have both a
label and a value, taken in the order they appear on the machine document, with
no way to choose which three from here. The previous/next button labels and the
fallback link text come from the `machines` i18n namespace, not from the CMS.

## Admin Location
- **Ruta:** `Pages → [page name] → Layout → Machine Models`
- **Tipo:** `Layout Block`

## Fields

| Campo | Tipo | Requerido | Localizado | Descripción |
|-------|------|-----------|------------|-------------|
| `eyebrow` | text | ✗ | ✓ | Small label above the heading. Default `The range`. |
| `heading` | text | ✓ | ✓ | Section heading. Default `Every model we build`. Also used as the carousel track's accessible label. |
| `ctaLabel` | text | ✗ | ✓ | Link text on each card. Default `See machine`. Falls back to the `machines.seeMachine` translation if cleared. |
| `family` | relationship → `machine-families` | ✗ | ✗ | Leave empty to show every model across all families (the usual case). Set one to narrow the block to a single line. |

## Variants

| Variante | Descripción |
|----------|-------------|
| All families (default) | `family` empty — every model on the site, flat, with each card labelled by its family. |
| Single family | `family` set — the same carousel narrowed to one line. |

The heading keeps the normal content margins while the rail bleeds off the right
edge (`content-start / full-width-end`), deliberately: an overflowing rail is
what signals there is more.

## Screenshots

Not taken — deferred per the Definition of Done.

## Quality Checklist

**Completeness: 22/30 (73%)**

> Denominator: the template says 21, its boxes count 30. See the report for this
> task.

### Accessibility AAA
- [ ] Contrast ratio minimum 7:1 — **cannot determine.** Spec labels use
      `--ak-color-muted` at small size on a card surface; needs measurement.
- [x] All interactive elements keyboard navigable — cards are real `<Link>`s,
      the carousel exposes prev/next buttons with translated labels, and the
      track is focusable and pans with the keyboard (`styles.css:96`).
- [x] ARIA labels on elements without visible text — carousel buttons get
      `labels.previous/next`, the track gets `trackLabel={heading}`, card images
      are `alt="" aria-hidden`.
- [x] Correct HTML landmarks — `<section aria-labelledby>` pointing at the
      heading, with the block's Payload `id` appended so multiple instances stay
      unique.
- [x] Focus visible on all interactive elements — `.ak-model-card:focus-visible`
      and `.ak-model-cards__carousel-btn:focus-visible` (`styles.css:164`, `:133`).

### HTML Semantics
- [x] Correct heading hierarchy — `<h2>` for the section, `<h3>` per card.
- [x] Semantic elements used — `section`, `ul`/`li` track, `dl`/`dt`/`dd` for
      specs, `a` per card.
- [x] Images have descriptive `alt` text — **ticked on the decorative reading.**
      Card renders are `alt="" aria-hidden="true"`, which is correct here
      because the card's `<h3>` already names the machine; a descriptive alt
      would double-announce it.

### Performance
- [x] Images use `next/image` with correct sizes — fixed `width={260} height={340}`,
      which is a stable intrinsic size and avoids CLS.
- [x] No Cumulative Layout Shift — cards have `min-height` and images have
      explicit dimensions.
- [x] Off-viewport content lazy loaded — no `priority` anywhere, so every card
      image is `next/image`-lazy; the rail's off-screen cards are not fetched
      up front.

### SEO / AIO / GEO
- [x] Content directly answers questions — model name, family, three concrete
      specs per card, all in server-rendered HTML.
- [x] Schema.org implemented (see section below).
- [x] Does not block indexing.

### Analytics (GA4)
- [x] GA4 events implemented — `data-ga-block="machineModels"`,
      `data-ga-event="machine_model_click"`, and `data-ga-label={model.name}` so
      individual models are distinguishable. This is the only one of the three
      machine blocks that sets a label.

### Design System (BPL DS) CSS
- [x] No `--_*` private DS variables used or overridden — own `--_models-*`
      locals; same ambiguity noted in MachineLineup's README.
- [x] `--bp-*` base tokens not redeclared inside components.
- [x] DS component markup copied verbatim — N/A, no DS component markup used
      (the carousel is the project's own `@/components/Carousel`).
- [x] All DS component customisation via `--<component>-*` class variables only — N/A.
- [x] `--ak-*` brand tokens not used directly in DS component CSS properties — no `.bp-*` rules.
- [x] Custom project components may use `--ak-*` and `--bp-*` directly — done.
- [x] No inline `style=""` attributes — none. The only block of the three that
      passes this cleanly.
- [x] State expressed via ARIA attributes / native pseudo-classes — no state
      classes in this block's markup. **Not verified inside `Carousel`**, which
      owns the disabled/scrolled state.
- [ ] Component breakpoints use `@container` — **cannot fully evaluate.** The
      file's sizing is driven by locals (`--_models-card-width`,
      `--_models-card-height`) and `min()`/`clamp()` rather than by breakpoints
      at all, so there is arguably nothing to convert; but the checklist asks
      which mechanism is used, and the answer here is "neither", which it has no
      box for.
- [x] Animations respect `prefers-reduced-motion` — `@media (prefers-reduced-motion: reduce)`
      at `styles.css:264`. The only one of the three that handles it in CSS.
- [x] DS grid used correctly — two `bp-content-grid` wrappers: `.content` for
      the heading, `.ak-model-cards__bleed` for the rail.

### Delivery
- [x] Unit tests added — `tests/unit/blocks/MachineModels.test.tsx`, 6 tests:
      per-card URL, family labelling, three-spec cap, family narrowing, empty
      state, JSON-LD.
- [x] All fields documented in table above.
- [ ] Screenshots up to date — none taken, deliberately.
- [x] Delivery notes written in non-technical language.

## GA4 Analytics

Same attribute mismatch as the other machine blocks: the template documents
`data-ga-section`, this block emits `data-ga-block`.

**Events:**

| Event name | Trigger | Block attribute | `data-ga-label` | Required | Implemented |
|------------|---------|-----------------|-----------------|----------|-------------|
| `machine_model_click` | Click on any model card | `data-ga-block="machineModels"` | model name | ✓ | ✓ |

No event is fired for carousel navigation (prev/next, swipe). Whether that is
wanted is a product decision nobody has recorded.

## Schema.org

- **Applicable type:** `ItemList` of `Product`
- **Implemented:** ✓ (`Server.tsx:80-103`)
- **Snippet:**

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Product",
        "name": "Model name",
        "url": "https://example.com/machines/family-slug/model-slug",
        "image": "https://example.com/media/model.png",
        "model": "Family name",
        "additionalProperty": [
          { "@type": "PropertyValue", "name": "Spec label", "value": "Spec value" }
        ]
      }
    }
  ]
}
```

`model` is used to carry the family name, which is a slightly loose fit for
schema.org's `model` property (it expects a `ProductModel` or the model
designation of *this* product, not its line). Flagged, not changed.

## Delivery Notes

> This is the row of machine cards you scroll sideways. Every machine on the
> site appears here automatically, in alphabetical order, each with its picture,
> the line it belongs to, up to three specifications, and a link to its page.
>
> **What you edit here:** the small label above the title ("The range"), the
> title itself (required), and the link text on each card ("See machine"). You
> can also pick one machine line to restrict the row to — leave that empty, which
> is the normal setting, and every machine shows.
>
> **What you cannot edit here:** which machines appear, their order, or which
> specifications are shown. The row shows the **first three** specifications
> listed on each machine's own page — so if you want different ones, reorder them
> there. A machine will not appear at all if it has no address (slug) or is not
> assigned to a family.
