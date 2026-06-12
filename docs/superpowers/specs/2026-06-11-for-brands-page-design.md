# For Brands Page — Design Spec

**Date:** 2026-06-11  
**Status:** Approved  
**Scope:** New collections, new blocks, For Brands page seed, /faq page, future /machines/[slug] detail pages

---

## Overview

The "For Brands" page (`/who-its-for/for-brands`) is the first of four audience sub-pages (Brands, Venues, Agencies, Emerging Brands). It targets brand teams evaluating Amerikiosks as a retail presence channel.

Breadcrumb: `Home / Who it's for / For brands`

The page is built entirely from Payload layout-builder blocks. Three new blocks and two new collections are required. A standalone `/faq` page also ships as part of this scope.

---

## New Collections

### `Machines`

Represents a vending machine format. Powers the `FormatsGrid` block and future `/machines/[slug]` detail pages.

```
Machines
├── name          text       localized   required
├── slug          text       unique       auto-generated from name
├── tagline       text       localized   optional — shown on cards
├── image         upload     → media     required — main card/hero image
├── tags          array                  drives block-level filtering
│   └── label     text       required
├── layout        blocks     localized   layout builder — future detail page content
└── _status       draft/publish
```

- Each machine links to `/machines/[slug]`
- `tags` examples: `full-size`, `compact`, `campaign`, `premium`
- JSON-LD: `Product` schema on detail pages, `ItemList` on listing blocks

### `FAQItems`

Reusable FAQ entries. Power the `FAQWithForm` block and the `/faq` page.

```
FAQItems
├── question      text       localized   required
├── answer        richText   localized   required
├── weight        number                 default 10, sort descending — seed in steps of 10
└── tags          array                  drives filtering in blocks and /faq
    └── label     text       required
```

- Published only (no drafts)
- `tags` examples: `brands`, `venues`, `replenishment`, `branding`, `pricing`
- `weight` seeded 10, 20, 30… — editors bump weight to surface items without renumbering
- JSON-LD: contributes to `FAQPage` schema on `/faq` and `/who-its-for/for-brands`

---

## New Blocks

### `FormatsGrid`

Displays a grid of machine format cards. Editors either pick specific machines or filter by tag.

```
FormatsGrid
├── eyebrow       text       localized   optional
├── heading       text       localized   required
├── subheading    text       localized   optional
├── filterTags    array                  optional — if set, renders Machines matching these tags
│   └── tag       text
└── items         array                  optional — explicit machine picks (overrides filterTags)
    └── machine   relation   → Machines  required
```

**Render:**
- 4-col grid desktop / 2-col tablet / 1-col mobile
- Each card: `bp-card bp-card--interactive` wrapped in `<a href="/machines/[slug]">`
- Image fills card top, machine name + tagline below
- `alt` = machine name on all images

**DS components:** `bp-card`, `bp-card--interactive`

**GA4:**
- `data-ga-block="formats_grid"` on block root
- `data-ga-section={blockName}` on block root
- `data-ga-event="machine_card_click"` + `data-ga-label={machine.name}` on each card link

**JSON-LD:** `ItemList` with `ListItem` per visible machine

---

### `ProcessSteps`

Numbered step sequence with optional bottom CTA. Reusable across all audience pages.

```
ProcessSteps
├── eyebrow       text       localized   optional
├── heading       text       localized   required
├── subheading    text       localized   optional
├── steps         array      min 2, max 8
│   ├── title     text       localized   required
│   └── body      richText   localized   required
└── cta           linkGroup  optional    — bottom CTA button
```

**Render:**
- Steps rendered as `<ol>` with `<li>` per step
- Step number auto-generated from array index (1-based), displayed as large accent numeral
- Each `<li>` gets `aria-label="Step N: {title}"`
- CTA button below step list using existing `bp-btn` DS component

**GA4:**
- `data-ga-block="process_steps"` on block root
- `data-ga-section={blockName}` on block root
- `data-ga-event="cta_click"` + `data-ga-label={cta.label}` on CTA button

---

### `FAQWithForm`

Two-column block: FAQ accordion (left ~55%) + lead capture form (right ~45%).

```
FAQWithForm
├── heading       text       localized   required
├── subheading    text       localized   optional
├── filterTags    array      required    — pulls FAQItems matching these tags, sorted by weight desc
│   └── tag       text
└── form          group
    ├── heading   text       localized   required
    └── odooEndpoint  text              — Odoo API URL for form submission
```

**FAQ side:**
- Queries `FAQItems` via Payload Local API filtered by `filterTags`, sorted by `weight` desc
- Renders using `bp-accordion` with native `<details>`/`<summary>` — no JS needed
- Exclusive group: `name="faq-{blockId}"` on each `<details>` for single-open behavior (Chrome 120+, Firefox 130+, Safari 17.2+)

**Form side (React Hook Form → Odoo):**
- Fields: Brand name, Work email, Product category, Target venues, Desired timeline, Placement goal, Message/notes
- All inputs use `bp-input` DS primitives with `<label>`, `aria-required`, `aria-describedby` for errors
- On submit: POST to `odooEndpoint` via fetch; success/error feedback via `bp-alert` or `bp-toast`
- Client component (`"use client"`) — RHF handles validation and submission state

**Accessibility:**
- `bp-accordion`: native `<details>`/`<summary>` = WCAG AA, no extra ARIA needed
- Form: all inputs labeled, `aria-required="true"`, error messages linked via `aria-describedby`

