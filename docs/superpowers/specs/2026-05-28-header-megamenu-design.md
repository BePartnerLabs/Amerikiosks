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

## Design System Tokens & Grid

### Grid (copy directly from DS)

Add `bp-content-grid` CSS to the project's global stylesheet:

```css
.bp-content-grid {
  display: grid;
  grid-template-columns:
    [full-width-start] minmax(var(--_padding-inline), 1fr)
    [breakout-start] minmax(0, var(--_breakout-size))
    [content-start] min(100% - (var(--_padding-inline) * 2), var(--_content-max-width))
    [content-end] minmax(0, var(--_breakout-size))
    [breakout-end] minmax(var(--_padding-inline), 1fr)
    [full-width-end];
  --padding-inline: clamp(1.25rem, 1vw + 1rem, 2rem);
  --content-max-width: 72rem;
  --breakout-max-width: 90rem;
  --_padding-inline: var(--padding-inline);
  --_content-max-width: var(--content-max-width);
  --_breakout-max-width: var(--breakout-max-width);
  --_breakout-size: calc((var(--_breakout-max-width) - var(--_content-max-width)) / 2);
}
.bp-content-grid > * { grid-column: content; }
.bp-content-grid > .breakout, .full-width > .breakout { grid-column: breakout; }
.bp-content-grid > .full-width, .full-width > .full-width { grid-column: full-width; }
```

The header bar uses `.full-width` zone. The mega menu panel spans `full-width`.

### Color tokens (override for Amerikiosks brand)

The DS primary (`--bp-primary`) maps to Amerikiosks red. Relevant tokens:

| Token | Value | Usage |
|-------|-------|-------|
| `--bp-primary` | brand red (set in project globals) | CTA button, accent line, chevron, item arrows |
| `--bp-color-bg` | `#f8f6f2` / `#16140f` | Page background |
| `--bp-color-text` | `#181715` / `#f2eee6` | Body text |
| `--bp-color-text-muted` | `#6b6760` / `#9e9a93` | Subtitle / description text |
| `--bp-color-bg-elevated` | `#ffffff` / `#242118` | Right mega menu panel background |
| `--bp-space-*` | 4px base scale | All spacing |
| `--bp-radius-md` | `0.625rem` | Panel / item border radius |

Header bar dark background is a custom navy token (e.g. `--ak-header-bg: #0b1120`) set in the project CSS, not from the DS base palette.

### BPL DS rules

- Only use the public CSS API (`--<component>-*` properties), never inline `style=""`
- ARIA attributes drive visual state (`aria-expanded`, `[hidden]`)
- JS writes ARIA; CSS reads it — no toggling style classes from JS
- Components use BEM: `bp-btn`, `bp-btn--primary`, etc.

---

## Out of Scope

- Mobile hamburger menu redesign (separate task)
- Search icon removal/repositioning
- Footer changes
