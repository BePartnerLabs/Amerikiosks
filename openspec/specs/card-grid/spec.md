# CardGrid Block

**Status:** Approved  
**Replaces:** `ValueProps` block (slug: `valueProps` → `cardGrid`)

## Overview

A flexible card grid block used across the site to present structured lists of features, locations, process steps, or value propositions. Three layout variants cover all current uses without duplicating block logic.

## Existing implementation gap

The current `ValueProps` block only implements the `compact` variant visually. The `icon` and `pillar` variants need to be built. The rename + migration must happen before adding variants so there is no double schema work.

---

## Schema

```
CardGrid
├── variant        select  required  "compact" | "icon" | "pillar"
├── eyebrow        text    localized  optional — small label above heading
├── heading        text    localized  required
├── subheading     text    localized  optional — shown below heading in pillar variant
├── link           group   optional   — CTA button shown below cards in pillar variant
│   ├── label      text
│   └── url / relation
└── items          array   localized  min 1, max 8
    ├── eyebrow    text    optional   — card-level label (used in pillar variant)
    ├── icon       text    optional   — icon name or SVG key (used in icon variant)
    ├── title      text    required
    ├── body       richText
    └── link       group   optional   — per-card CTA (used in icon variant "Explore X >")
```

Migration note: existing `valueProps` rows keep all data; only the `block_type` column value changes to `cardGrid`. Items fields are backward-compatible — new fields (`eyebrow`, `icon`, card `link`) default null.

---

## Variants

### `compact` — current home dark strip

> "The right moment does more."

- **Background:** dark (`--ak-header-bg`)
- **Layout:** 2-column grid — heading fills left column (~25%), cards fill right (~75%)
- **Cards:** 4 columns, accent top border, no icon, no card link
- **Heading:** large, white, left-aligned

**Fix needed on existing implementation:**
- Add `eyebrow` field rendering above heading
- Verify mobile breakpoint drops to 1 col below 480px (currently stops at 2 col)

---

### `icon` — "Where It Works"

> "Places where attention, need, and brand presence meet."

- **Background:** white / light
- **Layout:** heading + optional eyebrow centered at top, cards below in 4-column grid
- **Cards:** white card, rounded, border, icon at top, title, body, optional link ("Explore X >") with chevron
- **Heading:** large, dark, centered

---

### `pillar` — "Why Amerikiosks"

> "Built to feel premium. Operated to stay that way."

- **Background:** white / light
- **Layout:** eyebrow + heading + subheading centered at top, cards in 4-column grid, optional CTA button centered below cards
- **Cards:** white card, rounded, light border, card-level eyebrow label (e.g. "STRATEGY"), bold title, body — no icon, no per-card link
- **CTA button:** optional, centered below card row, outline style

---

## Layout Summary

| Variant | Background | Heading position | Card icon | Card link | Block CTA |
|---|---|---|---|---|---|
| `compact` | dark | left column | ✗ | ✗ | ✗ |
| `icon` | light | top, centered | ✓ | ✓ | ✗ |
| `pillar` | light | top, centered | ✗ | ✗ | ✓ |

---

## Responsive behavior

| Breakpoint | compact cards | icon/pillar cards |
|---|---|---|
| > 1024px | 4 col | 4 col |
| 640–1024px | 2 col | 2 col |
| < 640px | 1 col | 1 col |

Heading column in `compact` collapses above cards at < 640px.

> **Open design task:** Produce mobile mockups for all 3 variants at 375px — confirm heading collapse, card stacking, CTA button width, and icon sizing before building responsive styles.

---

## Analytics

- `data-ga-block` = `card_grid` (all variants)
- `data-ga-section` = `blockName` (instance label)
- Per-card links: `data-ga-event="card_cta_click"` + `data-ga-section` inherited from block

---

## Seed instances

| Page | Variant | blockName |
|---|---|---|
| Home | `compact` | `"Card Grid — Home Value Props"` |
| Where It Works | `icon` | `"Card Grid — Where It Works"` |
| Why Amerikiosks | `pillar` | `"Card Grid — Why Amerikiosks"` |

---

## Implementation order

1. Create migration: rename `valueProps` → `cardGrid` in DB
2. Rename `ValueProps/` → `CardGrid/` (component, config, styles)
3. Add `variant`, `eyebrow`, `subheading`, `link`, card `eyebrow`, `icon`, card `link` fields
4. Implement `icon` and `pillar` variant rendering + styles
5. Fix `compact` mobile breakpoint and add eyebrow rendering
6. Update seeds
