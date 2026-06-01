# BPL DS Nav Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the desktop header nav from custom `ak-header-nav*` classes to the BPL DS `bp-nav` contract (correct HTML, Popover API, 3-level token chain) and add header scroll sentinel.

**Architecture:** Four targeted changes — (1) `Component.client.tsx` gains a scroll sentinel + `IntersectionObserver`; (2) `Nav/index.tsx` migrates to `ul.bp-nav`/`li` structure with Popover API replacing all React open/close state; (3) `header.css` renames `ak-header-nav*` rules to `bp-nav*` and restructures to the 3-level token chain; (4) `megamenu.css` adds Popover top-layer positioning and entrance animation.

**Tech Stack:** React 19 (native `popover`/`popoverTarget` JSX support), Next.js App Router, CSS Popover API, CSS `@starting-style` for entrance animation.

**DS Reference:** https://ds.bepartnerlabs.com/AGENTS.md — read before touching any component.

---

## File Map

| File | Change |
|---|---|
| `src/Header/Component.client.tsx` | Add sentinel div + `useRef` + `IntersectionObserver` for `.is-scrolled` |
| `src/Header/Nav/index.tsx` | Migrate to `ul.bp-nav`, `li`, Popover API; remove all open/close state |
| `src/Header/header.css` | Rename `ak-header-nav*` → `bp-nav*`; restructure to 3-level tokens; add `.is-scrolled` |
| `src/Header/Nav/megamenu.css` | Add `bp-nav__megamenu` popover positioning + entrance animation |

---

## Task 1: Header scroll sentinel + `.is-scrolled`

**Files:**
- Modify: `src/Header/Component.client.tsx`
- Modify: `src/Header/header.css`

- [ ] **Step 1: Add sentinel div and IntersectionObserver to Component.client.tsx**

Replace the full file content:

```tsx
'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import type { Header } from '@/payload-types'
import { Logo } from '@/components/Logo/Logo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { HeaderNav } from './Nav'
import { MobileMenu } from './MobileMenu'
import './header.css'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  useEffect(() => {
    const sentinel = document.getElementById('header-sentinel')
    const header = headerRef.current
    if (!sentinel || !header) return
    const observer = new IntersectionObserver(
      ([entry]) => header.classList.toggle('is-scrolled', !entry.isIntersecting)
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div id="header-sentinel" aria-hidden="true" style={{ height: '1px' }} />
      <header
        ref={headerRef}
        className="bp-header"
        {...(theme ? { 'data-theme': theme } : {})}
      >
        <div className="bp-header__inner">
          <Link href="/" className="bp-header__logo">
            <Logo loading="eager" priority="high" />
          </Link>

          <HeaderNav data={data} />

          <div className="bp-header__actions">
            <LanguageSwitcher />
            {data.cta?.url && (
              <Link href={data.cta.url} className="bp-btn bp-btn--primary bp-header__cta--desktop">
                {data.cta.label}
              </Link>
            )}
            <MobileMenu data={data} />
          </div>
        </div>
      </header>
    </>
  )
}
```

- [ ] **Step 2: Add `.is-scrolled` rule to header.css**

Add after the `.bp-header` block (after line ending `background-color: var(--header-bg, var(--ak-header-bg));`):

```css
.bp-header.is-scrolled {
  box-shadow: var(--bp-shadow-md);
  transition: box-shadow var(--bp-duration-fast) var(--bp-ease);
}
```

- [ ] **Step 3: Verify in browser**

Run `pnpm dev`, scroll the page — the header should gain a shadow after the first pixel of scroll and lose it when back at top.

- [ ] **Step 4: Commit**

```bash
git add src/Header/Component.client.tsx src/Header/header.css
git commit -m "feat(header): add scroll sentinel and .is-scrolled shadow"
```

---

## Task 2: Migrate Nav/index.tsx to bp-nav + Popover API

**Files:**
- Modify: `src/Header/Nav/index.tsx`

The key change: `popover="auto"` on the megamenu div means the browser handles open/close natively (click trigger, click-outside, Escape). React only tracks `openId` to render `aria-expanded` correctly — it listens to the popover's `toggle` event.

- [ ] **Step 1: Replace Nav/index.tsx**

```tsx
'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { MegaMenu } from './MegaMenu'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <nav className="bp-header__nav" aria-label="Main">
      <ul className="bp-nav" role="list">
        {navItems.map(({ link, hasMegaMenu, megaMenu, id }, i) => {
          const itemId = id ?? `nav-${i}`
          const panelId = `megamenu-${itemId}`
          const isOpen = openId === itemId

          if (hasMegaMenu && megaMenu) {
            return (
              <li key={itemId} className="bp-nav__item">
                <button
                  type="button"
                  className="bp-nav__megamenu-btn"
                  popoverTarget={panelId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  {link.label}
                  <ChevronDown
                    className="bp-nav__chevron"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id={panelId}
                  className="bp-nav__megamenu"
                  popover="auto"
                  onToggle={(e) => {
                    const open = (e.currentTarget as HTMLElement).matches(':popover-open')
                    setOpenId(open ? itemId : null)
                  }}
                >
                  <MegaMenu data={megaMenu} id={panelId} />
                </div>
              </li>
            )
          }

          return (
            <li key={itemId}>
              <CMSLink
                {...link}
                appearance="link"
                className="bp-nav__link"
              />
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
```

