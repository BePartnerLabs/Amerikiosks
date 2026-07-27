# Family highlights — unified boxed card grid

## Context

`FamilyHighlights` (`src/app/(frontend)/[locale]/machines/[family]/FamilyHighlights.tsx`) renders the "highlights" section on machine family pages (e.g. `/machines/alpha`). It currently branches on whether any item has an image:

- **Has images:** large alternating horizontal cards reusing `ak-insights-showcase__featured` (image left/right, reversing per row).
- **No images:** a thin flex strip (`ak-machine-detail__highlights-strip`) with vertical divider borders between items — small bold title, muted description below.

We want a single, consistent presentation inspired by Apple's "advantages" grid (iPhone 17e example): boxed tiles in a grid, each with its own rounded background, an optional contained image, a bold accent-colored stat/title line, and a muted description.

## Design

### Layout

Replace the `hasImages` branch entirely. Every item in `highlights.items` renders through one card component in a CSS grid:

- 3 columns on desktop (`≥64rem`)
- 2 columns on tablet (`≥40rem`)
- 1 column on mobile

### Card anatomy

Per item, in order:

1. **Image (optional):** if `item.image` is set, render it centered/contained within the card (fixed max height, `object-fit: contain` or `cover` depending on asset shape) — not full-bleed, not alternating sides.
2. **Title:** bold, larger type, accent-colored (`--ak-accent` or an accent gradient), styled as the "stat" line — keeps today's field semantics (title = the bold line, rendered first, same as the current strip).
3. **Description (optional):** smaller, muted caption text below the title.

### What's removed

- The `hasImages` boolean branch and its two render paths.
- Reuse of `ak-insights-showcase__featured` / `--reverse` alternating layout for this section.
- The `ak-machine-detail__highlights-strip` divider-line styling (still used elsewhere on the machine detail page — not touched).

### Styling

New rules added to `src/app/(frontend)/[locale]/machines/machines-catalog.css` alongside the existing `.ak-family-detail__highlights*` rules, replacing `.ak-family-detail__highlight-cards` (and no longer referencing `ak-machine-detail__highlights-strip` for this section). Follows the project's 3-level CSS variable convention (`--bp-*` base tokens, `--ak-*` brand tokens, `--family-highlights-*` level-2 overrides only where DS defaults don't fit).

### Data model

No schema change — `highlights.items` already has `title`, `description`, and `image` fields (`MachineFamily['highlights']`). This is a presentation-only change.

### Out of scope

- No changes to the machine-detail (`[slug]`) page's own `Highlights.tsx` / `ak-machine-detail__highlights-strip`, which is a separate component/section.
- No new admin fields.
