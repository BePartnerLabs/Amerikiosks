# Remove Tailwind from Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove Tailwind CSS from the public-facing frontend only. The Payload admin panel and its custom components keep Tailwind. Frontend components will have classNames stripped to `""` as TODOs for BPL Design System migration.

**Architecture:** Tailwind stays installed (admin needs it). The frontend gets its own `frontend.css` that imports only Material Symbols and a minimal reset — no Tailwind directives. All `className` strings in frontend components are replaced with `""`. Admin components (`BeforeDashboard`, `MaterialIconPicker`, `SeedButton`, `src/components/ui/`) are untouched.

**Tech Stack:** Next.js 16, Payload CMS 3, pnpm, TailwindCSS v4

---

## Scope

### Strip classNames (frontend only)
```
src/app/(frontend)/[locale]/layout.tsx
src/app/(frontend)/[locale]/**/*.tsx
src/Header/
src/Footer/
src/blocks/          ← except Form blocks (admin uses these)
src/heros/
src/components/Card/
src/components/CollectionArchive/
src/components/LanguageSwitcher/
src/components/Link/
src/components/Logo/
src/components/Media/
src/components/PageRange/
src/components/Pagination/
src/components/RichText/
src/search/Component.tsx
```

### Keep Tailwind untouched (admin)
```
src/app/(payload)/
src/components/ui/           ← shadcn — admin uses these
src/components/AdminBar/
src/components/BeforeDashboard/
src/components/MaterialIconPicker/
src/blocks/Form/             ← used in admin forms
```

---

## Files Modified

| File | Change |
|---|---|
| `src/app/(frontend)/[locale]/layout.tsx` | Replace `globals.css` import with `frontend.css` |
| `src/app/(frontend)/frontend.css` | New file: Material Symbols + minimal reset only |
| `src/app/(frontend)/globals.css` | Keep as-is (Tailwind stays for admin) |
| All frontend `*.tsx` in scope above | Replace `className="..."` and `className={cn(...)}` with `className=""` |

---

## Task 1: Create frontend.css and wire it to the frontend layout

**Files:**
- Create: `src/app/(frontend)/frontend.css`
- Modify: `src/app/(frontend)/[locale]/layout.tsx`

- [ ] **Step 1: Create frontend.css**

Create `src/app/(frontend)/frontend.css` with:

```css
/* frontend.css — no Tailwind. TODO: add BPL DS tokens here */
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; }
img { max-width: 100%; display: block; }

.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  direction: ltr;
  font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 2: Update layout.tsx to import frontend.css instead of globals.css**

In `src/app/(frontend)/[locale]/layout.tsx`, find:

```ts
import '../globals.css'
```

Replace with:

```ts
import '../frontend.css'
```

- [ ] **Step 3: TypeScript check**

```bash
cd /Users/bepartnerlabs/Projects/BePartnerLabs/clients/Amerikiosks/website/amerikiosks
pnpm tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(frontend\)/frontend.css src/app/\(frontend\)/\[locale\]/layout.tsx
git commit -m "chore: add frontend.css without Tailwind, wire to frontend layout"
```

---

## Task 2: Strip classNames from frontend pages

**Files:**
- `src/app/(frontend)/[locale]/layout.tsx`
- `src/app/(frontend)/[locale]/page.tsx`
- `src/app/(frontend)/[locale]/not-found.tsx`
- `src/app/(frontend)/[locale]/[slug]/page.tsx`
- `src/app/(frontend)/[locale]/posts/page.tsx`
- `src/app/(frontend)/[locale]/posts/[slug]/page.tsx`
- `src/app/(frontend)/[locale]/posts/page/[pageNumber]/page.tsx`
- `src/app/(frontend)/[locale]/search/page.tsx`

- [ ] **Step 1: Strip static classNames from frontend pages**

```bash
cd /Users/bepartnerlabs/Projects/BePartnerLabs/clients/Amerikiosks/website/amerikiosks
find "src/app/(frontend)" -name "*.tsx" | xargs sed -i '' 's/className="[^"]*"/className=""/g'
```

- [ ] **Step 2: Strip dynamic className expressions in frontend pages**

Check for remaining dynamic classNames:

```bash
grep -rn "className={" "src/app/(frontend)" --include="*.tsx"
```

For each result, replace with `className=""`.

- [ ] **Step 3: TypeScript check**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add "src/app/(frontend)"
git commit -m "chore: strip Tailwind classNames from frontend pages (TODO: BPL DS)"
```

