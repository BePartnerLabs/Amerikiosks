# Block Documentation System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the infrastructure (template, CLAUDE.md guides, skill) and initial documentation for Header, Footer, and HighImpact Hero blocks.

**Architecture:** A `_template.md` in `src/blocks/` defines the standard format. A `CLAUDE.md` in each scope directory guides the agent. A `/document-block` skill automates generation including Chrome MCP screenshots. Three initial blocks are documented to validate the system.

**Tech Stack:** Markdown, Chrome DevTools MCP (screenshots), Payload CMS config introspection

---

## Files Created / Modified

| File | Action | Purpose |
|------|--------|---------|
| `src/blocks/_template.md` | Create | Base template for all block README.md files |
| `src/blocks/CLAUDE.md` | Create | Canonical agent guide for documenting blocks and globals |
| `src/Header/CLAUDE.md` | Create | Header-scoped agent guide (references canonical) |
| `src/Footer/CLAUDE.md` | Create | Footer-scoped agent guide (references canonical) |
| `src/Header/README.md` | Create | Header documentation |
| `src/Footer/README.md` | Create | Footer documentation |
| `src/heros/HighImpact/README.md` | Create | HighImpact Hero documentation |
| `src/Header/desktop.png` | Create | Header screenshot 1280x800 |
| `src/Header/mobile.png` | Create | Header screenshot 375x812 |
| `src/Footer/desktop.png` | Create | Footer screenshot 1280x800 |
| `src/Footer/mobile.png` | Create | Footer screenshot 375x812 |
| `src/heros/HighImpact/desktop.png` | Create | Hero screenshot 1280x800 |
| `src/heros/HighImpact/mobile.png` | Create | Hero screenshot 375x812 |
| `docs/blocks/README.md` | Create | Consolidated delivery doc (index of all blocks) |
| `skills/document-block.md` | Create | `/document-block` skill |

---

## Task 1: Create `src/blocks/_template.md`

**Files:**
- Create: `src/blocks/_template.md`

- [ ] **Step 1: Write the template file**

```markdown
# [Block Name]

> [One sentence: what this block does and when to use it.]

## Admin Location
- **Ruta:** `[e.g. Globals → Header / Pages → [page] → Layout → [Block Name]]`
- **Tipo:** `[Global / Layout Block / Lexical Block]`

## Fields

| Campo | Tipo | Requerido | Localizado | Descripción |
|-------|------|-----------|------------|-------------|
| `fieldName` | text | ✓ | ✗ | Description of the field |

## Variants

| Variante | Descripción |
|----------|-------------|
| `default` | Standard appearance |

## Screenshots

| Desktop (1280px) | Mobile (375px) |
|------------------|----------------|
| ![desktop](./desktop.png) | ![mobile](./mobile.png) |

## Quality Checklist

**Completeness: 0/20 (0%)**

### Accessibility AAA
- [ ] Contrast ratio minimum 7:1
- [ ] All interactive elements keyboard navigable
- [ ] ARIA labels on elements without visible text
- [ ] Correct HTML landmarks (`header`, `main`, `nav`, `section`, etc.)
- [ ] Focus visible on all interactive elements

### HTML Semantics
- [ ] Correct heading hierarchy (no skipped levels)
- [ ] Semantic elements used (not `div` soup)
- [ ] Images have descriptive `alt` text

### Performance
- [ ] Images use `next/image` with correct sizes
- [ ] No Cumulative Layout Shift (CLS)
- [ ] Off-viewport content lazy loaded

### SEO / AIO / GEO
- [ ] Content directly answers questions (GEO-ready)
- [ ] Schema.org implemented (see section below)
- [ ] Does not block indexing

### Delivery
- [ ] Unit tests added
- [ ] All fields documented in table above
- [ ] Screenshots up to date
- [ ] Delivery notes written in non-technical language

## Schema.org

- **Applicable type:** `[e.g. WebPageElement, SiteNavigationElement, Article]`
- **Implemented:** ✗
- **Snippet:**

```json
{}
```

## Delivery Notes

> [Non-technical instructions for the client: how to edit this block, what each field does in plain language, any important content guidelines.]
```

- [ ] **Step 2: Commit**

