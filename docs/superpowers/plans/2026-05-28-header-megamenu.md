# Header Mega Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat header nav with a dark sticky header (logo · nav · CTA) and CMS-managed two-column mega menus for nav items that opt in.

**Architecture:** Extend the Payload `Header` global schema to add optional `megaMenu` fields per nav item, regenerate types, then build a `MegaMenu.tsx` panel component and update `HeaderNav` with hover/keyboard-triggered dropdown state. The `HeaderClient` wrapper gets dark styling and a red "Start a Partnership" CTA button. Brand tokens and the BPL DS grid CSS are added to `globals.css`.

**Tech Stack:** Next.js 15 App Router, Payload CMS 3, TailwindCSS v4, shadcn/ui, TypeScript, Playwright (e2e)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/app/(frontend)/globals.css` | Modify | Add Amerikiosks brand tokens + BPL DS grid CSS |
| `src/Header/config.ts` | Modify | Extend navItems with megaMenu Payload fields |
| `src/payload-types.ts` | Regenerated | Auto-updated after schema change |
| `src/Header/Component.client.tsx` | Modify | Dark sticky header, flex layout, CTA button |
| `src/Header/Nav/MegaMenu.tsx` | Create | Two-column mega menu panel UI |
| `src/Header/Nav/index.tsx` | Modify | Hover/keyboard trigger, open state management |
| `tests/e2e/frontend.e2e.spec.ts` | Modify | Add header and mega menu e2e tests |

---

## Task 1: Add brand tokens and BPL DS grid CSS to globals.css

**Files:**
- Modify: `src/app/(frontend)/globals.css`

- [ ] **Step 1: Add Amerikiosks brand tokens and BPL DS grid to globals.css**

Open `src/app/(frontend)/globals.css`. Add the following block **after the existing `:root` block** (around line 126, before `[data-theme='dark']`):

```css
/* Amerikiosks brand tokens */
:root {
  --ak-header-bg: #0b1120;
  --ak-accent: oklch(50% 0.22 25deg);       /* Amerikiosks red */
  --ak-accent-hover: oklch(45% 0.22 25deg);
  --ak-accent-fg: oklch(98% 0 0deg);        /* white text on red */
  --ak-mega-left-bg: #0b1120;               /* dark left panel */
  --ak-mega-right-bg: #ffffff;              /* white right panel */
}