**GA4:**
- `data-ga-block="faq_with_form"` on block root
- `data-ga-section={blockName}` on block root
- `data-ga-event="faq_expand"` + `data-ga-label={question}` on each `<summary>` (click)
- `data-ga-event="faq_filter"` + `data-ga-label={tag}` on tag filter buttons (if added later)
- `data-ga-event="brand_form_submit"` on successful Odoo POST
- `data-ga-event="brand_form_error"` + `data-ga-label={errorMessage}` on failed POST

**JSON-LD:** `FAQPage` schema generated from visible FAQ items (question + answer pairs)

---

## Page: `/who-its-for/for-brands`

Payload `pages` entry at slug `who-its-for/for-brands`.

### Hero — MediumImpact

```
hero.type = "mediumImpact"
hero.breadcrumb = "Home / Who it's for / For brands"
hero.richText = h1 "For brands ready to show up with intent." + paragraph "Launch branded retail experiences in premium venues without building stores, hiring staff, or managing daily operations."
hero.links = [
  { label: "Start a Brand Program", url: "/contact", appearance: "primary" },
  { label: "See case studies", url: "/insights", appearance: "ghost" }
]
hero.tags = ["Brand-controlled", "Fully managed", "Built to learn"]
hero.media = <kiosk venue image>
```

### Block sequence

1. `InsightsShowcase` — eyebrow "REAL BRAND MOMENTS", heading "Real brand moments, built to sell."
2. `CardGrid` (pillar variant) — eyebrow "FOR BRANDS", heading "One program. Four decisions your team controls.", 4 pillar cards: Placement / Expression / Operations / Learning
3. `FormatsGrid` — eyebrow "FORMATS", heading "Formats built around your brand moment.", filterTags: ["full-size","compact","campaign","premium"]
4. `ProcessSteps` — eyebrow "HOW IT WORKS", heading "From first opportunity to daily operation.", 5 steps, CTA "Start a Brand Program"
5. `FAQWithForm` — eyebrow "START A PROGRAM", heading "Answers before your brand shows up.", filterTags: ["brands"], form heading "Start a brand program"

### JSON-LD on this page

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "name": "For Brands — Amerikiosks",
      "description": "Launch branded retail experiences in premium venues...",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "/" },
          { "@type": "ListItem", "position": 2, "name": "Who it's for", "item": "/who-its-for" },
          { "@type": "ListItem", "position": 3, "name": "For Brands" }
        ]
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [/* FAQ items with filterTag "brands" */]
    }
  ]
}
```

---

## Page: `/faq`

New frontend route at `src/app/(frontend)/[locale]/faq/page.tsx`.

**Behavior:**
- Fetches all published `FAQItems` via Payload Local API, sorted by `weight` desc
- Tag filter UI at top: `bp-badge`/`bp-btn` toggle group, `aria-pressed` on active filters
- Filter is client-side (all items fetched server-side, JS filters display)
- Active tag = `?tag=brands` query param for shareability / deep linking
- `data-ga-block="faq_page"` + `data-ga-event="faq_filter"` on filter buttons

**JSON-LD:** Full `FAQPage` schema with all published items

---

## Cross-cutting: BPL DS

| Element | DS Component | Notes |
|---|---|---|
| FAQ accordion | `bp-accordion` | `<details>`/`<summary>`, native a11y |
| Machine/format cards | `bp-card bp-card--interactive` | Wrapped in `<a>` |
| Process step cards | `bp-card` | Non-interactive |
| Breadcrumb | `bp-breadcrumb` | `<nav aria-label="Breadcrumb">` |
| Form inputs | `bp-input` | With `<label>` + `aria-describedby` |
| FAQ/machine tag filters | `bp-btn` toggle group | `aria-pressed` state |
| CTA buttons | `bp-btn` | Existing patterns |

**CSS variable rules:**
- `--ak-*` brand tokens declared in `frontend.css` for project-level values
- Level 2 overrides (`--card-*`, `--btn-*`) only where DS defaults differ from design
- No component tokens on `:root`

---

## Cross-cutting: Accessibility (WCAG AA)

- All images: meaningful `alt` text (machine name, context description)
- Breadcrumb: `<nav aria-label="Breadcrumb">`, `aria-current="page"` on last item
- FAQ accordion: native `<details>`/`<summary>` — Enter/Space toggle, screen reader native
- FAQ filter buttons: `aria-pressed="true/false"` toggled by JS
- Process steps: `<ol>` + `<li aria-label="Step N: {title}">`
- Form: every input has `<label>`, `aria-required="true"`, errors via `aria-describedby`
- Color contrast: verify all text on brand red and dark backgrounds meets 4.5:1

---

## Cross-cutting: GA4 Event Tagging

All blocks follow the `data-ga-block` / `data-ga-section` / `data-ga-event` / `data-ga-label` pattern established in `AudienceShowcase`.

| Block | Event | Label |
|---|---|---|
| `formats_grid` | `machine_card_click` | machine name |
| `process_steps` | `cta_click` | CTA label |
| `faq_with_form` | `faq_expand` | question text |
| `faq_with_form` | `faq_filter` | tag name |
| `faq_with_form` | `brand_form_submit` | — |
| `faq_with_form` | `brand_form_error` | error message |
| `faq_page` | `faq_filter` | tag name |

---

## Dependencies & Sequencing

1. `Machines` collection + seed data (4 formats)
2. `FAQItems` collection + seed data (4–6 brand FAQ items, weight 10/20/30…)
3. `FormatsGrid` block (depends on Machines)
4. `ProcessSteps` block
5. `FAQWithForm` block (depends on FAQItems collection)
6. For Brands page seed (depends on all blocks)
7. `/faq` page route (depends on FAQItems collection)
8. Run `generate:types` + `generate:importmap` after each schema change
9. Run `payload migrate:create` + `payload migrate` after collection additions
