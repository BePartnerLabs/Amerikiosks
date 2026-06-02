# Trust Strip — Design Spec

**Date:** 2026-06-01  
**Status:** Approved

---

## Overview

A "Trusted by Leading Brands and Venues" section with an infinite CSS marquee logo carousel. Logos are managed via a new Payload CMS `partners` collection. The section is added to the layout builder as a `TrustStrip` block with editable heading fields.

---

## Data Model

### `Partners` Collection (`src/collections/Partners.ts`)

| Field   | Type          | Required | Notes                        |
|---------|---------------|----------|------------------------------|
| `name`  | text          | yes      | Partner/brand name           |
| `logo`  | upload (Media)| yes      | Brand logo image             |
| `order` | number        | no       | Lower number = shown first, default 0 |

- Default sort in admin: `order` ascending
- Editors manage display order by typing numbers (1, 2, 3…)
- No drag-and-drop — intentionally simple

---

## Block Config

### `TrustStrip` Block (`src/blocks/TrustStrip/`)

| Field    | Type   | Required | Notes                                  |
|----------|--------|----------|----------------------------------------|
| `eyebrow`| text   | no       | Small label above heading, e.g. "WHO WE WORK WITH" |
| `heading`| text   | yes      | Main heading, e.g. "Trusted by Leading Brands and Venues" |
| `limit`  | number | no       | Max partners to show; 0 or empty = show all |

- Added to the layout builder alongside existing blocks
- Queries `partners` collection via Payload Local API (server component, no HTTP roundtrip)
- Sorted by `order` ascending, respects `limit`

---

## Frontend Component

### Carousel Behavior

- **Infinite CSS marquee** — list is duplicated in the DOM, translated left with `@keyframes` + `animation: scroll linear infinite`
- **Speed:** ~40s duration — slow, ambient, subtle
- **Pause on hover:** `animation-play-state: paused` on the track container via CSS `:hover`
- No JavaScript required, no external library

### Logo Card

- White background, rounded corners (`border-radius: 12px`), subtle box shadow
- Logo image centered, `alt` = partner `name`
- Fixed card width, logo constrained with `object-fit: contain`

### Layout

- Eyebrow (small uppercase, brand color) centered above heading
- Heading (`h2`) centered
- Carousel track below, full width, overflow hidden
- Edge fade via CSS `mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent)`
- Responsive: same layout on mobile, cards scale down slightly

---

## File Structure

```
src/
├── collections/
│   └── Partners.ts               # New Payload collection
├── blocks/
│   └── TrustStrip/
│       ├── config.ts             # Block field config
│       └── Component.tsx         # Server component, fetches + renders
```

Migration required after adding the `Partners` collection:
```bash
pnpm payload migrate:create
pnpm payload migrate
pnpm generate:types
pnpm generate:importmap
```

---

## Out of Scope

- Arrow navigation (infinite marquee replaces this)
- "Important" flag / weight filtering (order number is sufficient)
- Drag-and-drop reordering in admin