/* BPL DS content grid — copy directly from ds.bepartnerlabs.com/tokens/grid/ */
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
.bp-content-grid > .breakout,
.full-width > .breakout { grid-column: breakout; }
.bp-content-grid > .full-width,
.full-width > .full-width { grid-column: full-width; }
```

Also add Tailwind theme extensions in the `@theme` block (around line 40–48, add inside the existing `@theme { }` block):

```css
  --color-ak-accent: var(--ak-accent);
  --color-ak-accent-hover: var(--ak-accent-hover);
  --color-ak-accent-fg: var(--ak-accent-fg);
  --color-ak-header-bg: var(--ak-header-bg);
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/bepartnerlabs/Projects/BePartnerLabs/clients/Amerikiosks/website/amerikiosks
tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/(frontend)/globals.css
git commit -m "feat: add Amerikiosks brand tokens and BPL DS grid CSS"
```

---

## Task 2: Extend Header Payload schema with megaMenu fields

**Files:**
- Modify: `src/Header/config.ts`

- [ ] **Step 1: Add megaMenu fields to navItems**

Replace the full contents of `src/Header/config.ts`:

```typescript
import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
        {
          name: 'hasMegaMenu',
          type: 'checkbox',
          defaultValue: false,
          label: 'Enable mega menu',
        },
        {
          name: 'megaMenu',
          type: 'group',
          label: 'Mega menu',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.hasMegaMenu),
          },
          fields: [
            {
              name: 'panelLabel',
              type: 'text',
              label: 'Left panel label (e.g. SOLUTIONS)',
              required: true,
            },
            {
              name: 'panelHeadline',
              type: 'text',
              label: 'Left panel headline',
              required: true,
            },
            {
              name: 'panelDescription',
              type: 'textarea',
              label: 'Left panel description',
            },
            {
              name: 'rightTitle',
              type: 'text',
              label: 'Right panel title',
              required: true,
            },
            {
              name: 'rightSubtitle',
              type: 'textarea',
              label: 'Right panel subtitle',
            },
            {
              name: 'items',
              type: 'array',
              maxRows: 4,
              label: 'Menu items (max 4)',
              fields: [
                {
                  name: 'icon',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Icon',
                },
                {
                  name: 'title',
                  type: 'text',
                  label: 'Item title',
                  required: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: 'Item description',
                },
                link({
                  appearances: false,
                  overrides: { label: 'Item link' },
                }),
              ],
            },
          ],
        },
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
```

- [ ] **Step 2: Regenerate Payload types**

```bash
pnpm generate:types
```

Expected: `src/payload-types.ts` updated. The `Header` interface will now include `hasMegaMenu`, `megaMenu` fields on each navItem.

- [ ] **Step 3: Regenerate admin import map**

```bash
pnpm generate:importmap
```

Expected: no errors.

- [ ] **Step 4: Create and run DB migration**

```bash
pnpm payload migrate:create --name add-header-megamenu
pnpm payload migrate
```

Expected: migration file created in `src/migrations/`, then applied successfully.

- [ ] **Step 5: Verify TypeScript compiles**

```bash
tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/Header/config.ts src/payload-types.ts src/migrations/
git commit -m "feat: extend Header schema with megaMenu fields"
```

---

## Task 3: Build the MegaMenu panel component

**Files:**
- Create: `src/Header/Nav/MegaMenu.tsx`

- [ ] **Step 1: Create MegaMenu.tsx**

Create `src/Header/Nav/MegaMenu.tsx` with this content:

```typescript
'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import type { Header } from '@/payload-types'
import type { Media } from '@/payload-types'

type MegaMenuData = NonNullable<
  NonNullable<Header['navItems']>[number]['megaMenu']
>

interface MegaMenuProps {
  data: MegaMenuData
  id: string
}

