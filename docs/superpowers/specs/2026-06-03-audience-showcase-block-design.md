# AudienceShowcase Block Design

**Date:** 2026-06-03  
**Status:** Approved

## Overview

A block for the "One platform. Four ways to show up with purpose." section on the home page. Displays a 2×2 (or 4-column) grid of image-overlay cards, each linking to an audience/solution page. Card content is pulled from page relationships — editors pick pages, not duplicate titles or images.

---

## Schema

```
AudienceShowcase
├── eyebrow     text     localized  optional
├── heading     text     localized  required
├── subheading  text     localized  optional
└── items       array    min 2, max 6
    ├── page    relation → pages    required — pulls title + hero.media automatically
    ├── label   text     localized  optional — overrides page title on card if set
    └── cta     text     localized  optional — CTA link label (e.g. "Explore brand programs")
```

The component reads `page.title` and `page.hero.media` (or `hero.backgroundVideo` thumbnail) from the related page to render the card. If no hero image is available, a dark placeholder fills the card.

**Depth:** `items.page` must be populated with `depth: 1` to get hero media. Use Payload Local API `depth` option in the block's data fetcher.

---

## Visual design

Each card:
- Full-bleed background image from the related page's hero
- Dark gradient overlay (bottom-up) for text legibility
- Bold title (white) centered or bottom-left
- Optional CTA link below title ("Explore X >") in accent color
- Rounded corners, subtle shadow

Block header:
- Eyebrow + heading + subheading centered above the grid

---

## Layout

### Desktop (≥ 1024px)
2 rows × 2 columns. Cards are tall (~400px). If 3 items: 1×3. If 4 items: 2×2.

### Tablet (640–1023px)
2 columns, cards shorter (~280px).

### Mobile (< 640px)
1 column, cards ~220px tall, full width.

> **Design task:** Produce mobile mockup before implementation — confirm card height, gradient strength, and whether CTA link is always visible or only on hover/tap.

---

## Analytics

- `data-ga-block` = `audience_showcase`
- `data-ga-section` = `blockName`
- Each card link: `data-ga-event="audience_card_click"` + `data-ga-label={page title}`

---

## Seed data

Home page — after TrustStrip, before CardGrid (Where It Works):

```ts
{
  blockType: 'audienceShowcase',
  blockName: 'Audience Showcase — Home',
  eyebrow: 'WHO IT\'S FOR',
  heading: 'One platform.\nFour ways to show up with purpose.',
  subheading: 'Amerikiosks helps partners create branded retail experiences that are placed with intention and operated end to end.',
  items: [
    { page: <brands-page-id>, cta: 'Explore brand programs' },
    { page: <venues-page-id>, cta: 'Explore venue revenue' },
    { page: <agencies-page-id>, cta: 'Explore activations' },
    { page: <emerging-page-id>, cta: 'Explore launch paths' },
  ]
}
```

> **Note:** The 4 audience sub-pages (For Brands, For Venues, For Agencies, For Emerging Brands) need to be seeded as separate `pages` entries before this block can reference them. This is a prerequisite for seeding this block.

---

## Dependencies

- Audience sub-pages seeded and available as page relationships
- `hero.media` depth population wired in the block's server component or page data fetcher

---

## Implementation order

1. Seed the 4 audience sub-pages (stub hero + title is enough)
2. Create `AudienceShowcase` Payload block config
3. Run `generate:types` + `generate:importmap`
4. Build server component with depth-1 page population
5. Style: image overlay cards, responsive grid
6. Update home seed to include block with page references
