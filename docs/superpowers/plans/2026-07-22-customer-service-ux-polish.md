# Customer-service UX polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 5 UX issues found in the live `/customer-service` and `/customer-service/request-a-refund` flows: missing "Previous" button on `ClaimForm`'s first step, a broken accent-color CSS variable on its active option cards, too little vertical space before the footer, cramped button spacing on `SupportHub`, and vertically-misaligned button text on `SupportHub`.

**Architecture:** All four fixes are localized to `src/blocks/ClaimForm/Component.tsx`, `src/blocks/ClaimForm/styles.css`, and `src/blocks/SupportHub/styles.css` — no schema, seed, or data changes. Each fix is independently testable/verifiable and ships as its own commit.

**Tech Stack:** Next.js 16, React 19, Vitest + Testing Library, TailwindCSS v4 + BPL DS (`.bp-*`/`.ak-*`).

## Global Constraints

- No Payload schema changes, no `generate:types`, no seed changes — this is UI-only.
- CSS token fix must use `--ak-accent` (the real token, defined in `src/app/(frontend)/tokens.css:79`), not `--ak-color-accent` (doesn't exist anywhere in the codebase).
- Keep the existing fallback pattern (`var(--ak-accent, var(--ak-color-heading))`) — don't drop the fallback.

---

## File Structure

| File | Change |
|---|---|
| `src/blocks/ClaimForm/Component.tsx` | Show "Previous" button on step 0 too |
| `src/blocks/ClaimForm/styles.css` | Fix `--ak-color-accent` → `--ak-accent`; add `min-height` to `.ak-claim-form` |
| `src/blocks/SupportHub/styles.css` | Increase `.ak-support-hub` top padding and `.ak-support-hub__list` gap |
| `tests/unit/blocks/ClaimForm.test.tsx` | Add test for "Previous" visibility/behavior on step 0 |

---

### Task 1: Show "Previous" on the first field step

**Files:**
- Modify: `src/blocks/ClaimForm/Component.tsx`
- Test: `tests/unit/blocks/ClaimForm.test.tsx`

**Interfaces:**
- Consumes: existing `goBack` callback (`src/blocks/ClaimForm/Component.tsx:277`, `setStep((s) => s - 1)`) — unchanged.

- [ ] **Step 1: Write the failing test**

Add to `tests/unit/blocks/ClaimForm.test.tsx` (place near the other `describe` blocks, using the existing `brands` fixture and render pattern already in the file):

```tsx
describe('Previous button on the first step', () => {
  afterEach(cleanup)

  it('is visible on step 0 and returns to the intro screen', async () => {
    render(
      <ClaimFormBlock
        brands={brands}
        submitButtonLabel="Submit"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /start/i }))

    expect(await screen.findByRole('radio', { name: "Carlo's Bakery" })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /previous/i }))

    expect(await screen.findByRole('button', { name: /start/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/blocks/ClaimForm.test.tsx -t "Previous button on the first step"`
Expected: FAIL — `screen.getByRole('button', { name: /previous/i })` not found (the button doesn't render at `step === 0` today, since the condition is `step > 0`).

- [ ] **Step 3: Fix the condition in `src/blocks/ClaimForm/Component.tsx`**

Change (around line 599):

```tsx
{step > 0 && (
  <Button
    type="button"
    variant="outline"
    onClick={goBack}
  >
    Previous
  </Button>
)}
```

to:

```tsx
{step >= 0 && (
  <Button
    type="button"
    variant="outline"
    onClick={goBack}
  >
    Previous
  </Button>
)}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/blocks/ClaimForm.test.tsx -t "Previous button on the first step"`
Expected: PASS

- [ ] **Step 5: Run the full ClaimForm test file to check for regressions**

Run: `pnpm vitest run tests/unit/blocks/ClaimForm.test.tsx`
Expected: all tests pass (existing `completeAllSteps` flow uses `Next`/field interactions only, unaffected by this change)

- [ ] **Step 6: Commit**

```bash
git add src/blocks/ClaimForm/Component.tsx tests/unit/blocks/ClaimForm.test.tsx
git commit -m "fix: show Previous button on ClaimForm's first step"
```

---

### Task 2: Fix the accent-color token bug on active option cards

**Files:**
- Modify: `src/blocks/ClaimForm/styles.css`

No unit test — this is a visual CSS token fix with no DOM/behavioral assertion to make (`jsdom` doesn't compute custom-property fallback resolution the way a browser does, so a unit test here would only assert the literal string `var(--ak-accent, ...)` appears in the stylesheet, which doesn't prove correctness). Verified manually in Step 2 instead.

- [ ] **Step 1: Fix `src/blocks/ClaimForm/styles.css`**

Change (around lines 94–105):

```css
.ak-claim-form__option-card:has(input:checked) {
  --_accent: var(--ak-color-accent, var(--ak-color-heading));
  border-color: var(--_accent);
  outline: 2px solid var(--_accent);
  outline-offset: -1px;
}

.ak-claim-form__option-card:has(input:focus-visible) {
  --_accent: var(--ak-color-accent, var(--ak-color-heading));
  outline: 2px solid var(--_accent);
  outline-offset: 1px;
}
```

to:

```css
.ak-claim-form__option-card:has(input:checked) {
  --_accent: var(--ak-accent, var(--ak-color-heading));
  border-color: var(--_accent);
  outline: 2px solid var(--_accent);
  outline-offset: -1px;
}

.ak-claim-form__option-card:has(input:focus-visible) {
  --_accent: var(--ak-accent, var(--ak-color-heading));
  outline: 2px solid var(--_accent);
  outline-offset: 1px;
}
```

- [ ] **Step 2: Manual verification**

Run: `pnpm dev`, open `/customer-service/request-a-refund`, click "Start", select a kiosk brand.
Expected: the selected option card's border/outline renders in the brand accent color (coral, `--ak-accent` → `--brand-color-palette-coral-600`), not the dark heading color. Repeat on the payment-method step.

- [ ] **Step 3: Commit**

```bash
git add src/blocks/ClaimForm/styles.css
git commit -m "fix: use the real --ak-accent token on ClaimForm's active option cards"
```

---

### Task 3: Reserve vertical space in `ClaimForm` so the footer doesn't crowd it

**Files:**
- Modify: `src/blocks/ClaimForm/styles.css`

No unit test — pure layout/visual change, verified manually.

- [ ] **Step 1: Update `src/blocks/ClaimForm/styles.css`**

Change (lines 5–10):

```css
.ak-claim-form {
  max-width: 32rem;
  margin-inline: auto;
  padding: var(--bp-space-8, 2rem) var(--bp-space-6, 1.5rem);
  text-align: center;
}
```

to:

```css
.ak-claim-form {
  max-width: 32rem;
  margin-inline: auto;
  padding: var(--bp-space-8, 2rem) var(--bp-space-6, 1.5rem);
  min-height: 60vh;
  text-align: center;
}
```

- [ ] **Step 2: Manual verification**

Run: `pnpm dev`, open `/customer-service/request-a-refund`, advance to a short step (e.g. `claimReason`, a single `<select>`).
Expected: the page no longer looks footer-cramped — the block reserves at least 60% of the viewport height regardless of step content length.

- [ ] **Step 3: Commit**

```bash
git add src/blocks/ClaimForm/styles.css
git commit -m "fix: reserve min-height on ClaimForm so the footer doesn't crowd short steps"
```

---

### Task 4: More breathing room on `SupportHub`

**Files:**
- Modify: `src/blocks/SupportHub/styles.css`

No unit test — pure layout/visual change, verified manually.

- [ ] **Step 1: Update `src/blocks/SupportHub/styles.css`**

Change:

```css
.ak-support-hub {
  padding: var(--bp-space-12, 3rem) var(--bp-space-6, 1.5rem);
}

.ak-support-hub__inner {
  max-width: 32rem;
  margin-inline: auto;
  text-align: center;
}

.ak-support-hub__list {
  display: flex;
  flex-direction: column;
  gap: var(--bp-space-3, 0.75rem);
  list-style: none;
  padding: 0;
  margin: 0;
}
```

to:

```css
.ak-support-hub {
  padding: var(--bp-space-16, 4rem) var(--bp-space-6, 1.5rem) var(--bp-space-12, 3rem);
}

.ak-support-hub__inner {
  max-width: 32rem;
  margin-inline: auto;
  text-align: center;
}

.ak-support-hub__list {
  display: flex;
  flex-direction: column;
  gap: var(--bp-space-4, 1rem);
  list-style: none;
  padding: 0;
  margin: 0;
}
```

- [ ] **Step 2: Manual verification**

Run: `pnpm dev`, open `/customer-service` (with the Content block that was added above `SupportHub` in `/admin` still in place).
Expected: more visual separation between whatever sits above and the button list, and more breathing room between the four buttons themselves.

- [ ] **Step 3: Commit**

```bash
git add src/blocks/SupportHub/styles.css
git commit -m "fix: increase spacing on SupportHub's button list"
```

---

### Task 5: Fix vertical text alignment on `SupportHub` buttons

**Files:**
- Modify: `src/blocks/SupportHub/styles.css`

**Root cause:** `.ak-support-hub__link` sets `display: block`, which overrides `.bp-btn`'s own `display: inline-flex; align-items: center` (the mechanism the DS button uses to vertically center its label). With the label's `display` forced to `block` and `.bp-btn`'s fixed `height: var(--_height, var(--ak-btn-height))` (3.125rem), any label that wraps to two lines (e.g. "Chat with a live agent on WhatsApp") overflows the fixed height without being centered inside it — the visible line sits top-anchored rather than centered.

No unit test — pure layout/visual change, verified manually.

- [ ] **Step 1: Update `src/blocks/SupportHub/styles.css`**

Change:

```css
.ak-support-hub__link {
  display: block;
  width: 100%;
  text-align: center;
}
```

to:

```css
.ak-support-hub__link {
  --btn-height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: var(--ak-btn-height);
  text-align: center;
}
```

`--btn-height: auto` overrides `.bp-btn`'s own height (its public Level 2 API — see `frontend.css`'s `.bp-btn` rule) so two-line labels can grow the button instead of overflowing it; `min-height: var(--ak-btn-height)` keeps single-line buttons at their original height. `display: flex` + `align-items/justify-content: center` restores the centering that `display: block` had removed, for both single- and multi-line labels.

- [ ] **Step 2: Manual verification**

Run: `pnpm dev`, open `/customer-service`.
Expected: text in all four buttons (including the two-line "Chat with a live agent on WhatsApp") is vertically centered inside its button.

- [ ] **Step 3: Commit**

```bash
git add src/blocks/SupportHub/styles.css
git commit -m "fix: vertically center SupportHub button text, including wrapped labels"
```

---

### Task 6: Full verification

- [ ] **Step 1: Run the full unit test suite**

Run: `pnpm test:int`
Expected: all tests pass (102+ files, including the updated `ClaimForm.test.tsx`)

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: no errors

- [ ] **Step 3: DS token validation**

Run: `node scripts/validate-ds-tokens.mjs`
Expected: no violations (this plan doesn't touch any `.bp-*` selectors, only `.ak-*` block-level CSS, so this should be a no-op check)