```bash
git add src/blocks/_template.md
git commit -m "docs: add block documentation template"
```

---

## Task 2: Create `src/blocks/CLAUDE.md`

**Files:**
- Create: `src/blocks/CLAUDE.md`

- [ ] **Step 1: Write the CLAUDE.md**

```markdown
# Block Documentation Guide

This guide applies to all **Layout Blocks** in `src/blocks/` and **Globals** in `src/Header/` and `src/Footer/`.

## When to Document

- **New block created** → generate `README.md` immediately from `_template.md`
- **Fields or variants changed** → update the Fields or Variants table in `README.md`
- **Block marked as finished** → complete full checklist + take screenshots + write delivery notes

## Process

1. **Copy template**
   ```bash
   cp src/blocks/_template.md src/blocks/<BlockName>/README.md
   # For globals:
   cp src/blocks/_template.md src/Header/README.md
   cp src/blocks/_template.md src/Footer/README.md
   ```

2. **Fill sections from code**
   - Read `Component.tsx` and `config.ts` (or global config)
   - Fill: block name, description, admin path, fields table, variants table
   - Admin path format:
     - Layout Block: `Pages → [page name] → Layout → [Block Name]`
     - Global: `Globals → [Global Name]`
     - Lexical Block: `Inside any RichText field → Insert Block → [Block Name]`

3. **Take screenshots with Chrome MCP**
   - Ensure the site is running with real seed data (`https://amerikiosks.vercel.app` or local)
   - Desktop: viewport 1280×800 → save as `desktop.png` next to `README.md`
   - Mobile: emulate iPhone 12 (375×812) → save as `mobile.png` next to `README.md`
   - Always capture the block with real content visible (not empty state)

4. **Run checklist**
   - Auto-checkable items (scan the component code):
     - `next/image` usage → Performance item ✓
     - `alt` attribute present → Semantics item ✓
     - HTML landmarks in component → Accessibility item ✓
     - JSON-LD script tag → Schema.org item ✓
   - Leave manual items unchecked (`[ ]`) for developer review

5. **Calculate completeness score**
   - Count `[x]` items in the checklist
   - Update: `**Completeness: X/20 (X%)**`
   - 100% = ready for client delivery; <80% = not shippable

6. **Update consolidated index**
   - Add or update a row in `docs/blocks/README.md`

## Consolidated Index Format

In `docs/blocks/README.md`, each block has one row:

```markdown
| [Block Name](../src/blocks/BlockName/README.md) | Layout Block | X% | note |
```

## Screenshot Tips

- Use `https://amerikiosks.vercel.app` after seeding, or `http://localhost:3000` locally
- Navigate to a page that contains the block (e.g., home page for Hero)
- For Header/Footer: any page works since they appear on all pages
- Crop to show only the block, not the entire page (unless the block is full-page)
```

- [ ] **Step 2: Commit**

```bash
git add src/blocks/CLAUDE.md
git commit -m "docs: add block documentation agent guide"
```

---

## Task 3: Create `src/Header/CLAUDE.md` and `src/Footer/CLAUDE.md`

**Files:**
- Create: `src/Header/CLAUDE.md`
- Create: `src/Footer/CLAUDE.md`

- [ ] **Step 1: Write `src/Header/CLAUDE.md`**

```markdown
# Header Documentation Guide

**Type:** Global  
**Admin path:** `Globals → Header`  
**Template:** `src/blocks/_template.md`  
**Full guide:** `src/blocks/CLAUDE.md`

## Header-Specific Notes

- The Header is a **Global** — there is one instance shared across all pages
- It supports a mega menu per nav item (enabled via the `hasMegaMenu` checkbox)
- Screenshots: capture the full header bar at the top of the home page
- Mobile screenshot: show the hamburger / mobile nav state (open)
- Schema.org type: `SiteNavigationElement`
```

- [ ] **Step 2: Write `src/Footer/CLAUDE.md`**

```markdown
# Footer Documentation Guide

**Type:** Global  
**Admin path:** `Globals → Footer`  
**Template:** `src/blocks/_template.md`  
**Full guide:** `src/blocks/CLAUDE.md`

## Footer-Specific Notes

