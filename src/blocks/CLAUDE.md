# Block Documentation Guide

This guide applies to all **Layout Blocks** in `src/blocks/` and **Globals** in `src/Header/` and `src/Footer/`.

**Before writing a client component here**, check
[`docs/patterns/react-compiler.md`](../../docs/patterns/react-compiler.md) — the
React Compiler skips files silently, and hooks that return refs nested in objects
are the usual cause.

**What "done" means** is in
[`docs/business/definition-of-done.md`](../../docs/business/definition-of-done.md),
which covers the business side (who the block talks to, what it does with no
data) as well as the technical checklist below.

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
     - `data-ga-event` attribute present → GA4 Analytics item ✓
   - Leave manual items unchecked (`[ ]`) for developer review

5. **Calculate completeness score** — the rule (denominator, what the percentages mean) lives in [`docs/business/definition-of-done.md`](../../docs/business/definition-of-done.md), which is the single source. Do not restate it here.

6. **Update consolidated index**
   - Add or update a row in `docs/blocks/README.md`

## Consolidated Index Format

In `docs/blocks/README.md`, each block has one row:

```markdown
| [Block Name](../src/blocks/BlockName/README.md) | Layout Block | X% | note |
```

## CSS Variables — 3-level rule (enforced by pre-commit validator)

When writing block CSS, follow the BPL DS variable contract. The validator (`scripts/validate-ds-tokens.mjs`) runs on every CSS edit and will block commits on violations.

**Start from `_template.css`** — it has the correct patterns pre-filled.

```css
/* ✓ CORRECT — custom selector, --ak-* direct ok */
.ak-myblock__title {
  color: var(--ak-color-heading);
}

/* ✓ CORRECT — DS component override via Level 2 */
.ak-myblock .bp-card {
  --card-background: var(--ak-color-surface);
  --card-shadow: var(--ak-card-shadow);
}

/* ✓ CORRECT — Level 2 in hover state */
.ak-myblock .bp-card:hover {
  --card-shadow: var(--ak-shadow-lift);
}

/* ✗ WRONG — --ak-* as direct CSS property inside .bp-* (Rule 4) */
.ak-myblock .bp-card {
  background: var(--ak-color-surface);
}

/* ✗ WRONG — hardcoded color (Rule 2) */
.ak-myblock__title {
  color: #181715;
}
```

**The four rules are enforced by `scripts/validate-ds-tokens.mjs`.** Read them there — a copy here would drift from the code that applies them.

## Screenshot Tips

- Use `https://amerikiosks.vercel.app` after seeding, or `http://localhost:3000` locally
- Navigate to a page that contains the block (e.g., home page for Hero)
- For Header/Footer: any page works since they appear on all pages
- Crop to show only the block, not the entire page (unless the block is full-page)