---

## Task 3: Strip classNames from Header and Footer

**Files:**
- `src/Header/Component.client.tsx`
- `src/Header/Nav/index.tsx`
- `src/Header/Nav/MegaMenu.tsx`
- `src/Footer/Component.tsx`

Note: Keep all `style={{...}}` inline props — these carry real visual logic (colors, layout) and are not Tailwind.

- [ ] **Step 1: Strip static classNames**

```bash
cd /Users/bepartnerlabs/Projects/BePartnerLabs/clients/Amerikiosks/website/amerikiosks
find src/Header src/Footer -name "*.tsx" | xargs sed -i '' 's/className="[^"]*"/className=""/g'
```

- [ ] **Step 2: Strip dynamic className expressions**

```bash
grep -rn "className={" src/Header src/Footer --include="*.tsx"
```

For each result replace with `className=""`. Keep `style={{...}}` untouched.

- [ ] **Step 3: TypeScript check**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Verify site still renders**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
```

Expected: `200`

- [ ] **Step 5: Commit**

```bash
git add src/Header src/Footer
git commit -m "chore: strip Tailwind classNames from Header and Footer (TODO: BPL DS)"
```

---

## Task 4: Strip classNames from blocks and heros

**Files:**
- `src/blocks/ArchiveBlock/Component.tsx`
- `src/blocks/Banner/Component.tsx`
- `src/blocks/CallToAction/Component.tsx`
- `src/blocks/Code/Component.client.tsx`
- `src/blocks/Code/Component.tsx`
- `src/blocks/Code/CopyButton.tsx`
- `src/blocks/Content/Component.tsx`
- `src/blocks/MediaBlock/Component.tsx`
- `src/blocks/RelatedPosts/Component.tsx`
- `src/blocks/RenderBlocks.tsx`
- `src/heros/HighImpact/index.tsx`
- `src/heros/LowImpact/index.tsx`
- `src/heros/MediumImpact/index.tsx`
- `src/heros/PostHero/index.tsx`

Do NOT touch `src/blocks/Form/` — the form blocks are used in the admin.

- [ ] **Step 1: Strip static classNames from blocks (excluding Form)**

```bash
cd /Users/bepartnerlabs/Projects/BePartnerLabs/clients/Amerikiosks/website/amerikiosks
find src/blocks -name "*.tsx" -not -path "*/Form/*" | xargs sed -i '' 's/className="[^"]*"/className=""/g'
find src/heros -name "*.tsx" | xargs sed -i '' 's/className="[^"]*"/className=""/g'
```

- [ ] **Step 2: Strip dynamic className expressions**

```bash
grep -rn "className={" src/blocks src/heros --include="*.tsx" | grep -v "/Form/"
```

Replace each with `className=""`.

- [ ] **Step 3: TypeScript check**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add src/blocks src/heros
git commit -m "chore: strip Tailwind classNames from blocks and heros (TODO: BPL DS)"
```

---

## Task 5: Strip classNames from shared frontend components

**Files:**
- `src/components/Card/index.tsx`
- `src/components/CollectionArchive/index.tsx`
- `src/components/LanguageSwitcher/index.tsx`
- `src/components/Link/index.tsx`
- `src/components/Logo/Logo.tsx`
- `src/components/Media/ImageMedia/index.tsx`
- `src/components/Media/index.tsx`
- `src/components/Media/VideoMedia/index.tsx`
- `src/components/PageRange/index.tsx`
- `src/components/Pagination/index.tsx`
- `src/components/RichText/index.tsx`
- `src/search/Component.tsx`