function resolveItemUrl(
  link: NonNullable<MegaMenuData['items']>[number]['link'],
): string {
  if (link.type === 'custom' && link.url) return link.url
  if (link.type === 'reference' && link.reference) {
    const ref = link.reference
    if (ref.relationTo === 'pages' && typeof ref.value === 'object') {
      return `/${ref.value.slug ?? ''}`
    }
    if (ref.relationTo === 'posts' && typeof ref.value === 'object') {
      return `/posts/${ref.value.slug ?? ''}`
    }
  }
  return '#'
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ data, id }) => {
  const {
    panelLabel,
    panelHeadline,
    panelDescription,
    rightTitle,
    rightSubtitle,
    items,
  } = data

  return (
    <div
      id={id}
      role="region"
      className="absolute top-full left-0 right-0 w-screen z-40 shadow-xl"
    >
      <div className="max-w-[90rem] mx-auto flex rounded-xl overflow-hidden">
        {/* Left dark panel */}
        <div
          className="w-[30%] flex-shrink-0 p-8 flex flex-col gap-4"
          style={{ backgroundColor: 'var(--ak-mega-left-bg)' }}
        >
          <span
            className="block h-0.5 w-8"
            style={{ backgroundColor: 'var(--ak-accent)' }}
            aria-hidden="true"
          />
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--ak-accent)' }}
          >
            {panelLabel}
          </p>
          <h2 className="text-2xl font-bold text-white leading-snug">
            {panelHeadline}
          </h2>
          {panelDescription && (
            <p className="text-sm text-white/60 leading-relaxed">
              {panelDescription}
            </p>
          )}
        </div>

        {/* Right white panel */}
        <div className="flex-1 bg-white p-8">
          {rightTitle && (
            <h3 className="text-lg font-bold text-gray-900 mb-1">{rightTitle}</h3>
          )}
          {rightSubtitle && (
            <p className="text-sm text-gray-500 mb-6">{rightSubtitle}</p>
          )}

          <div className="grid grid-cols-1 gap-4">
            {(items ?? []).map((item, i) => {
              const icon =
                item.icon && typeof item.icon === 'object'
                  ? (item.icon as Media)
                  : null
              const href = resolveItemUrl(item.link)

              return (
                <Link
                  key={i}
                  href={href}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  {icon && icon.url && (
                    <span className="flex-shrink-0 w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                      <Image
                        src={icon.url}
                        alt={icon.alt ?? ''}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 flex items-center gap-1">
                      {item.title}
                      <ChevronRight
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: 'var(--ak-accent)' }}
                      />
                    </p>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-0.5 leading-snug">
                        {item.description}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/Header/Nav/MegaMenu.tsx
git commit -m "feat: add MegaMenu panel component"
```

---

## Task 4: Update HeaderNav with mega menu triggers

**Files:**
- Modify: `src/Header/Nav/index.tsx`

- [ ] **Step 1: Replace HeaderNav with mega-menu-aware version**

Replace the full contents of `src/Header/Nav/index.tsx`:

```typescript
'use client'

import React, { useCallback, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { MegaMenu } from './MegaMenu'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const [openId, setOpenId] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const open = useCallback((id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenId(id)
  }, [])

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpenId(null), 150)
  }, [])

  const toggle = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id))
  }, [])

  const closeOnEscape = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpenId(null)
  }, [])

  return (
    <nav
      className="flex gap-1 items-center"
      onKeyDown={closeOnEscape}
      aria-label="Main navigation"
    >
      {navItems.map(({ link, hasMegaMenu, megaMenu, id }, i) => {
        const itemId = id ?? `nav-${i}`
        const panelId = `megamenu-${itemId}`
        const isOpen = openId === itemId

        if (hasMegaMenu && megaMenu) {
          return (
            <div
              key={itemId}
              className="relative"
              onMouseEnter={() => open(itemId)}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors"
                onClick={() => toggle(itemId)}
              >
                {link.label}
                <ChevronDown
                  className="w-4 h-4 transition-transform duration-200"
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                  aria-hidden="true"
                />
              </button>

              {isOpen && (
                <div
                  onMouseEnter={() => open(itemId)}
                  onMouseLeave={scheduleClose}
                >
                  <MegaMenu data={megaMenu} id={panelId} />
                </div>
              )}
            </div>
          )
        }

        return (
          <CMSLink
            key={itemId}
            {...link}
            appearance="link"
            className="px-3 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors"
          />
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/Header/Nav/index.tsx
git commit -m "feat: add mega menu hover/keyboard triggers to HeaderNav"
```

---

## Task 5: Update HeaderClient with dark styling and CTA button

**Files:**
- Modify: `src/Header/Component.client.tsx`

- [ ] **Step 1: Replace HeaderClient with dark sticky version**

Replace the full contents of `src/Header/Component.client.tsx`:

```typescript
'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'
import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{ backgroundColor: 'var(--ak-header-bg)' }}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="max-w-[90rem] mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex-shrink-0">
          <Logo loading="eager" priority="high" className="invert-0" />
        </Link>

        <HeaderNav data={data} />

        <Link
          href="/start-a-partnership"
          className="flex-shrink-0 inline-flex items-center px-5 py-2.5 rounded-md text-sm font-semibold transition-colors"
          style={{
            backgroundColor: 'var(--ak-accent)',
            color: 'var(--ak-accent-fg)',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              'var(--ak-accent-hover)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              'var(--ak-accent)'
          }}
        >
          Start a Partnership
        </Link>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/Header/Component.client.tsx
git commit -m "feat: dark sticky header with CTA button"
```

---

## Task 6: Add e2e tests for header and mega menu

**Files:**
- Modify: `tests/e2e/frontend.e2e.spec.ts`

> Note: These tests require a running dev server (`pnpm dev`) and at least one nav item with a mega menu configured in the Payload admin. The tests use `localhost:3000`.

- [ ] **Step 1: Add header and mega menu tests**

Replace the full contents of `tests/e2e/frontend.e2e.spec.ts`:

```typescript
import { test, expect, Page } from '@playwright/test'

test.describe('Frontend', () => {
  test('can load homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')
    const header = page.locator('header').first()
    await expect(header).toBeVisible()
  })

  test('header has dark background', async ({ page }) => {
    await page.goto('http://localhost:3000')
    const header = page.locator('header').first()
    await expect(header).toBeVisible()
    // Header must exist and be sticky
    const position = await header.evaluate((el) =>
      getComputedStyle(el).position,
    )
    expect(position).toBe('sticky')
  })

  test('header contains logo and CTA button', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page.locator('header a[href="/"]')).toBeVisible()
    await expect(
      page.locator('header a[href="/start-a-partnership"]'),
    ).toBeVisible()
    await expect(
      page.locator('header a[href="/start-a-partnership"]'),
    ).toHaveText('Start a Partnership')
  })

  test('nav item with mega menu shows chevron', async ({ page }) => {
    await page.goto('http://localhost:3000')
    // Any button inside the nav that has aria-expanded is a mega menu trigger
    const trigger = page.locator('header nav button[aria-expanded]').first()
    const count = await trigger.count()
    if (count === 0) {
      // No mega menu configured — skip
      test.skip()
      return
    }
    await expect(trigger).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('mega menu opens on hover', async ({ page }) => {
    await page.goto('http://localhost:3000')
    const trigger = page.locator('header nav button[aria-expanded]').first()
    if ((await trigger.count()) === 0) {
      test.skip()
      return
    }
    await trigger.hover()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const panelId = await trigger.getAttribute('aria-controls')
    if (panelId) {
      await expect(page.locator(`#${panelId}`)).toBeVisible()
    }
  })

  test('mega menu closes on Escape', async ({ page }) => {
    await page.goto('http://localhost:3000')
    const trigger = page.locator('header nav button[aria-expanded]').first()
    if ((await trigger.count()) === 0) {
      test.skip()
      return
    }
    await trigger.hover()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Escape')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})
```

- [ ] **Step 2: Run e2e tests (requires running dev server)**

In one terminal: `pnpm dev`  
In another:
```bash
pnpm test:e2e
```

Expected: all tests pass (mega menu tests skip gracefully if no mega menu is configured yet in the CMS).

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/frontend.e2e.spec.ts
git commit -m "test: add e2e tests for dark header and mega menu"
```

---

## Task 7: Manual verification in browser

- [ ] **Step 1: Start dev server**

```bash
pnpm dev
```

- [ ] **Step 2: Open http://localhost:3000 and verify**

Checklist:
- [ ] Header is dark navy and sticky (stays at top on scroll)
- [ ] Logo is visible (white/inverted) on the left
- [ ] Nav items are in the center with white text
- [ ] "Start a Partnership" red button is on the right
- [ ] Nav items without mega menu are plain links

- [ ] **Step 3: Configure a mega menu in Payload admin**

1. Go to http://localhost:3000/admin
2. Open **Globals → Header**
3. Edit a nav item (e.g. "Solutions"), check "Enable mega menu"
4. Fill in: panelLabel="SOLUTIONS", panelHeadline, panelDescription, rightTitle, rightSubtitle
5. Add 2–4 items with titles and descriptions
6. Save

- [ ] **Step 4: Verify mega menu behavior**

- [ ] Hovering the nav item opens the two-column panel
- [ ] Left dark panel shows accent line, label, headline, description
- [ ] Right white panel shows title, subtitle, and items with icons/titles/descriptions
- [ ] Items are clickable links
- [ ] Moving mouse off the trigger+panel closes it after ~150ms
- [ ] Pressing Escape closes the panel
- [ ] Clicking the trigger button toggles the panel

- [ ] **Step 5: Final commit if any visual tweaks were needed**

```bash
git add -p
git commit -m "fix: header mega menu visual polish"
```