- The Footer is a **Global** — one instance shared across all pages
- Supports up to 4 nav columns, each with up to 8 links
- Has a contact column (email + CTA link) separate from nav columns
- Screenshots: capture the full footer from any page
- Schema.org type: `WPFooter`
```

- [ ] **Step 3: Commit**

```bash
git add src/Header/CLAUDE.md src/Footer/CLAUDE.md
git commit -m "docs: add Header and Footer agent documentation guides"
```

---

## Task 4: Create the `/document-block` Skill

**Files:**
- Create: `skills/document-block.md`

- [ ] **Step 1: Check where project skills live**

```bash
ls .claude/skills/ 2>/dev/null || ls skills/ 2>/dev/null || echo "no skills dir"
```

- [ ] **Step 2: Write the skill**

Create `skills/document-block.md` (or `.claude/skills/document-block.md` based on what exists):

```markdown
---
name: document-block
description: Document a Payload CMS block or global — generates README.md, takes screenshots, runs quality checklist
---

# Document Block

Use when: creating or finishing a block, updating fields, or running the quality checklist on an existing block.

## Arguments

Pass the block path as argument: `/document-block src/blocks/Hero` or `/document-block src/Header`

## Steps

1. **Read the block code**
   - Read `Component.tsx` (or `Component.client.tsx` if it exists)
   - Read `config.ts` (for Layout Blocks) or the global config file
   - Note: slug, fields, variants, labels

2. **Copy template**
   ```bash
   cp src/blocks/_template.md <block-path>/README.md
   ```

3. **Fill README.md from code**
   - Block name: from config `labels.singular` or directory name
   - Description: infer from config slug + labels + component structure
   - Admin location:
     - Global → `Globals → [label]`
     - Layout Block → `Pages → [page] → Layout → [Block Name]`
     - Lexical Block → `RichText field → Insert Block → [Block Name]`
   - Fields table: one row per field in config.ts (name, type, required, localized, description from `admin.description` or label)
   - Variants: from `type` select field options if present

4. **Auto-check items in checklist** (scan component code):
   - `next/image` or `<Media` present → check "Images use next/image"
   - `alt` attribute or `alt=` prop → check "Images have descriptive alt text"
   - `<header`, `<nav`, `<main`, `<footer`, `<section`, `<article` → check "Correct HTML landmarks"
   - `<script type="application/ld+json"` → check "Schema.org implemented"
   - Fields table has entries for all fields → check "All fields documented"

