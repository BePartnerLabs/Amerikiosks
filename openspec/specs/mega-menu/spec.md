# Mega Menu Spec

## Overview

Dark navy sticky header with CMS-managed mega menu dropdowns. Nav items opt in via `hasMegaMenu` checkbox in Payload. Desktop hover triggers a full-viewport-width panel; mobile uses accordion expansion.

## Payload Schema

`Header` global — each `navItems[]` entry gains:

| Field | Type | Notes |
|-------|------|-------|
| `hasMegaMenu` | checkbox | default false |
| `megaMenu.panelLabel` | text | e.g. "SOLUTIONS" |
| `megaMenu.panelHeadline` | text | large bold left-panel headline |
| `megaMenu.panelDescription` | textarea | left-panel body text |
| `megaMenu.rightTitle` | text | right panel heading |
| `megaMenu.rightSubtitle` | textarea | right panel subheading |
| `megaMenu.items[]` | array (max 4) | icon (Media), title, description, link |

After schema changes: `pnpm generate:types` → `pnpm generate:importmap` → `pnpm payload migrate:create` → `pnpm payload migrate`.

## Component Files

| File | Responsibility |
|------|---------------|
| `src/globals/Header.ts` | Schema — megaMenu fields on navItems |
| `src/Header/Component.client.tsx` | Dark header bar, sticky, CTA button |
| `src/Header/Nav/index.tsx` | Hover/keyboard trigger logic |
| `src/Header/Nav/MegaMenu.tsx` | Panel UI (two-column: dark left, white right) |

## Interaction Model

- **Desktop:** `onMouseEnter` opens; `onMouseLeave` closes after 150ms debounce
- **Keyboard:** Enter/Space toggles; Escape closes; focus trap inside panel
- **Mobile:** chevron tap toggles accordion inline (no overlay)
- **Click outside:** closes open menu
- **State:** `useState<string | null>(openMenu)` in `HeaderNav`, keyed by nav item id

## Design Tokens

| Token | Usage |
|-------|-------|
| `--ak-header-bg: #0b1120` | Header bar + left panel background |
| `--bp-primary` | CTA button, accent line, chevrons |
| `--bp-color-bg-elevated` | Right panel background |
| `--bp-color-text-muted` | Description text |

Header uses `.bp-content-grid` with `.full-width` zone. Mega panel spans `full-width`.

## Status

Design approved 2026-05-28. Implementation pending.
