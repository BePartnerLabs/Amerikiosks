# LowImpact Hero — Design Spec

**Date:** 2026-06-01  
**Status:** Approved

## Summary

A compact, left-aligned, text-only hero for secondary/utility pages (Case Studies, Contact, Why Amerikiosks, Where It Works, etc.). No image, no CTA. Same dark navy background as the other hero variants.

## Layout

Single column, left-aligned. Compact vertical padding — noticeably shorter than MediumImpact.

**Structure (top to bottom):**
1. Breadcrumb — small text, `rgba(255,255,255,0.45)` opacity
2. Red vertical accent bar (`--ak-accent`) + h1 side by side (flexbox row, bar is 4px wide, full heading height)
3. Subtitle paragraph — optional, comes from richText body paragraph
4. Tag pills — optional, same pill style as MediumImpact

## Fields

All fields already exist in `src/heros/config.ts`. Two changes needed:

| Field | Change |
|-------|--------|
| `breadcrumb` | Add `lowImpact` to the `admin.condition` allowlist |
| `tags` | Add `lowImpact` to the `admin.condition` allowlist |

No new Payload fields required.

## JSON-LD

A `BreadcrumbList` schema is injected via `<script type="application/ld+json">` inside the component when `breadcrumb` is present.

The breadcrumb string (e.g. `"Home / Case Studies"`) is split on `" / "` to produce `ListItem` entries. URLs are derived by slugifying each label and building a path (e.g. `Home` → `/`, `Case Studies` → `/case-studies`). The last item has no `item` URL (it is the current page).

## Styling

- **CSS class:** `ak-hero-page` (new — no conflict with existing heroes)
- **Background:** `var(--ak-header-bg)`
- **Accent bar:** `background: var(--ak-accent, #ec254e)`, `width: 4px`, `border-radius: 4px`
- **Heading:** same font/weight/size scale as MediumImpact (`clamp(1.75rem, 3vw + 1rem, 3rem)`, Poppins 800)
- **Padding:** `padding-block: var(--bp-space-10, 2.5rem)` — roughly 60% of MediumImpact's padding
- **Responsive:** no layout change on mobile — single column stacks naturally

## Files Affected

| File | Change |
|------|--------|
| `src/heros/LowImpact/index.tsx` | Full rewrite — add breadcrumb, accent bar, richText, tags, JSON-LD |
| `src/heros/LowImpact/low-impact.css` | New file — `ak-hero-page` styles |
| `src/heros/config.ts` | Add `lowImpact` condition to `breadcrumb` and `tags` fields |
| `src/CLAUDE.md` | Add MediumImpact row to status table (already done) + add LowImpact row |

## Out of Scope

- No CTA links
- No image or video
- No new Payload fields
- No seed data changes (pages already use `lowImpact` as the default type)