- [ ] **Step 2: Check TypeScript**

Run `tsc --noEmit`. If TypeScript complains about `popover` or `popoverTarget` not existing on `HTMLDivElement`/`HTMLButtonElement`, add this to a `.d.ts` file (e.g., `src/types/popover.d.ts`):

```ts
import 'react'

declare module 'react' {
  interface HTMLAttributes<T> {
    popover?: 'auto' | 'manual' | ''
  }
  interface ButtonHTMLAttributes<T> {
    popoverTarget?: string
    popoverTargetAction?: 'toggle' | 'show' | 'hide'
  }
}
```

- [ ] **Step 3: Verify in browser**

Run `pnpm dev`. Click a nav item with megamenu — panel opens. Click outside — panel closes. Press Escape — panel closes. Chevron rotates.

- [ ] **Step 4: Commit**

```bash
git add src/Header/Nav/index.tsx
# If step 2 needed the .d.ts:
git add src/types/popover.d.ts
git commit -m "feat(nav): migrate to bp-nav markup with Popover API"
```

---

## Task 3: Rename nav CSS to bp-nav* and restructure to 3-level tokens

**Files:**
- Modify: `src/Header/header.css`

Replace the entire `/* ─── Header Nav ─── */` section in `header.css`. The new structure:
- Level 2 overrides scoped to `.bp-header` (only where DS defaults differ)
- Component rules using `--_*` Level 3 private vars with fallback to Level 1

- [ ] **Step 1: Replace the nav section in header.css**

Find and replace from `/* ─── Header Nav ─── */` to the end of the file (the last closing `}`):

```css
/* ─── Level 2 token overrides for bp-nav inside bp-header ── */
/* Only declared where DS defaults differ from our design     */
.bp-header .bp-nav {
  --nav-link-color: var(--ak-nav-link-color);   /* DS default: --bp-color-text */
  --nav-link-hover: var(--ak-accent);           /* DS default: --bp-color-text */
}

/* ─── bp-nav component CSS ─────────────────────────────────── */
.bp-header__nav {
  flex: 1;
  display: flex;
  justify-content: center;
}

.bp-nav {
  display: flex;
  align-items: center;
  gap: var(--bp-space-1);
  list-style: none;
  margin: 0;
  padding: 0;
}

.bp-nav__item {
  position: relative;
}

.bp-nav__megamenu-btn,
.bp-nav__link {
  --_color: var(--nav-link-color, var(--bp-color-text));
  display: inline-flex;
  align-items: center;
  gap: var(--bp-space-1);
  padding: var(--bp-space-2) var(--bp-space-3);
  font-size: var(--bp-text-sm, 0.875rem);
  font-weight: 500;
  color: var(--_color);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: color var(--bp-duration-fast) var(--bp-ease);
}

.bp-nav__megamenu-btn:hover,
.bp-nav__link:hover,
.bp-nav__megamenu-btn[aria-expanded="true"] {
  --_color: var(--nav-link-hover, var(--bp-color-text));
}

.bp-nav__chevron {
  width: 1rem;
  height: 1rem;
  transition: transform var(--bp-duration-normal) var(--bp-ease);
}

/* Hide desktop nav + CTA on mobile */
@media (max-width: 59.99rem) {
  .bp-header__nav       { display: none; }
  .bp-header__cta--desktop { display: none; }
}
@container header-inner (max-width: 59.99rem) {
  .bp-header__nav       { display: none; }
  .bp-header__cta--desktop { display: none; }
}
```

Note: `.ak-header-nav` references in `mobile-menu.css` also hide the nav — those will still work since the media query there targets `.ak-header-nav`. Update them too:

- [ ] **Step 2: Update mobile-menu.css nav hide rules**

In `src/Header/MobileMenu/mobile-menu.css`, find and replace both occurrences of `.ak-header-nav { display: none; }` with `.bp-header__nav { display: none; }`:

```css
/* Show hamburger, hide desktop nav on mobile */
@media (max-width: 59.99rem) {
  .ak-mobile-hamburger { display: flex; }
  .bp-header__nav { display: none; }   /* was: .ak-header-nav */
}

@container header-inner (max-width: 59.99rem) {
  .ak-mobile-hamburger { display: flex; }
  .bp-header__nav { display: none; }   /* was: .ak-header-nav */
}
```

- [ ] **Step 3: Verify nav still renders and hides correctly**

Run `pnpm dev`. Desktop: nav links visible. Mobile (resize to <960px): nav hidden, hamburger visible.

- [ ] **Step 4: Commit**

```bash
git add src/Header/header.css src/Header/MobileMenu/mobile-menu.css
git commit -m "refactor(nav): rename ak-header-nav* to bp-nav*, apply 3-level token chain"
```

---

## Task 4: Megamenu CSS for Popover top-layer positioning

**Files:**
- Modify: `src/Header/Nav/megamenu.css`

