# Header Mega Menu — Design Spec

**Date:** 2026-05-28  
**Project:** Amerikiosks website (Next.js + Payload CMS 3)

---

## Goal

Replace the current flat header navigation with:
1. A dark navy header bar (logo left · nav center · CTA button right)
2. CMS-managed mega menus for nav items that opt in — two-column dropdown panel with a dark left panel and a white right panel

---

## Visual Design

### Header bar
- Background: dark navy (`--bp-surface-inverse` or `bg-[#0b1120]`)
- Logo: left-aligned, white variant
- Nav items: centered, white text, hover underline or opacity shift
- Items with mega menus show a chevron-down icon
- CTA button: right-aligned, red (`bp-btn bp-btn--primary`), label "Start a Partnership"
- Full-width, sticky at top, `z-50`

### Mega menu panel
Triggered on hover (desktop) / click (mobile). Full viewport-width panel below the header.

**Left dark panel (~30% width):**
- Red horizontal accent line (top)
- Uppercase category label (e.g. "SOLUTIONS")
- Large bold headline (e.g. "Choose the kind of presence you want to build.")
- Body description text
- Dark navy background matching header

**Right white panel (~70% width):**
- Panel title (e.g. "What are you trying to create?")
- Panel subtitle text
- 4 items in a 2-column grid, each:
  - Icon image (from Media upload)
  - Item title + red chevron-right
  - Item description
  - Entire item is a link

---

## Payload CMS Schema Changes

### Header global — extend `navItems` array

Each nav item gains optional mega menu fields:

```
navItems[]:
  link: { ...existing... }
  hasMegaMenu: checkbox (default: false)
  megaMenu (group, shown when hasMegaMenu = true):
    panelLabel:       text        — e.g. "SOLUTIONS"
    panelHeadline:    text        — large bold left-panel headline
    panelDescription: textarea    — left-panel body text
    rightTitle:       text        — right panel heading
    rightSubtitle:    textarea    — right panel subheading
    items: array (max 4):
      icon:        upload → Media relation
      title:       text
      description: textarea
      link:        group { type, url, reference }
```

After schema change: run `pnpm generate:types` then `pnpm generate:importmap`.  
Create and run a DB migration: `pnpm payload migrate:create` → `pnpm payload migrate`.

---

## Component Architecture

### Files changed / created

| File | Action |
|------|--------|
| `src/globals/Header.ts` | Extend schema with megaMenu fields |
| `src/Header/Component.client.tsx` | Dark styling, sticky, CTA button |
| `src/Header/Nav/index.tsx` | Mega menu trigger logic (hover + keyboard) |
| `src/Header/Nav/MegaMenu.tsx` | New — mega menu panel UI |
| `src/payload-types.ts` | Regenerated (auto) |

### Interaction model

- **Desktop hover:** `onMouseEnter` on nav item opens mega menu; `onMouseLeave` closes after 150ms debounce (prevents flicker when moving to panel)
- **Keyboard:** `Enter`/`Space` toggles; `Escape` closes; focus trap inside open panel
- **Mobile:** chevron tap toggles accordion-style inline expansion (no overlay panel)
- **Click outside:** closes open mega menu

### State

Managed locally in `HeaderNav` with `useState<string | null>(openMenu)` keyed by nav item id. No global state needed.

---

## Design System Tokens

Use `--bp-*` token vocabulary throughout. Custom properties only via stylesheet classes, never inline `style=""`. ARIA attributes drive visual state (e.g. `aria-expanded="true"` on trigger, `[hidden]` on panel).

---

## Out of Scope

- Mobile hamburger menu redesign (separate task)
- Search icon removal/repositioning
- Footer changes
