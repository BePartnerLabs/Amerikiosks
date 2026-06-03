# AudienceShowcase Block

**Status:** Approved

## Overview

The "One platform. Four ways to show up with purpose." section on the home page. Displays a 2×2 grid of image-overlay cards, each linking to an audience/solution sub-page. Card content is pulled from page relationships — editors pick pages, not duplicate titles or images.

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

The component reads `page.title` and `page.hero.media` from the related page to render the card background. If no hero image is available, a dark placeholder fills the card.

**Depth:** `items.page` must be populated with `depth: 1` to get hero media via the Payload Local API.

---

## Visual design

**Each card:**
- Full-bleed background image from the related page's hero
- Dark gradient overlay (bottom-up) for text legibility
- Bold title (white)
- Optional CTA link below title ("Explore X >") in accent color
- Rounded corners, subtle shadow

**Block header:**
- Eyebrow + heading + subheading centered above the grid

---

## Responsive layout

| Breakpoint | Layout | Card height |
|---|---|---|
| ≥ 1024px | 2 × 2 grid | ~400px |
| 640–1023px | 2 col | ~280px |
| < 640px | 1 col, full width | ~220px |

> **Open design task:** Produce mobile mockup before implementation — confirm card height, gradient strength, and whether the CTA link is always visible or only on tap.

---

## Analytics

- `data-ga-block` = `audience_showcase`
- `data-ga-section` = `blockName`
- Each card link: `data-ga-event="audience_card_click"` + `data-ga-label={page title}`

---

## Dependencies

- 4 audience sub-pages seeded (For Brands, For Venues, For Agencies, For Emerging Brands) — each needs at least a slug + title + hero image
- `hero.media` depth-1 population wired in the block's server component

---

## Seed data (home page)

Positioned after TrustStrip, before CardGrid (Where It Works):

```ts
{
  blockType: 'audienceShowcase',
  blockName: 'Audience Showcase — Home',
  eyebrow: "WHO IT'S FOR",
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

---

## Implementation order

1. Seed the 4 audience sub-pages (stub hero + title is enough)
2. Create `AudienceShowcase` Payload block config
3. Run `generate:types` + `generate:importmap`
4. Build server component with depth-1 page population
5. Style: image overlay cards, responsive grid
6. Update home seed to include block with page references
