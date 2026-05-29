# OpenSpec Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install OpenSpec, migrate the two existing Superpowers specs into OpenSpec format, and establish the living spec structure for the project.

**Architecture:** OpenSpec lives at `openspec/` in the project root. Existing design docs are distilled into living feature specs (`openspec/specs/[feature]/spec.md`). The original dated docs stay in `docs/superpowers/specs/` as historical record.

**Tech Stack:** `@fission-ai/openspec` (global npm install), Markdown

---

## File Map

| Action | Path |
|--------|------|
| Create | `openspec/specs/mega-menu/spec.md` |
| Create | `openspec/specs/i18n/spec.md` |
| Keep (historical) | `docs/superpowers/specs/2026-05-28-header-megamenu-design.md` |
| Keep (historical) | `docs/superpowers/specs/2026-05-28-translation-design.md` |
| Already updated | `CLAUDE.md` |

---

### Task 1: Install OpenSpec globally

**Files:**
- No project files changed (global install)

- [ ] **Step 1: Install OpenSpec**

```bash
npm install -g @fission-ai/openspec@latest
```

- [ ] **Step 2: Verify installation**

```bash
openspec --version
```

Expected: prints a version number without error.

- [ ] **Step 3: Commit nothing**

No project files changed — global install only. No commit needed.

---

### Task 2: Create OpenSpec mega-menu living spec

**Files:**
- Create: `openspec/specs/mega-menu/spec.md`

- [ ] **Step 1: Create the directory and spec file**

```bash
mkdir -p openspec/specs/mega-menu
```

Create `openspec/specs/mega-menu/spec.md` with this content:

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add openspec/specs/mega-menu/spec.md
git commit -m "feat: add OpenSpec living spec for mega-menu feature"
```

---

### Task 3: Create OpenSpec i18n living spec

**Files:**
- Create: `openspec/specs/i18n/spec.md`

- [ ] **Step 1: Create the directory and spec file**

```bash
mkdir -p openspec/specs/i18n
```

Create `openspec/specs/i18n/spec.md` with this content:

```markdown
# i18n / Translation Spec

## Overview

Two-locale site: English (default, no prefix) and Spanish (`/es/...`). Payload handles content translation; next-intl handles routing and UI strings.

## Locales

| Locale | Prefix | Notes |
|--------|--------|-------|
| `en` | none | default, clean URLs |
| `es` | `/es/` | prefixed |

Strategy: `localePrefix: 'as-needed'` — English URLs stay clean.

## Payload Config

```ts
// payload.config.ts
localization: {
  locales: ['en', 'es'],
  defaultLocale: 'en',
  fallback: true,   // untranslated ES fields fall back to EN
}
```

### Localized fields

| Collection / Global | Fields |
|---------------------|--------|
| `Pages` | `title`, `slug`, all layout block text fields, meta title/description |
| `Posts` | `title`, `slug`, all layout block text fields, meta title/description |
| `Categories` | `title` |
| `Header` global | nav link labels, mega menu labels |
| `Footer` global | nav link labels, tagline/description |

Non-localized: dates, media references, booleans, numerics, `publishedAt`.

After changes: `pnpm generate:types` → `pnpm generate:importmap` → `pnpm payload migrate:create` → `pnpm payload migrate`.

## Route Structure

```
src/app/(frontend)/
  [locale]/
    layout.tsx        ← html lang, next-intl provider + messages
    page.tsx
    [slug]/page.tsx
    posts/page.tsx
    posts/[slug]/page.tsx
    posts/page/[pageNumber]/page.tsx
    search/page.tsx
    not-found.tsx
```

Flat routes under `(frontend)` move inside `[locale]/`.

## Middleware

`src/middleware.ts` using `next-intl/middleware`:
- Detects locale from URL prefix → Accept-Language → default (`en`)
- Excludes `/admin` and `/api` routes

## Payload Data Fetches

Every fetch passes the active locale:

```ts
await payload.findOne({
  collection: 'pages',
  where: { slug: { equals: slug } },
  locale,
  fallbackLocale: 'en',
})
```

## UI Strings

Static strings (not from Payload) live in:

```
src/messages/
  en.json
  es.json
```

Strings in scope: nav aria labels, "Menu"/"Close", search placeholder, "No results", pagination labels, "Posts" heading, 404 message.

Server components: `getTranslations()`. Client components: `useTranslations()`.

## Language Switcher

Client component in `Header` nav. Renders `EN` / `ES` links. When switching, fetches target-locale slug via:

```
GET /api/pages/{id}?locale=es&depth=0
```

Falls back to current slug if no translation exists.

## Status

Design approved 2026-05-28. Implementation pending.
```

- [ ] **Step 2: Commit**

```bash
git add openspec/specs/i18n/spec.md
git commit -m "feat: add OpenSpec living spec for i18n feature"
```

---

### Task 4: Commit CLAUDE.md update

**Files:**
- Already modified: `CLAUDE.md`

- [ ] **Step 1: Stage and commit the CLAUDE.md update**

```bash
git add CLAUDE.md docs/superpowers/specs/2026-05-29-openspec-integration-design.md
git commit -m "docs: add OpenSpec workflow documentation to CLAUDE.md"
```

---

### Task 5: Verify setup

- [ ] **Step 1: Confirm OpenSpec directory structure**

```bash
find openspec -type f
```

Expected output:
```
openspec/specs/mega-menu/spec.md
openspec/specs/i18n/spec.md
```

- [ ] **Step 2: Test /openspec:proposal command**

In a Claude Code session, run:

```
/openspec:proposal Add a footer newsletter signup form
```

Expected: the agent reads existing specs, generates a proposal in `openspec/changes/`, without writing any code.

- [ ] **Step 3: Done**

OpenSpec is live. For future features: refer to `CLAUDE.md` → Spec Workflow section.