5. **Take screenshots with Chrome MCP**
   - Open the site (https://amerikiosks.vercel.app or http://localhost:3000)
   - Navigate to a page that shows the block
   - Desktop: set viewport to 1280×800, take screenshot → save as `<block-path>/desktop.png`
   - Mobile: emulate iPhone 12 (375×812), take screenshot → save as `<block-path>/mobile.png`

6. **Calculate completeness**
   - Count `[x]` items
   - Update `**Completeness: X/20 (X%)**` line

7. **Update consolidated index**
   - Open `docs/blocks/README.md`
   - Add/update row: `| [Name](path/README.md) | Type | X% | note |`

8. **Commit**
   ```bash
   git add <block-path>/
   git add docs/blocks/README.md
   git commit -m "docs(<block-name>): add block documentation"
   ```
```

- [ ] **Step 3: Commit**

```bash
git add skills/document-block.md
git commit -m "feat: add /document-block skill"
```

---

## Task 5: Create Consolidated Index `docs/blocks/README.md`

**Files:**
- Create: `docs/blocks/README.md`

- [ ] **Step 1: Create the index file**

```markdown
# Block Documentation Index

Consolidated index of all documented blocks and globals.  
**Updated automatically** by the `/document-block` skill.

| Block | Type | Completeness | Notes |
|-------|------|-------------|-------|
| [Header](../../src/Header/README.md) | Global | 0% | |
| [Footer](../../src/Footer/README.md) | Global | 0% | |
| [Hero — HighImpact](../../src/heros/HighImpact/README.md) | Hero Variant | 0% | |
```

- [ ] **Step 2: Commit**

```bash
git add docs/blocks/README.md
git commit -m "docs: add consolidated block documentation index"
```

---

## Task 6: Document the Header Block

**Files:**
- Create: `src/Header/README.md`
- Create: `src/Header/desktop.png`
- Create: `src/Header/mobile.png`

- [ ] **Step 1: Create `src/Header/README.md`**

Fill from `src/Header/config.ts`. Key fields to document:

```markdown
# Header

> Site-wide navigation bar with logo, primary nav links, and optional mega menus per item. Appears at the top of every page.

## Admin Location
- **Ruta:** `Globals → Header`
- **Tipo:** `Global`

## Fields

| Campo | Tipo | Requerido | Localizado | Descripción |
|-------|------|-----------|------------|-------------|
| `navItems` | array | ✗ | ✗ | List of top-level nav links |
| `navItems[].link` | link | ✓ | ✗ | Link URL and label |
| `navItems[].hasMegaMenu` | checkbox | ✗ | ✗ | Enable mega menu for this item |
| `navItems[].megaMenu.panelLabel` | text | ✓ (if mega) | ✓ | Left panel section label (e.g. SOLUTIONS) |
| `navItems[].megaMenu.panelHeadline` | text | ✓ (if mega) | ✓ | Left panel headline |
| `navItems[].megaMenu.panelDescription` | textarea | ✗ | ✓ | Left panel supporting text |
| `navItems[].megaMenu.items` | array | ✗ | ✗ | Right-side grid of mega menu items |

## Variants

| Variante | Descripción |
|----------|-------------|
| Standard | Logo + nav links |
| With mega menu | Nav item expands to full-width panel |

## Screenshots

| Desktop (1280px) | Mobile (375px) |
|------------------|----------------|
| ![desktop](./desktop.png) | ![mobile](./mobile.png) |

## Quality Checklist

**Completeness: 0/20 (0%)**

### Accessibility AAA
- [ ] Contrast ratio minimum 7:1
- [ ] All interactive elements keyboard navigable
- [ ] ARIA labels on elements without visible text
- [x] Correct HTML landmarks (`<header>`, `<nav>`)
- [ ] Focus visible on all interactive elements

### HTML Semantics
- [ ] Correct heading hierarchy (no skipped levels)
- [x] Semantic elements used (`<header>`, `<nav>`, `<ul>`)
- [x] Images have descriptive `alt` text

### Performance
- [x] Images use `next/image` with correct sizes
- [ ] No Cumulative Layout Shift (CLS)
- [ ] Off-viewport content lazy loaded

### SEO / AIO / GEO
- [ ] Content directly answers questions (GEO-ready)
- [ ] Schema.org implemented
- [x] Does not block indexing

### Delivery
- [ ] Unit tests added
- [x] All fields documented in table above
- [ ] Screenshots up to date
- [ ] Delivery notes written in non-technical language

## Schema.org

- **Applicable type:** `SiteNavigationElement`
- **Implemented:** ✗
- **Snippet:**

```json
{
  "@context": "https://schema.org",
  "@type": "SiteNavigationElement",
  "name": "Main Navigation"
}
```

## Delivery Notes

> The Header appears at the top of every page of your site. You can add, remove, or reorder navigation links from the admin panel under **Globals → Header**. For each link, you can optionally enable a "mega menu" — a large dropdown panel with a title, description, and a grid of sub-links. Changes to the header take effect immediately after saving.
```

- [ ] **Step 2: Take desktop screenshot with Chrome MCP**

Open `https://amerikiosks.vercel.app` (or `http://localhost:3000`) at 1280×800. Screenshot the header area. Save as `src/Header/desktop.png`.

- [ ] **Step 3: Take mobile screenshot with Chrome MCP**

Emulate iPhone 12 (375×812). Screenshot the header (hamburger state open if possible). Save as `src/Header/mobile.png`.

- [ ] **Step 4: Update completeness score**

Count `[x]` items in checklist, update `**Completeness: X/20 (X%)**`.

- [ ] **Step 5: Update `docs/blocks/README.md`**

Update the Header row with actual completeness %.

- [ ] **Step 6: Commit**

```bash
git add src/Header/README.md src/Header/desktop.png src/Header/mobile.png docs/blocks/README.md
git commit -m "docs(header): add block documentation with screenshots"
```

---

## Task 7: Document the Footer Block

**Files:**
- Create: `src/Footer/README.md`
- Create: `src/Footer/desktop.png`
- Create: `src/Footer/mobile.png`

- [ ] **Step 1: Create `src/Footer/README.md`**

Fill from `src/Footer/config.ts`:

```markdown
# Footer

> Site-wide footer with brand description, navigation columns, and contact information. Appears at the bottom of every page.

## Admin Location
- **Ruta:** `Globals → Footer`
- **Tipo:** `Global`

## Fields

| Campo | Tipo | Requerido | Localizado | Descripción |
|-------|------|-----------|------------|-------------|
| `brandDescription` | textarea | ✗ | ✗ | Short tagline shown below the logo |
| `columns` | array (max 4) | ✗ | ✗ | Navigation link columns |
| `columns[].label` | text | ✓ | ✗ | Column heading |
| `columns[].links` | array (max 8) | ✗ | ✗ | Links within this column |
| `contactEmail` | email | ✗ | ✗ | Contact email address |
| `contactCta` | text | ✗ | ✗ | Contact call-to-action label |
| `contactCtaUrl` | text | ✗ | ✗ | Contact CTA URL |

## Variants

| Variante | Descripción |
|----------|-------------|
| Standard | Logo + description + nav columns + contact |

## Screenshots

| Desktop (1280px) | Mobile (375px) |
|------------------|----------------|
| ![desktop](./desktop.png) | ![mobile](./mobile.png) |

## Quality Checklist

**Completeness: 0/20 (0%)**

### Accessibility AAA
- [ ] Contrast ratio minimum 7:1
- [ ] All interactive elements keyboard navigable
- [ ] ARIA labels on elements without visible text
- [x] Correct HTML landmarks (`<footer>`)
- [ ] Focus visible on all interactive elements

### HTML Semantics
- [ ] Correct heading hierarchy (no skipped levels)
- [x] Semantic elements used (`<footer>`, `<ul role="list">`)
- [ ] Images have descriptive `alt` text

### Performance
- [ ] Images use `next/image` with correct sizes
- [ ] No Cumulative Layout Shift (CLS)
- [ ] Off-viewport content lazy loaded

### SEO / AIO / GEO
- [ ] Content directly answers questions (GEO-ready)
- [ ] Schema.org implemented
- [x] Does not block indexing

### Delivery
- [ ] Unit tests added
- [x] All fields documented in table above
- [ ] Screenshots up to date
- [ ] Delivery notes written in non-technical language

## Schema.org

- **Applicable type:** `WPFooter`
- **Implemented:** ✗
- **Snippet:**

```json
{
  "@context": "https://schema.org",
  "@type": "WPFooter"
}
```

## Delivery Notes

> The Footer appears at the bottom of every page. You can edit it from **Globals → Footer** in the admin panel. Add a short brand tagline below the logo, up to 4 navigation columns (each with up to 8 links), and a contact section with an email address and a call-to-action button. Changes take effect immediately after saving.
```

- [ ] **Step 2: Take desktop screenshot with Chrome MCP**

Open `https://amerikiosks.vercel.app` at 1280×800. Scroll to the bottom. Screenshot the footer. Save as `src/Footer/desktop.png`.

- [ ] **Step 3: Take mobile screenshot with Chrome MCP**

Emulate iPhone 12 (375×812). Scroll to the bottom. Screenshot the footer. Save as `src/Footer/mobile.png`.

- [ ] **Step 4: Update completeness score**

Count `[x]` items, update `**Completeness: X/20 (X%)**`.

- [ ] **Step 5: Update `docs/blocks/README.md`**

Update the Footer row with actual completeness %.

- [ ] **Step 6: Commit**

```bash
git add src/Footer/README.md src/Footer/desktop.png src/Footer/mobile.png docs/blocks/README.md
git commit -m "docs(footer): add block documentation with screenshots"
```

---

## Task 8: Document the HighImpact Hero

**Files:**
- Create: `src/heros/HighImpact/README.md`
- Create: `src/heros/HighImpact/desktop.png`
- Create: `src/heros/HighImpact/mobile.png`

- [ ] **Step 1: Create `src/heros/HighImpact/README.md`**

Fill from `src/heros/config.ts` (highImpact fields) and `src/heros/HighImpact/index.tsx`:

```markdown
# Hero — High Impact

> Full-viewport hero section with background video (or image fallback), rich text content, and CTA links. Used as the primary above-the-fold section on the home page.

## Admin Location
- **Ruta:** `Pages → [page] → Hero → Type → High Impact`
- **Tipo:** `Hero Variant (field group on Pages collection)`

## Fields

| Campo | Tipo | Requerido | Localizado | Descripción |
|-------|------|-----------|------------|-------------|
| `type` | select | ✓ | ✗ | Hero variant: `highImpact`, `mediumImpact`, `lowImpact`, `none` |
| `richText` | richText | ✗ | ✓ | Main headline and supporting text |
| `links` | linkGroup (max 2) | ✗ | ✗ | CTA buttons |
| `media` | upload (media) | ✓ | ✗ | Background image — used as video poster and img fallback |
| `backgroundVideo` | upload (media) | ✗ | ✗ | Background video (MP4). Plays muted + looped |

## Variants

| Variante | Descripción |
|----------|-------------|
| `highImpact` | Full-viewport, dark theme, video/image background |
| `mediumImpact` | Two-column layout with image (separate component) |
| `lowImpact` | Text-only, no media (separate component) |
| `none` | No hero rendered |

## Screenshots

| Desktop (1280px) | Mobile (375px) |
|------------------|----------------|
| ![desktop](./desktop.png) | ![mobile](./mobile.png) |

## Quality Checklist

**Completeness: 0/20 (0%)**

### Accessibility AAA
- [ ] Contrast ratio minimum 7:1
- [ ] All interactive elements keyboard navigable
- [ ] ARIA labels on elements without visible text
- [x] Correct HTML landmarks (`<section>`)
- [ ] Focus visible on all interactive elements

### HTML Semantics
- [ ] Correct heading hierarchy (no skipped levels)
- [x] Semantic elements used (`<section>`, `<ul>` for actions)
- [ ] Images have descriptive `alt` text

### Performance
- [x] Images use `next/image` with correct sizes (`<Media>` component)
- [ ] No Cumulative Layout Shift (CLS)
- [ ] Off-viewport content lazy loaded

### SEO / AIO / GEO
- [ ] Content directly answers questions (GEO-ready)
- [ ] Schema.org implemented
- [x] Does not block indexing

### Delivery
- [ ] Unit tests added
- [x] All fields documented in table above
- [ ] Screenshots up to date
- [ ] Delivery notes written in non-technical language

## Schema.org

- **Applicable type:** `WebPageElement` / `ImageObject` (for media)
- **Implemented:** ✗
- **Snippet:**

```json
{
  "@context": "https://schema.org",
  "@type": "WebPageElement",
  "cssSelector": ".ak-hero-home"
}
```

## Delivery Notes

> The High Impact Hero is the large full-screen banner at the top of a page. To edit it, go to **Pages**, open the page, and scroll to the **Hero** section. Select "High Impact" from the Type dropdown. Upload a background image (used as fallback and video poster), optionally upload a background video (MP4 format), write your headline and supporting text in the rich text editor, and add up to 2 CTA buttons. Changes are saved as a draft and only go live when you click **Publish**.
```

- [ ] **Step 2: Take desktop screenshot with Chrome MCP**

Open `https://amerikiosks.vercel.app` at 1280×800. Screenshot the hero section. Save as `src/heros/HighImpact/desktop.png`.

- [ ] **Step 3: Take mobile screenshot with Chrome MCP**

Emulate iPhone 12 (375×812). Screenshot the hero. Save as `src/heros/HighImpact/mobile.png`.

- [ ] **Step 4: Update completeness score**

Count `[x]` items, update `**Completeness: X/20 (X%)**`.

- [ ] **Step 5: Update `docs/blocks/README.md`**

Update the HighImpact Hero row with actual completeness %.

- [ ] **Step 6: Commit**

```bash
git add src/heros/HighImpact/README.md src/heros/HighImpact/desktop.png src/heros/HighImpact/mobile.png docs/blocks/README.md
git commit -m "docs(hero-high-impact): add block documentation with screenshots"
```