Do NOT touch: `src/components/ui/`, `src/components/AdminBar/`, `src/components/BeforeDashboard/`, `src/components/MaterialIconPicker/`.

- [ ] **Step 1: Strip static classNames**

```bash
cd /Users/bepartnerlabs/Projects/BePartnerLabs/clients/Amerikiosks/website/amerikiosks
for f in \
  src/components/Card/index.tsx \
  src/components/CollectionArchive/index.tsx \
  src/components/LanguageSwitcher/index.tsx \
  src/components/Link/index.tsx \
  src/components/Logo/Logo.tsx \
  "src/components/Media/ImageMedia/index.tsx" \
  src/components/Media/index.tsx \
  "src/components/Media/VideoMedia/index.tsx" \
  src/components/PageRange/index.tsx \
  src/components/Pagination/index.tsx \
  src/components/RichText/index.tsx \
  src/search/Component.tsx; do
  sed -i '' 's/className="[^"]*"/className=""/g' "$f"
done
```

- [ ] **Step 2: Strip dynamic className expressions**

```bash
grep -rn "className={" \
  src/components/Card \
  src/components/CollectionArchive \
  src/components/LanguageSwitcher \
  src/components/Link \
  src/components/Logo \
  src/components/Media \
  src/components/PageRange \
  src/components/Pagination \
  src/components/RichText \
  src/search \
  --include="*.tsx"
```

Replace each with `className=""`. Keep `style={{...}}` untouched.

- [ ] **Step 3: Remove unused cn/clsx imports from stripped files**

```bash
grep -rn "from '@/utilities/ui'\|from \"@/utilities/ui\"\|from 'clsx'\|from \"clsx\"" \
  src/components/Card \
  src/components/CollectionArchive \
  src/components/LanguageSwitcher \
  src/components/Link \
  src/components/Logo \
  src/components/Media \
  src/components/PageRange \
  src/components/Pagination \
  src/components/RichText \
  src/search \
  --include="*.tsx"
```

For each file where `cn` or `clsx` is no longer used after stripping, remove the import line.

- [ ] **Step 4: TypeScript check**

```bash
pnpm tsc --noEmit 2>&1 | head -30
```

Expected: 0 errors.

- [ ] **Step 5: Verify site still returns 200**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
```

- [ ] **Step 6: Commit**

```bash
git add src/components src/search
git commit -m "chore: strip Tailwind classNames from shared frontend components (TODO: BPL DS)"
```

---

## Task 6: Final cleanup and verification

- [ ] **Step 1: Find any remaining Tailwind references in frontend scope**

```bash
cd /Users/bepartnerlabs/Projects/BePartnerLabs/clients/Amerikiosks/website/amerikiosks
grep -rn "prose\|dark:prose\|tw-\|@apply\|container\|max-w-\|pt-\|pb-\|px-\|py-\|flex\|grid\|gap-\|text-\|bg-\|border-\|rounded" \
  "src/app/(frontend)" src/Header src/Footer src/heros \
  src/components/Card src/components/CollectionArchive \
  src/components/LanguageSwitcher src/components/Link src/components/Logo \
  src/components/Media src/components/PageRange src/components/Pagination \
  src/components/RichText src/search \
  --include="*.tsx" | grep 'className=""' | head -20
```

Check: all classNames in scope should be `className=""` or absent.

- [ ] **Step 2: Verify admin still works (Tailwind intact)**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin
```

Expected: `200` or `307` redirect to login.

- [ ] **Step 3: Final TypeScript check**

```bash
pnpm tsc --noEmit 2>&1
```

Expected: 0 errors.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: finalize frontend Tailwind removal — admin unaffected, frontend ready for BPL DS"
```

---

## Done

After this plan:
- Frontend pages look unstyled (no layout, no colors beyond inline styles in Header/MegaMenu)
- Admin panel works normally with Tailwind intact
- `src/components/ui/`, `BeforeDashboard`, `MaterialIconPicker`, `Form` blocks untouched
- All stripped classNames are `""` — ready to be replaced with BPL DS tokens
