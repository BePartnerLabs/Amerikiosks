# Mobile Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a mobile header with a hamburger button and bottom sheet navigation that replaces the desktop nav below 48rem, with swipe-to-sub-panel for mega menu items.

**Architecture:** A new `MobileMenu` client component manages open/panel state. The bottom sheet slides up from the bottom using CSS transitions — no JS animation libraries. The main panel shows a 2-col grid of nav items; tapping a mega menu item transitions to a sub-panel showing its 4 items. Desktop nav is hidden via `@container` query; mobile hamburger shown instead. CSS lives in `src/Header/mobile-menu.css`.

**Tech Stack:** React 19, Next.js 16 App Router, CSS custom properties (`--bp-*` / `--ak-*`), no external animation libs.

---

## Files

| File | Action | Responsibility |
|---|---|---|
| `src/Header/MobileMenu/index.tsx` | Create | Mobile hamburger + bottom sheet + panel state |
| `src/Header/MobileMenu/mobile-menu.css` | Create | All mobile menu CSS |
| `src/Header/Component.client.tsx` | Modify | Import and render MobileMenu alongside desktop nav |
| `src/Header/header.css` | Modify | Hide desktop nav on mobile via container query |

---

## Task 1: Create MobileMenu component

**Files:**
- Create: `src/Header/MobileMenu/index.tsx`
- Create: `src/Header/MobileMenu/mobile-menu.css`

- [ ] **Step 1: Create `src/Header/MobileMenu/index.tsx`**

