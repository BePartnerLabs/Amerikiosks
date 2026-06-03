# CardGrid variants + AudienceShowcase — Mobile Design

**Date:** 2026-06-03  
**Status:** Approved  
**Closes open design tasks in:** `openspec/specs/card-grid/spec.md`, `openspec/specs/audience-showcase/spec.md`

---

## CardGrid — Mobile decisions (375px)

### compact variant
- Heading collapses to full width above the card stack (no side-by-side columns)
- Eyebrow rendered above heading in the same collapsed header block
- Cards: 1-col stack, accent top border, no icon, no link

### icon variant
- Eyebrow + heading centered, full width
- Cards: 1-col stack, 36px icon (accent-tinted bg), title, body, "Explore X ›" CTA link always visible
- CTA link visible on all breakpoints (not tap-only)

### pillar variant
- Eyebrow + heading + subheading centered, full width
- Cards: 1-col stack, ALL-CAPS eyebrow label in accent color, bold title, body — no icon, no per-card link
- CTA button: centered below cards, full block width on mobile

### Breakpoints (all variants)

| Breakpoint | compact cards | icon/pillar cards |
|---|---|---|
| ≥ 1024px | 4 col | 4 col |
| 640–1023px | 2 col | 2 col |
| < 640px | 1 col | 1 col |

Compact heading column: side-by-side with cards ≥ 640px, collapses above cards below 640px.

---

## AudienceShowcase — Mobile decisions (375px)

- Card height: 220px on mobile (< 640px), 280px at 640–1023px, 400px ≥ 1024px
- Gradient: bottom-up dark overlay (`rgba(0,0,0,0.65)` → transparent at ~55%)
- CTA link visibility:
  - **Mobile (< 640px):** hidden — full card is tappable, title only shown
  - **Desktop (≥ 1024px):** "Explore X ›" always visible below title in accent color
  - **Tablet (640–1023px):** same as desktop (always visible)
- Rounded corners (10px), subtle shadow

### Analytics
- `data-ga-event="audience_card_click"` on the card `<a>` wrapper
- `data-ga-label` = page title (pulled from related page)

---

## Implementation order

1. CardGrid compact: add eyebrow rendering, fix mobile breakpoint
2. CardGrid icon + pillar: implement variant rendering + responsive styles
3. AudienceShowcase: Payload block config → generate:types → server component → styles → seed
