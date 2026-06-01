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