`popover="auto"` places the element in the browser's **top layer** — above everything, with `position: fixed` by default. The UA stylesheet adds `border`, `padding`, and `inset: 0` that must be reset. We then position the panel below the header.

- [ ] **Step 1: Add bp-nav__megamenu rules to the top of megamenu.css**

Add at the very top of `src/Header/Nav/megamenu.css`, before the existing `.ak-mega` block:

```css
/* ─── Popover container (bp-nav__megamenu) ──────────────── */
/* Resets UA popover styles and positions below header       */
.bp-nav__megamenu {
  /* Reset UA popover defaults */
  border: none;
  padding: 0;
  margin: 0;
  background: transparent;
  inset: unset;

  /* Position below header, centered */
  position: fixed;
  top: 4rem;   /* matches --header-height default */
  left: 50%;
  transform: translateX(-50%);
  z-index: calc(var(--header-z, 100) - 1);

  /* Entrance animation */
  opacity: 0;
  translate: 0 -6px;
  transition:
    opacity var(--bp-duration-fast) var(--bp-ease),
    translate var(--bp-duration-fast) var(--bp-ease),
    display var(--bp-duration-fast) allow-discrete,
    overlay var(--bp-duration-fast) allow-discrete;
}

.bp-nav__megamenu:popover-open {
  opacity: 1;
  translate: 0 0;
}

@starting-style {
  .bp-nav__megamenu:popover-open {
    opacity: 0;
    translate: 0 -6px;
  }
}
```

- [ ] **Step 2: Verify megamenu opens and animates**

Run `pnpm dev`. Click a megamenu trigger — the panel should slide down and fade in below the header. Click outside — panel fades out.

- [ ] **Step 3: Commit**

```bash
git add src/Header/Nav/megamenu.css
git commit -m "feat(megamenu): position and animate bp-nav__megamenu in popover top layer"
```

---

## Task 5: Apply Level 3 private variables to button

**Files:**
- Modify: `src/app/(frontend)/frontend.css`

The current button uses Level 2 tokens directly in properties. Add Level 3 `--_*` vars so fallback resolution works correctly when Level 2 is not declared.

- [ ] **Step 1: Refactor .bp-btn and .bp-btn--primary in frontend.css**

Find and replace the button section:

```css
/* ─── BPL DS Button (bp-btn) ───────────────────────────── */
.bp-btn {
  --_padding: var(--btn-padding, var(--bp-space-2) var(--bp-space-4));
  --_radius:  var(--btn-radius, var(--bp-radius));
  --_font-size: var(--btn-font-size, var(--bp-text-sm, 0.875rem));
  --_border: var(--btn-border, none);

  display: inline-flex;
  align-items: center;
  padding: var(--_padding);
  border-radius: var(--_radius);
  font-size: var(--_font-size);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: var(--_border);
  transition: background-color var(--bp-duration-fast) var(--bp-ease);
}

.bp-btn--primary {
  --_bg:    var(--btn-bg, var(--ak-accent));
  --_color: var(--btn-color, var(--ak-accent-fg));

  background-color: var(--_bg);
  color: var(--_color);
}

.bp-btn--primary:hover {
  --_bg: var(--btn-bg-hover, var(--ak-accent-hover));
}
```

- [ ] **Step 2: Remove now-redundant Level 2 declarations from .bp-btn--primary**

The old `.bp-btn--primary` declared `--btn-bg`, `--btn-bg-hover`, `--btn-color` at the component level globally. That's fine for the primary variant in the header context, but the Level 3 fallbacks now handle the case where they aren't declared. The declarations in the new code above are removed — the `--ak-*` values are the fallback in Level 3.

If any other part of the codebase declares `--btn-bg` on a parent to customize a button, it will still work correctly.

- [ ] **Step 3: Verify button appearance unchanged**

Run `pnpm dev`. The header CTA button should look identical — same color, same hover — since Level 3 falls back to `--ak-accent`.

- [ ] **Step 4: Commit**

```bash
git add src/app/(frontend)/frontend.css
git commit -m "refactor(button): apply Level 3 --_* private variables with fallback chain"
```

---

## Self-review

**Spec coverage:**
- ✅ Header sentinel + `.is-scrolled` → Task 1
- ✅ `bp-header__nav` wrapper in Component.client.tsx → Task 1 (added to JSX)
- ✅ `ul.bp-nav role=list` + `li` structure → Task 2
- ✅ Popover API for megamenu → Task 2
- ✅ `aria-expanded` synced via `toggle` event → Task 2
- ✅ Level 2 token overrides for nav → Task 3
- ✅ Level 3 `--_*` private vars in nav CSS → Task 3
- ✅ Level 3 `--_*` private vars in button → Task 5
- ✅ Megamenu top-layer positioning + animation → Task 4
- ✅ Mobile hide rule updated to `bp-header__nav` → Task 3

**No placeholders found.**

**Type consistency:** `panelId`, `itemId`, `openId`, `isOpen` — consistent across Tasks 2 and 3. `bp-nav__megamenu` class used in Tasks 2 and 4 — consistent.