```tsx
'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import type { Header } from '@/payload-types'
import './mobile-menu.css'

type NavItem = NonNullable<Header['navItems']>[number]
type MegaItem = NonNullable<NonNullable<NavItem['megaMenu']>['items']>[number]

interface MobileMenuProps {
  data: Header
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ data }) => {
  const [open, setOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<NavItem | null>(null)
  const navItems = data?.navItems || []

  // Close on route change
  useEffect(() => {
    if (open) {
      setOpen(false)
      setActivePanel(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openMenu = useCallback(() => setOpen(true), [])
  const closeMenu = useCallback(() => {
    setOpen(false)
    setActivePanel(null)
  }, [])
  const goBack = useCallback(() => setActivePanel(null), [])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const resolveHref = (item: NavItem): string => {
    const { link } = item
    if (link.type === 'custom' && link.url) return link.url
    if (link.type === 'reference' && link.reference && typeof link.reference.value === 'object') {
      const slug = (link.reference.value as { slug?: string }).slug ?? ''
      return link.reference.relationTo === 'pages' ? `/${slug}` : `/${link.reference.relationTo}/${slug}`
    }
    return '#'
  }

  const resolveMegaItemHref = (item: MegaItem): string => {
    const link = item.link
    if (!link) return '#'
    if (link.type === 'custom' && link.url) return link.url
    if (link.type === 'reference' && link.reference && typeof link.reference.value === 'object') {
      const slug = (link.reference.value as { slug?: string }).slug ?? ''
      return link.reference.relationTo === 'pages' ? `/${slug}` : `/${link.reference.relationTo}/${slug}`
    }
    return '#'
  }

  return (
    <>
      {/* Hamburger button */}
      <button
        type="button"
        className="ak-mobile-hamburger"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="ak-mobile-sheet"
        onClick={openMenu}
      >
        <span className="ak-mobile-hamburger__bar" aria-hidden="true" />
        <span className="ak-mobile-hamburger__bar" aria-hidden="true" />
        <span className="ak-mobile-hamburger__bar ak-mobile-hamburger__bar--short" aria-hidden="true" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="ak-mobile-backdrop"
          aria-hidden="true"
          onClick={closeMenu}
        />
      )}

      {/* Bottom sheet */}
      <div
        id="ak-mobile-sheet"
        className={`ak-mobile-sheet${open ? ' ak-mobile-sheet--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Sheet handle */}
        <div className="ak-mobile-sheet__handle" aria-hidden="true" />

        {/* Sheet header */}
        <div className="ak-mobile-sheet__header">
          {activePanel ? (
            <button
              type="button"
              className="ak-mobile-sheet__back"
              onClick={goBack}
              aria-label="Back to main menu"
            >
              ‹
            </button>
          ) : (
            <div aria-hidden="true" />
          )}
          {activePanel && (
            <span className="ak-mobile-sheet__panel-label">
              {activePanel.megaMenu?.panelLabel}
            </span>
          )}
          <button
            type="button"
            className="ak-mobile-sheet__close"
            onClick={closeMenu}
            aria-label="Close navigation menu"
          >
            ✕
          </button>
        </div>

        {/* Panels container */}
        <div className={`ak-mobile-sheet__panels${activePanel ? ' ak-mobile-sheet__panels--sub' : ''}`}>

          {/* Main panel */}
          <div className="ak-mobile-sheet__panel ak-mobile-sheet__panel--main" aria-hidden={!!activePanel}>
            <div className="ak-mobile-main-nav">
              {navItems.map((item, i) => {
                const hasMega = item.hasMegaMenu && item.megaMenu
                return hasMega ? (
                  <button
                    key={item.id ?? i}
                    type="button"
                    className="ak-mobile-nav-card ak-mobile-nav-card--mega"
                    onClick={() => setActivePanel(item)}
                    aria-haspopup="true"
                  >
                    <span className="ak-mobile-nav-card__eyebrow">{item.megaMenu!.panelLabel}</span>
                    <span className="ak-mobile-nav-card__label">{item.link.label}</span>
                    <span className="ak-mobile-nav-card__arrow" aria-hidden="true">›</span>
                  </button>
                ) : (
                  <Link
                    key={item.id ?? i}
                    href={resolveHref(item)}
                    className="ak-mobile-nav-card"
                    onClick={closeMenu}
                  >
                    <span className="ak-mobile-nav-card__label">{item.link.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* CTA */}
            {data.cta?.url && (
              <Link
                href={data.cta.url}
                className="ak-mobile-sheet__cta bp-btn bp-btn--primary"
                onClick={closeMenu}
              >
                {data.cta.label}
              </Link>
            )}
          </div>

          {/* Sub panel */}
          <div className="ak-mobile-sheet__panel ak-mobile-sheet__panel--sub" aria-hidden={!activePanel}>
            {activePanel?.megaMenu && (
              <>
                <p className="ak-mobile-sub__description">
                  {activePanel.megaMenu.panelDescription}
                </p>
                <div className="ak-mobile-sub__items">
                  {(activePanel.megaMenu.items ?? []).map((item, i) => (
                    <Link
                      key={item.id ?? i}
                      href={resolveMegaItemHref(item)}
                      className="ak-mobile-sub-item"
                      onClick={closeMenu}
                    >
                      {item.icon && (
                        <span className="ak-mobile-sub-item__icon">
                          <span className="material-symbols-outlined" aria-hidden="true">{item.icon}</span>
                        </span>
                      )}
                      <div className="ak-mobile-sub-item__body">
                        <span className="ak-mobile-sub-item__title">{item.title}</span>
                        {item.description && (
                          <span className="ak-mobile-sub-item__desc">{item.description}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Create `src/Header/MobileMenu/mobile-menu.css`**

```css
/* ─── Mobile hamburger ──────────────────────────────────── */
.ak-mobile-hamburger {
  display: none;
  flex-direction: column;
  gap: var(--bp-space-1);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--bp-space-2);
  margin: calc(-1 * var(--bp-space-2));
}

.ak-mobile-hamburger__bar {
  display: block;
  width: 22px;
  height: 2px;
  background-color: #ffffff;
  border-radius: var(--bp-radius-full);
  transition: opacity var(--bp-duration-fast) var(--bp-ease);
}

.ak-mobile-hamburger__bar--short { width: 14px; }

/* Show hamburger, hide desktop nav on mobile */
@container header-inner (max-width: 47.99rem) {
  .ak-mobile-hamburger { display: flex; }
  .ak-header-nav { display: none; }
}

/* ─── Backdrop ──────────────────────────────────────────── */
.ak-mobile-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 200;
}

/* ─── Bottom sheet ──────────────────────────────────────── */
.ak-mobile-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 201;
  background-color: var(--ak-header-bg);
  border-radius: var(--bp-radius-xl) var(--bp-radius-xl) 0 0;
  border-top: 1px solid rgba(255,255,255,0.12);
  transform: translateY(100%);
  transition: transform var(--bp-duration-normal) var(--bp-ease);
  max-height: 85dvh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ak-mobile-sheet--open {
  transform: translateY(0);
}

/* ─── Sheet handle ──────────────────────────────────────── */
.ak-mobile-sheet__handle {
  width: 36px;
  height: 3px;
  background: rgba(255,255,255,0.2);
  border-radius: var(--bp-radius-full);
  margin: var(--bp-space-3) auto var(--bp-space-1);
  flex-shrink: 0;
}

/* ─── Sheet header ──────────────────────────────────────── */
.ak-mobile-sheet__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--bp-space-2) var(--bp-space-4);
  flex-shrink: 0;
}

.ak-mobile-sheet__back {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--ak-accent);
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  padding: var(--bp-space-1) var(--bp-space-2);
  margin-left: calc(-1 * var(--bp-space-2));
}

.ak-mobile-sheet__panel-label {
  font-size: var(--bp-text-xs, 0.6875rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--ak-accent);
}

.ak-mobile-sheet__close {
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255,255,255,0.6);
  font-size: 1.125rem;
  line-height: 1;
  padding: var(--bp-space-1) var(--bp-space-2);
  margin-right: calc(-1 * var(--bp-space-2));
  transition: color var(--bp-duration-fast) var(--bp-ease);
}

.ak-mobile-sheet__close:hover { color: #ffffff; }

/* ─── Panels ────────────────────────────────────────────── */
.ak-mobile-sheet__panels {
  display: flex;
  flex: 1;
  overflow: hidden;
  transition: transform var(--bp-duration-normal) var(--bp-ease);
}

.ak-mobile-sheet__panels--sub {
  transform: translateX(-100%);
}

.ak-mobile-sheet__panel {
  min-width: 100%;
  overflow-y: auto;
  padding: var(--bp-space-2) var(--bp-space-4) var(--bp-space-6);
}

/* ─── Main nav grid ─────────────────────────────────────── */
.ak-mobile-main-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--bp-space-2);
  margin-bottom: var(--bp-space-4);
}

.ak-mobile-nav-card {
  display: flex;
  flex-direction: column;
  gap: var(--bp-space-1);
  padding: var(--bp-space-3);
  background: rgba(255,255,255,0.06);
  border-radius: var(--bp-radius);
  border: none;
  cursor: pointer;
  text-decoration: none;
  text-align: left;
  transition: background-color var(--bp-duration-fast) var(--bp-ease);
  position: relative;
}

.ak-mobile-nav-card:hover,
.ak-mobile-nav-card:active { background: rgba(255,255,255,0.1); }

.ak-mobile-nav-card__eyebrow {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ak-accent);
}

.ak-mobile-nav-card__label {
  font-size: var(--bp-text-sm, 0.875rem);
  font-weight: 600;
  color: rgba(255,255,255,0.85);
}

.ak-mobile-nav-card__arrow {
  position: absolute;
  bottom: var(--bp-space-3);
  right: var(--bp-space-3);
  font-size: 1rem;
  color: rgba(255,255,255,0.3);
}

/* ─── CTA ───────────────────────────────────────────────── */
.ak-mobile-sheet__cta {
  display: block;
  text-align: center;
  width: 100%;
}

/* ─── Sub panel ─────────────────────────────────────────── */
.ak-mobile-sub__description {
  font-size: var(--bp-text-sm, 0.875rem);
  color: rgba(255,255,255,0.4);
  margin: 0 0 var(--bp-space-4);
  line-height: 1.5;
}

.ak-mobile-sub__items {
  display: flex;
  flex-direction: column;
  gap: var(--bp-space-2);
}

.ak-mobile-sub-item {
  display: flex;
  align-items: center;
  gap: var(--bp-space-3);
  padding: var(--bp-space-3);
  background: rgba(255,255,255,0.05);
  border-radius: var(--bp-radius);
  text-decoration: none;
  transition: background-color var(--bp-duration-fast) var(--bp-ease);
}

.ak-mobile-sub-item:hover,
.ak-mobile-sub-item:active { background: rgba(255,255,255,0.09); }

.ak-mobile-sub-item__icon {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--bp-radius-sm);
  background: rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.6);
}

.ak-mobile-sub-item__icon .material-symbols-outlined { font-size: 1.25rem; }

.ak-mobile-sub-item__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.ak-mobile-sub-item__title {
  font-size: var(--bp-text-sm, 0.875rem);
  font-weight: 600;
  color: rgba(255,255,255,0.9);
}

.ak-mobile-sub-item__desc {
  font-size: var(--bp-text-xs, 0.75rem);
  color: rgba(255,255,255,0.45);
  line-height: 1.35;
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd /Users/bepartnerlabs/Projects/BePartnerLabs/clients/Amerikiosks/website/amerikiosks
pnpm tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/Header/MobileMenu/
git commit -m "feat(mobile-nav): add MobileMenu component with bottom sheet and sub-panel"
```

---

## Task 2: Wire MobileMenu into the header and hide desktop nav on mobile

**Files:**
- Modify: `src/Header/Component.client.tsx`
- Modify: `src/Header/header.css`

- [ ] **Step 1: Import MobileMenu in Component.client.tsx**

In `src/Header/Component.client.tsx`, add the import after the `HeaderNav` import:

```tsx
import { MobileMenu } from './MobileMenu'
```

- [ ] **Step 2: Render MobileMenu in the header actions**

Replace the `<div className="bp-header__actions">` block with:

```tsx
        <div className="bp-header__actions">
          <LanguageSwitcher />
          {/* Desktop CTA */}
          {data.cta?.url && (
            <Link href={data.cta.url} className="bp-btn bp-btn--primary bp-header__cta--desktop">
              {data.cta.label}
            </Link>
          )}
          {/* Mobile hamburger + sheet */}
          <MobileMenu data={data} />
        </div>
```

- [ ] **Step 3: Add desktop-only rule for CTA in header.css**

Add at the end of `src/Header/header.css`:

```css
/* Hide desktop CTA on mobile (MobileMenu sheet has its own CTA) */
@container header-inner (max-width: 47.99rem) {
  .bp-header__cta--desktop { display: none; }
}
```

- [ ] **Step 4: TypeScript check**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors.

- [ ] **Step 5: Verify site returns 200**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
```

Expected: `200`.

- [ ] **Step 6: Commit**

```bash
git add src/Header/Component.client.tsx src/Header/header.css
git commit -m "feat(mobile-nav): wire MobileMenu into header, hide desktop elements on mobile"
```
