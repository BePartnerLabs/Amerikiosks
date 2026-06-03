# Scroll Entrance Animations

**Status:** Draft

## Overview

Subtle fade-up entrance animations applied to block content as it enters the viewport. "Subtle but notable" — visible on first impression, not distracting on re-scroll.

---

## Approach

**IntersectionObserver + CSS class toggle.** A small shared hook (`useInView`) observes each animated element, adds an `is-visible` class when it enters the viewport, and CSS handles all motion. No external dependency, SSR-safe, under 1 KB overhead.

Rejected alternatives:
- CSS `@starting-style` — triggers on DOM insertion, not scroll; no Safari stable support as of mid-2026
- AOS — ~6 KB, `data-aos` pattern conflicts with BEM conventions
- Motion (Framer) — ~18 KB, overkill for simple entrance effects

---

## Animation Style

**Primary effect: fade-up**

- Start: `opacity: 0`, `transform: translateY(24px)`
- End: `opacity: 1`, `transform: translateY(0)`
- Duration: `500ms`
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-expo)

**Stagger for grid items** (CardGrid cards, TrustStrip logos):
- Container does not animate — only children
- `transition-delay` via `nth-child`: `0ms`, `80ms`, `160ms`, `240ms` (capped at 4 items to avoid long waits)

Headings and CTA groups animate as a single unit (no stagger).

---

## Scope

Animate **individual child elements within blocks, not entire `<section>` wrappers.** Each block opts in at the component level by applying an `animate-on-scroll` utility class to its primary content regions. This avoids layout shift and keeps animation logic in the block components, not in `RenderBlocks`.

---

## Implementation Touch Points

| File | Change |
|---|---|
| `src/components/hooks/useInView.ts` | New hook — `IntersectionObserver`, threshold `0.12`, `rootMargin: "0px 0px -40px 0px"`, `triggerOnce: true` |
| `src/app/(frontend)/globals.css` | `.animate-on-scroll` base state + `.is-visible` end state + stagger delays |
| Block components (CardGrid, TrustStrip, CallToAction, etc.) | Each adds `useInView`, applies `is-visible` to content regions |
| `src/blocks/RenderBlocks.tsx` | No changes — animation is opt-in per block |

---

## `prefers-reduced-motion`

All animation declarations are wrapped in `@media (prefers-reduced-motion: no-preference)`. Outside that query, `.animate-on-scroll` has no opacity or transform override — content is immediately visible at full opacity. The `useInView` hook still fires harmlessly.

---

## Performance

- Animate only `opacity` and `transform` — both GPU-composited, no layout/paint triggers
- Do NOT animate `height`, `margin`, `top`, or `clip-path`
- `will-change: transform, opacity` applied only while element is entering; removed once `is-visible` is set
- Max stagger spread: ~320ms total

---

## Open Design Tasks

- Confirm which blocks get per-child stagger vs. single-unit animation
- Decide whether AudienceShowcase image cards animate as a unit or stagger (likely stagger — 4 cards, same as CardGrid)
- HighImpactHero: likely no entrance animation (above the fold, loads immediately)
