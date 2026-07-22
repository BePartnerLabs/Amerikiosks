# Forms shadcn → BPL DS Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every `src/components/ui/*` (shadcn) primitive in Form block fields, Pagination, and Search with the BPL Design System equivalent, preserving the current visual design exactly, and fix two real bugs found along the way (Email field missing `type="email"`, State/Country using the buggy Radix `Select` portal).

**Architecture:** Author the BPL DS's Level 1 base CSS (`.bp-field`, `.bp-input`, `.bp-checkbox`, `.bp-pagination`) in `frontend.css` for the first time — it doesn't exist in this project yet, only `.bp-btn` does. Layer the existing brand Level 2 overrides (`--form-input-*`, `--form-label-*`) on top in `Form/styles.css`, unchanged in value. Then swap each field component's markup from shadcn to the new DS classes, one component per task.

**Tech Stack:** React 19, react-hook-form, `@payloadcms/plugin-form-builder`, plain CSS (no Tailwind for these components going forward).

## Global Constraints

- Visual output must not change — every override in `Form/styles.css` preserves the exact current values (`--ak-input-height: 3.375rem`, `--form-label-font-weight: 700`, etc.).
- `Form/styles.css` and any file containing `.bp-*` selectors must pass `node scripts/validate-ds-tokens.mjs` — Rule 4 requires routing any `--ak-*` value through a `--_*` private var before it reaches a literal CSS property inside a `.bp-*` selector (see existing `.ak-form__field [data-slot="input"]` block for the pattern already used).
- `frontend.css` is a DS-validator "primitives file" (exempt from rules 1–4) — the new base component CSS there uses `--bp-*` tokens only, never `--ak-*`.
- `src/components/ui/button.tsx` is **not** deleted — `src/blocks/ClaimForm/Component.tsx` and `src/blocks/Code/CopyButton.tsx` still import it and are out of scope.
- Every task ends green on `npx tsc --noEmit` and `npx biome check <touched files>`; CSS tasks also pass `node scripts/validate-ds-tokens.mjs <touched files>`.

---

## Task 1: Add missing `--bp-*` base tokens

**Files:**
- Modify: `src/app/(frontend)/tokens.css` (the "DS bp-* surface mapping" block, ~line 147)

**Interfaces:**
- Produces: `--bp-color-error`, `--bp-color-success`, `--bp-font-weight-medium`, `--bp-leading-normal`, `--bp-focus-ring` — consumed by every task below that touches `.bp-input`/`.bp-checkbox`/`.bp-pagination` CSS.

- [ ] **Step 1: Add the five tokens**

Find this block in `src/app/(frontend)/tokens.css`:

```css
  /* DS bp-* surface mapping — DS components inherit these automatically */
  --bp-primary: var(--ak-accent);
  --bp-primary-fg: var(--ak-white);
  --bp-color-bg-elevated: var(--ak-white);
```

Replace it with:

```css
  /* DS bp-* surface mapping — DS components inherit these automatically */
  --bp-primary: var(--ak-accent);
  --bp-primary-fg: var(--ak-white);
  --bp-color-bg-elevated: var(--ak-white);
  --bp-color-error: var(--ak-accent);
  --bp-color-success: #2e9e72;
  --bp-font-weight-medium: 500;
  --bp-leading-normal: 1.5;
  --bp-focus-ring: 0 0 0 3px color-mix(in srgb, var(--bp-primary) 40%, transparent);
```

- [ ] **Step 2: Verify**

Run: `node scripts/validate-ds-tokens.mjs src/app/\(frontend\)/tokens.css`
Expected: `DS token validation passed (1 file(s) checked).`

- [ ] **Step 3: Commit**

```bash
git add "src/app/(frontend)/tokens.css"
git commit -m "feat: add missing bp-color-error/success, focus-ring, and typography tokens"
```

---

## Task 2: Author `.bp-field` / `.bp-input` base CSS

**Files:**
- Modify: `src/app/(frontend)/frontend.css` (insert after the `.bp-btn--dark:hover` block, before the `/* ─── Section scroll reveal ─── */` comment)

**Interfaces:**
- Consumes: `--bp-space-2/3/4`, `--bp-text-xs/sm/base`, `--bp-color-text`, `--bp-color-text-muted`, `--bp-color-bg-elevated`, `--bp-color-bg-subtle`, `--bp-color-border`, `--bp-color-error`, `--bp-font-weight-medium`, `--bp-leading-normal`, `--bp-focus-ring`, `--bp-radius-md`, `--bp-duration-fast`, `--bp-ease`, `--bp-primary` (all exist already or added in Task 1).
- Produces: `.bp-field`, `.bp-field__label`, `.bp-field__hint`, `.bp-field__error`, `.bp-input` classes, consumed by every field-component task below.

Scoped down from the DS source (`internal-projects/bpl-ds/src/styles/components/input.css`): this project's forms never use the success/loading/icon states, so `.bp-field__control`/`.bp-field__icon`/`[data-state='success']`/`[aria-busy='true']` are dropped — add them back if a future field actually needs them. `<select>` is intentionally **not** styled by `.bp-input` — this project already has a more advanced native-select implementation (`ak-form__native-select`, using the Customizable Select API) reused as-is in later tasks instead.

- [ ] **Step 1: Insert the new CSS block**

Find this in `src/app/(frontend)/frontend.css`:

```css
.bp-btn--dark:hover {
  --dark-background: color-mix(
    in srgb,
    var(--ak-color-dark, var(--bp-color-text, #181715)) 85%,
    black
  );
}

/* ─── Section scroll reveal ────────────────────────────────── */
```

Replace it with:

```css
.bp-btn--dark:hover {
  --dark-background: color-mix(
    in srgb,
    var(--ak-color-dark, var(--bp-color-text, #181715)) 85%,
    black
  );
}

/* ─── DS: Field (label + input/textarea wrapper) ─────────────
   Public API: none of its own — see .bp-input below. */
.bp-field {
  display: flex;
  flex-direction: column;
  gap: var(--bp-space-2);
}

.bp-field__label {
  font-size: var(--bp-text-sm);
  font-weight: var(--bp-font-weight-medium);
  color: var(--bp-color-text);
}

.bp-field__hint {
  font-size: var(--bp-text-xs);
  color: var(--bp-color-text-muted);
}

.bp-field__error {
  font-size: var(--bp-text-xs);
  color: var(--bp-color-error);
  margin: 0;
}

/* ─── DS: Input (applies to <input> and <textarea>) ───────────
   Public API: --input-background, --input-color, --input-radius,
   --input-padding, --input-border */
.bp-input {
  --_background: var(--input-background, var(--bp-color-bg-elevated));
  --_color: var(--input-color, var(--bp-color-text));
  --_radius: var(--input-radius, var(--bp-radius-md));
  --_padding: var(--input-padding, var(--bp-space-3) var(--bp-space-4));
  --_border: var(--input-border, 1px solid var(--bp-color-border));

  display: block;
  width: 100%;
  padding: var(--_padding);
  background-color: var(--_background);
  color: var(--_color);
  border: var(--_border);
  border-radius: var(--_radius);
  font-size: var(--bp-text-base);
  line-height: var(--bp-leading-normal);
  transition: border-color var(--bp-duration-fast) var(--bp-ease);
}

.bp-input::placeholder {
  color: var(--bp-color-text-muted);
  opacity: 0.7;
}

.bp-input:hover {
  --input-border: 1px solid var(--bp-color-text-muted);
}

.bp-input:focus-visible {
  outline: none;
  box-shadow: var(--bp-focus-ring);
  --input-border: 1px solid var(--bp-primary);
}

.bp-input[aria-invalid="true"] {
  --input-border: 1px solid var(--bp-color-error);
}

.bp-input:disabled {
  cursor: not-allowed;
  background-color: var(--bp-color-bg-subtle);
  color: var(--bp-color-text-muted);
}

textarea.bp-input {
  resize: vertical;
  min-height: 6rem;
  field-sizing: content;
}

/* ─── Section scroll reveal ────────────────────────────────── */
```

- [ ] **Step 2: Verify**

Run: `node scripts/validate-ds-tokens.mjs "src/app/(frontend)/frontend.css"`
Expected: `DS token validation passed (1 file(s) checked).`

Run: `npx biome check "src/app/(frontend)/frontend.css"`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(frontend)/frontend.css"
git commit -m "feat: author bp-field/bp-input base CSS (DS Level 1)"
```

---

## Task 3: Author `.bp-checkbox` base CSS

**Files:**
- Modify: `src/app/(frontend)/frontend.css` (insert right after the `.bp-input`/textarea block added in Task 2, before `/* ─── Section scroll reveal ─── */`)

**Interfaces:**
- Consumes: same token set as Task 2, plus `--bp-radius-sm`.
- Produces: `.bp-checkbox`, `.bp-checkbox__input`, `.bp-checkbox-field`, `.bp-checkbox-field__error` — consumed by the Checkbox field task.

Scoped down from `internal-projects/bpl-ds/src/styles/components/checkbox.css`: indeterminate state and `.bp-checkbox-group`/`.bp-checkbox-group--inline` are dropped — no current field uses a checkbox group or indeterminate state. Add back if a future field needs them.

- [ ] **Step 1: Insert the new CSS block**

Insert immediately after the `textarea.bp-input { ... }` rule from Task 2 (still before `/* ─── Section scroll reveal ─── */`):

```css
/* ─── DS: Checkbox ─────────────────────────────────────────────
   Public API: --checkbox-size, --checkbox-radius, --checkbox-border,
   --checkbox-background, --checkbox-color, --checkbox-check-color,
   --checkbox-gap, --checkbox-label-color, --checkbox-error-color */
.bp-checkbox {
  --_size: var(--checkbox-size, 1.125rem);
  --_radius: var(--checkbox-radius, var(--bp-radius-sm));
  --_border: var(--checkbox-border, 1px solid var(--bp-color-border));
  --_background: var(--checkbox-background, var(--bp-color-bg-elevated));
  --_color: var(--checkbox-color, var(--bp-primary));
  --_gap: var(--checkbox-gap, var(--bp-space-2));
  --_label-color: var(--checkbox-label-color, var(--bp-color-text));

  display: inline-flex;
  align-items: center;
  gap: var(--_gap);
  cursor: pointer;
  color: var(--_label-color);
  font-size: var(--bp-text-base);
  line-height: var(--bp-leading-normal);
}

.bp-checkbox__input {
  appearance: none;
  -webkit-appearance: none;
  flex-shrink: 0;
  width: var(--_size);
  height: var(--_size);
  border: var(--_border);
  border-radius: var(--_radius);
  background-color: var(--_background);
  background-repeat: no-repeat;
  background-position: center;
  background-size: 70%;
  cursor: pointer;
  transition:
    border-color var(--bp-duration-fast) var(--bp-ease),
    background-color var(--bp-duration-fast) var(--bp-ease),
    box-shadow var(--bp-duration-fast) var(--bp-ease);
}

.bp-checkbox__input:checked {
  background-color: var(--_color);
  border-color: var(--_color);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M2 6l3 3 5-5' stroke='%23fff' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

.bp-checkbox__input:focus-visible {
  outline: none;
  box-shadow: var(--bp-focus-ring);
}

.bp-checkbox__input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bp-checkbox:has(.bp-checkbox__input:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

.bp-checkbox__input[aria-invalid="true"] {
  --checkbox-border: 1px solid var(--checkbox-error-color, var(--bp-color-error));
}

.bp-checkbox-field {
  display: flex;
  flex-direction: column;
  gap: var(--bp-space-1);
}

.bp-checkbox-field__error {
  font-size: var(--bp-text-xs);
  color: var(--checkbox-error-color, var(--bp-color-error));
  margin: 0;
}
```

- [ ] **Step 2: Verify**

Run: `node scripts/validate-ds-tokens.mjs "src/app/(frontend)/frontend.css"`
Expected: `DS token validation passed (1 file(s) checked).`

- [ ] **Step 3: Commit**

```bash
git add "src/app/(frontend)/frontend.css"
git commit -m "feat: author bp-checkbox base CSS (DS Level 1)"
```

---

## Task 4: Author `.bp-pagination` base CSS

**Files:**
- Modify: `src/app/(frontend)/frontend.css` (insert right after the checkbox block from Task 3, before `/* ─── Section scroll reveal ─── */`)

**Interfaces:**
- Consumes: same token set as Task 2, plus `--bp-color-bg`.
- Produces: `.bp-pagination`, `.bp-pagination__item`, `.bp-pagination__link`, `.bp-pagination__ellipsis` — consumed by the Pagination component task.

Note: the DS source (`pagination.css`) references `--bp-font-medium`, inconsistent with `checkbox.css`'s `--bp-font-weight-medium` for the same concept — treated as a typo in the DS source; this port uses `--bp-font-weight-medium` for consistency with the rest of this project's tokens.

- [ ] **Step 1: Insert the new CSS block**

Insert immediately after the `.bp-checkbox-field__error { ... }` rule from Task 3 (still before `/* ─── Section scroll reveal ─── */`):

```css
/* ─── DS: Pagination ───────────────────────────────────────────
   Public API: --pagination-color, --pagination-background,
   --pagination-border, --pagination-radius, --pagination-size,
   --pagination-gap */
.bp-pagination {
  --_color: var(--pagination-color, var(--bp-color-text));
  --_border: var(--pagination-border, 1px solid var(--bp-color-border));
  --_radius: var(--pagination-radius, var(--bp-radius-md));
  --_size: var(--pagination-size, 2.25rem);
  --_gap: var(--pagination-gap, var(--bp-space-1));

  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--_gap);
  list-style: none;
  margin: 0;
  padding: 0;
}

.bp-pagination__item {
  display: flex;
}

.bp-pagination__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--_size);
  min-height: var(--_size);
  padding-inline: var(--bp-space-2);
  border: var(--_border);
  border-radius: var(--_radius);
  color: var(--_color);
  text-decoration: none;
  font-size: var(--bp-text-sm);
  font-weight: var(--bp-font-weight-medium);
  background-color: transparent;
  cursor: pointer;
  transition:
    background-color var(--bp-duration-fast) var(--bp-ease),
    color var(--bp-duration-fast) var(--bp-ease),
    border-color var(--bp-duration-fast) var(--bp-ease);
}

.bp-pagination__link:hover:not([aria-current]):not([aria-disabled="true"]) {
  background-color: var(--bp-color-bg-subtle);
  border-color: var(--bp-primary);
}

.bp-pagination__link:focus-visible {
  outline: 2px solid var(--bp-primary);
  outline-offset: 2px;
}

.bp-pagination__link[aria-current="page"] {
  --pagination-background: var(--bp-primary);
  background-color: var(--pagination-background);
  color: var(--bp-color-bg);
  border-color: var(--pagination-background);
  pointer-events: none;
}

.bp-pagination__link[aria-disabled="true"] {
  opacity: 0.4;
  pointer-events: none;
  cursor: default;
}

.bp-pagination__ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--_size);
  min-height: var(--_size);
  color: var(--bp-color-text-muted);
  font-size: var(--bp-text-sm);
  user-select: none;
}
```

- [ ] **Step 2: Verify**

Run: `node scripts/validate-ds-tokens.mjs "src/app/(frontend)/frontend.css"`
Expected: `DS token validation passed (1 file(s) checked).`

- [ ] **Step 3: Commit**

```bash
git add "src/app/(frontend)/frontend.css"
git commit -m "feat: author bp-pagination base CSS (DS Level 1)"
```

---

## Task 5: Rewire `Form/styles.css` Level 2 overrides

**Files:**
- Modify: `src/blocks/Form/styles.css` (full rewrite)

**Interfaces:**
- Consumes: `.bp-field__label`, `.bp-input`, `.bp-checkbox` from Tasks 2–3.
- Produces: brand-styled `.bp-field__label`/`.bp-input`/`.bp-checkbox` scoped under `.ak-form__field`, consumed visually by every field component task below. No error-color override needed — `--bp-color-error` (Task 1) already resolves to the brand accent globally.

- [ ] **Step 1: Replace the file**

Replace the entire contents of `src/blocks/Form/styles.css` with:

```css
/* ═══════════════════════════════════════════════════════════════
   Form block — BPL DS field styling (.bp-field/.bp-input/.bp-checkbox
   from frontend.css), with brand-specific Level 2 overrides here.
   ═══════════════════════════════════════════════════════════════ */

.ak-form {
  max-width: 48rem;
  margin-inline: auto;
}

.ak-form__intro {
  margin-bottom: var(--bp-space-8, 2rem);
}

.ak-form__card {
  --_border-color: var(--ak-color-border);
  --_background: var(--ak-color-surface);
  padding: var(--bp-space-6, 1.5rem);
  border: 1px solid var(--_border-color);
  border-radius: var(--bp-radius-lg, 0.75rem);
  background-color: var(--_background);
}

.ak-form__fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--bp-space-6, 1.5rem);
  margin-bottom: var(--bp-space-6, 1.5rem);
}

.ak-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--bp-space-2, 0.5rem);
}

@media (max-width: 640px) {
  .ak-form__fields {
    grid-template-columns: 1fr;
  }

  .ak-form__field {
    grid-column: span 1;
  }
}

.ak-form__field .bp-field__label {
  --_color: var(--form-label-color, var(--ak-color-heading));
  --_font-family: var(--form-label-font-family, var(--ak-font-base));
  --_font-size: var(--form-label-font-size, var(--bp-text-xs));
  --_font-weight: var(--form-label-font-weight, 700);
  --_line-height: var(--form-label-line-height, 1.125rem);
  color: var(--_color);
  font-family: var(--_font-family);
  font-size: var(--_font-size);
  font-weight: var(--_font-weight);
  line-height: var(--_line-height);
}

.ak-form__field .bp-input {
  --_background: var(--form-input-background, var(--ak-input-background));
  --_border-color: var(--form-input-border-color, var(--ak-input-border));
  --_radius: var(--form-input-radius, var(--ak-input-radius));
  --input-background: var(--_background);
  --input-border: 1px solid var(--_border-color);
  --input-radius: var(--_radius);
}

.ak-form__field input.bp-input,
.ak-form__field select.bp-input {
  --_height: var(--form-input-height, var(--ak-input-height));
  height: var(--_height);
}

.ak-form__field .bp-checkbox {
  --_color: var(--form-label-color, var(--ak-color-heading));
  --_font-family: var(--form-label-font-family, var(--ak-font-base));
  --_font-size: var(--form-label-font-size, var(--bp-text-xs));
  --_font-weight: var(--form-label-font-weight, 700);
  --_line-height: var(--form-label-line-height, 1.125rem);
  --checkbox-label-color: var(--_color);
  font-family: var(--_font-family);
  font-size: var(--_font-size);
  font-weight: var(--_font-weight);
  line-height: var(--_line-height);
}

.ak-form__status {
  font-size: var(--bp-text-sm, 0.875rem);
  padding: var(--bp-space-3, 0.75rem);
  border-radius: var(--bp-radius, 0.625rem);
}

.ak-form__status--error {
  --_color: var(--ak-accent);
  --_background: color-mix(in srgb, var(--ak-accent) 8%, transparent);
  color: var(--_color);
  background-color: var(--_background);
}

.ak-form__loading {
  --_color: var(--ak-color-muted);
  color: var(--_color);
  font-size: var(--bp-text-sm, 0.875rem);
}

.ak-form__submit {
  --_shadow: var(--form-submit-shadow, var(--ak-surface-shadow-lg));
  box-shadow: var(--_shadow);
}

.ak-form__message-block {
  margin-block: var(--bp-space-12, 3rem);
}
```

This drops three now-dead rules from the old file: `.ak-form__field label` (bare tag selector, superseded by `.bp-field__label`), `.ak-form__checkbox-row` (superseded by `.bp-checkbox`'s own flex layout), `.ak-form__error` (superseded by `.bp-field__error`'s built-in color, which already resolves to the brand accent via `--bp-color-error` from Task 1), and `.ak-form__select-trigger` (shadcn `SelectTrigger`-specific, no longer used).

- [ ] **Step 2: Verify**

Run: `node scripts/validate-ds-tokens.mjs src/blocks/Form/styles.css`
Expected: `DS token validation passed (1 file(s) checked).`

Run: `npx biome check src/blocks/Form/styles.css`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/blocks/Form/styles.css
git commit -m "feat: rewire Form/styles.css Level 2 overrides onto DS classes"
```

---

## Task 6: Update `FormError` for `aria-describedby` wiring

**Files:**
- Modify: `src/blocks/Form/Error/index.tsx`

**Interfaces:**
- Produces: `FormError({ name, id?, className? })` — `id` matches the `aria-describedby` value each field component sets on its control; `className` defaults to `'bp-field__error'`, overridden to `'bp-checkbox-field__error'` by the Checkbox field. Consumed by every field component task below.

- [ ] **Step 1: Replace the component**

Replace the entire contents of `src/blocks/Form/Error/index.tsx` with:

```tsx
'use client'

import { useFormContext } from 'react-hook-form'

export const FormError = ({
  name,
  id,
  className = 'bp-field__error',
}: {
  name: string
  id?: string
  className?: string
}) => {
  const {
    formState: { errors },
  } = useFormContext()
  return (
    <p
      className={className}
      id={id}
      role="alert"
    >
      {(errors[name]?.message as string) || 'This field is required'}
    </p>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no new errors (existing callers still pass `name` positionally-compatible; `id`/`className` are optional so nothing breaks yet).

Run: `npx biome check src/blocks/Form/Error/index.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/blocks/Form/Error/index.tsx
git commit -m "feat: add id/className props to FormError for DS error wiring"
```

---

## Task 7: Migrate Text field

**Files:**
- Modify: `src/blocks/Form/Text/index.tsx`

**Interfaces:**
- Consumes: `FormError({ name, id, className? })` (Task 6), `Width({ children, className?, width? })` (unchanged), `.bp-field`/`.bp-field__label`/`.bp-input` (Tasks 2, 5).

- [ ] **Step 1: Replace the component**

Replace the entire contents of `src/blocks/Form/Text/index.tsx` with:

```tsx
import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { FormError } from '../Error'
import { Width } from '../Width'

export const Text: React.FC<
  TextField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => {
  const hasError = Boolean(errors[name])
  const errorId = `${name}-error`

  return (
    <Width
      width={width}
      className="bp-field"
    >
      <label
        className="bp-field__label"
        htmlFor={name}
      >
        {label}
        {required && (
          <span className="required">
            * <span className="sr-only">(required)</span>
          </span>
        )}
      </label>
      <input
        className="bp-input"
        defaultValue={defaultValue}
        id={name}
        type="text"
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        {...register(name, { required })}
      />
      {hasError && (
        <FormError
          id={errorId}
          name={name}
        />
      )}
    </Width>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx biome check src/blocks/Form/Text/index.tsx`
Expected: no errors.

Run: `npx vitest run tests/unit/blocks/Form.test.tsx`
Expected: all tests pass (the test suite's own field mock replaces `Text`, so this just confirms nothing else broke).

- [ ] **Step 3: Commit**

```bash
git add src/blocks/Form/Text/index.tsx
git commit -m "feat: migrate Text form field off shadcn to DS bp-field/bp-input"
```

---

## Task 8: Migrate Number field

**Files:**
- Modify: `src/blocks/Form/Number/index.tsx`

**Interfaces:**
- Same as Task 7.

- [ ] **Step 1: Replace the component**

Replace the entire contents of `src/blocks/Form/Number/index.tsx` with:

```tsx
import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { FormError } from '../Error'
import { Width } from '../Width'

export const FormNumber: React.FC<
  TextField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => {
  const hasError = Boolean(errors[name])
  const errorId = `${name}-error`

  return (
    <Width
      width={width}
      className="bp-field"
    >
      <label
        className="bp-field__label"
        htmlFor={name}
      >
        {label}
        {required && (
          <span className="required">
            * <span className="sr-only">(required)</span>
          </span>
        )}
      </label>
      <input
        className="bp-input"
        defaultValue={defaultValue}
        id={name}
        type="number"
        inputMode="numeric"
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        {...register(name, { required })}
      />
      {hasError && (
        <FormError
          id={errorId}
          name={name}
        />
      )}
    </Width>
  )
}
```

`inputMode="numeric"` is added alongside the already-correct `type="number"` — a small, real UX improvement (some mobile browsers respect `inputMode` more consistently than `type="number"` alone for the numeric keypad).

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx biome check src/blocks/Form/Number/index.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/blocks/Form/Number/index.tsx
git commit -m "feat: migrate Number form field off shadcn, add inputMode=numeric"
```

---

## Task 9: Migrate Email field (bug fix included)

**Files:**
- Modify: `src/blocks/Form/Email/index.tsx`

**Interfaces:**
- Same as Task 7.

- [ ] **Step 1: Replace the component**

Replace the entire contents of `src/blocks/Form/Email/index.tsx` with:

```tsx
import type { EmailField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { FormError } from '../Error'
import { Width } from '../Width'

export const Email: React.FC<
  EmailField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => {
  const hasError = Boolean(errors[name])
  const errorId = `${name}-error`

  return (
    <Width
      width={width}
      className="bp-field"
    >
      <label
        className="bp-field__label"
        htmlFor={name}
      >
        {label}
        {required && (
          <span className="required">
            * <span className="sr-only">(required)</span>
          </span>
        )}
      </label>
      <input
        className="bp-input"
        defaultValue={defaultValue}
        id={name}
        type="email"
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        {...register(name, { pattern: /^\S[^\s@]*@\S+$/, required })}
      />
      {hasError && (
        <FormError
          id={errorId}
          name={name}
        />
      )}
    </Width>
  )
}
```

The bug fix is `type="text"` → `type="email"` — the mobile email keyboard (with `@` key) now activates; the existing `pattern` validation is unchanged.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx biome check src/blocks/Form/Email/index.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/blocks/Form/Email/index.tsx
git commit -m "fix: Email form field now uses type=email (was type=text)"
```

---

## Task 10: Migrate Textarea field

**Files:**
- Modify: `src/blocks/Form/Textarea/index.tsx`

**Interfaces:**
- Same as Task 7.

- [ ] **Step 1: Replace the component**

Replace the entire contents of `src/blocks/Form/Textarea/index.tsx` with:

```tsx
import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { FormError } from '../Error'
import { Width } from '../Width'

export const Textarea: React.FC<
  TextField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
    rows?: number
  }
> = ({ name, defaultValue, errors, label, register, required, rows = 3, width }) => {
  const hasError = Boolean(errors[name])
  const errorId = `${name}-error`

  return (
    <Width
      width={width}
      className="bp-field"
    >
      <label
        className="bp-field__label"
        htmlFor={name}
      >
        {label}
        {required && (
          <span className="required">
            * <span className="sr-only">(required)</span>
          </span>
        )}
      </label>
      <textarea
        className="bp-input"
        defaultValue={defaultValue}
        id={name}
        rows={rows}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        {...register(name, { required })}
      />
      {hasError && (
        <FormError
          id={errorId}
          name={name}
        />
      )}
    </Width>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx biome check src/blocks/Form/Textarea/index.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/blocks/Form/Textarea/index.tsx
git commit -m "feat: migrate Textarea form field off shadcn to DS bp-input"
```

---

## Task 11: Migrate the generic Select field

**Files:**
- Modify: `src/blocks/Form/Select/index.tsx`

**Interfaces:**
- Same as Task 7, plus consumes the existing `ak-form__native-select` class from `src/blocks/Form/Select/select.css` (unchanged).

This field already renders a native `<select>` styled via the browser's Customizable Select API (`select.css`) — that CSS is more advanced than a generic `.bp-input` `<select>` would get, so it's kept as-is. The only shadcn touch-point here is the `Label` import.

- [ ] **Step 1: Replace the component**

Replace the entire contents of `src/blocks/Form/Select/index.tsx` with:

```tsx
import type { SelectField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { FormError } from '../Error'
import { Width } from '../Width'
import './select.css'

export const Select: React.FC<
  SelectField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, options, register, required, width }) => {
  const hasError = Boolean(errors[name])
  const errorId = `${name}-error`

  return (
    <Width
      width={width}
      className="bp-field"
    >
      <label
        className="bp-field__label"
        htmlFor={name}
      >
        {label}
        {required && (
          <span className="required">
            * <span className="sr-only">(required)</span>
          </span>
        )}
      </label>
      <select
        className="ak-form__native-select"
        defaultValue={defaultValue ?? ''}
        id={name}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        {...register(name, { required })}
      >
        <option
          disabled
          value=""
        >
          {label}
        </option>
        {options.map(({ label: optionLabel, value }) => (
          <option
            key={value}
            value={value}
          >
            {optionLabel}
          </option>
        ))}
      </select>
      {hasError && (
        <FormError
          id={errorId}
          name={name}
        />
      )}
    </Width>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx biome check src/blocks/Form/Select/index.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/blocks/Form/Select/index.tsx
git commit -m "feat: migrate generic Select form field label off shadcn"
```

---

## Task 12: Migrate State field (fixes the Radix portal bug)

**Files:**
- Modify: `src/blocks/Form/State/index.tsx`

**Interfaces:**
- Consumes: `stateOptions` from `./options` (unchanged), `ak-form__native-select` CSS from `../Select/select.css`.
- Produces: same shape as the generic Select field — `register`-based, no more `Controller`/`control`.

This is the real bug fix: the Radix shadcn `Select` portals its dropdown to `document.body`, which can render underneath a native-popover drawer's top-layer. Switching to the same native `<select>` pattern as the generic Select field removes the bug entirely and gives a better mobile UX (native OS picker for 50 states) as a side effect.

- [ ] **Step 1: Replace the component**

Replace the entire contents of `src/blocks/Form/State/index.tsx` with:

```tsx
import type { StateField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { FormError } from '../Error'
import '../Select/select.css'
import { Width } from '../Width'
import { stateOptions } from './options'

export const State: React.FC<
  StateField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => {
  const hasError = Boolean(errors[name])
  const errorId = `${name}-error`

  return (
    <Width
      width={width}
      className="bp-field"
    >
      <label
        className="bp-field__label"
        htmlFor={name}
      >
        {label}
        {required && (
          <span className="required">
            * <span className="sr-only">(required)</span>
          </span>
        )}
      </label>
      <select
        className="ak-form__native-select"
        defaultValue={defaultValue ?? ''}
        id={name}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        {...register(name, { required })}
      >
        <option
          disabled
          value=""
        >
          {label}
        </option>
        {stateOptions.map(({ label: optionLabel, value }) => (
          <option
            key={value}
            value={value}
          >
            {optionLabel}
          </option>
        ))}
      </select>
      {hasError && (
        <FormError
          id={errorId}
          name={name}
        />
      )}
    </Width>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx biome check src/blocks/Form/State/index.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/blocks/Form/State/index.tsx
git commit -m "fix: State form field — replace Radix Select (document.body portal bug) with native select"
```

---

## Task 13: Migrate Country field (fixes the same Radix portal bug)

**Files:**
- Modify: `src/blocks/Form/Country/index.tsx`

**Interfaces:**
- Same shape as Task 12, using `countryOptions` from `./options`.

- [ ] **Step 1: Replace the component**

Replace the entire contents of `src/blocks/Form/Country/index.tsx` with:

```tsx
import type { CountryField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { FormError } from '../Error'
import '../Select/select.css'
import { Width } from '../Width'
import { countryOptions } from './options'

export const Country: React.FC<
  CountryField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => {
  const hasError = Boolean(errors[name])
  const errorId = `${name}-error`

  return (
    <Width
      width={width}
      className="bp-field"
    >
      <label
        className="bp-field__label"
        htmlFor={name}
      >
        {label}
        {required && (
          <span className="required">
            * <span className="sr-only">(required)</span>
          </span>
        )}
      </label>
      <select
        className="ak-form__native-select"
        defaultValue={defaultValue ?? ''}
        id={name}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        {...register(name, { required })}
      >
        <option
          disabled
          value=""
        >
          {label}
        </option>
        {countryOptions.map(({ label: optionLabel, value }) => (
          <option
            key={value}
            value={value}
          >
            {optionLabel}
          </option>
        ))}
      </select>
      {hasError && (
        <FormError
          id={errorId}
          name={name}
        />
      )}
    </Width>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx biome check src/blocks/Form/Country/index.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/blocks/Form/Country/index.tsx
git commit -m "fix: Country form field — replace Radix Select (document.body portal bug) with native select"
```

---

## Task 14: Migrate Checkbox field

**Files:**
- Modify: `src/blocks/Form/Checkbox/index.tsx`

**Interfaces:**
- Consumes: `.bp-checkbox`/`.bp-checkbox__input`/`.bp-checkbox-field`/`.bp-checkbox-field__error` (Task 3), `FormError` with `className="bp-checkbox-field__error"` (Task 6).

The native `<input type="checkbox">` works directly with react-hook-form's `register` — the original `useFormContext`/`setValue`/`onCheckedChange` workaround existed only because Radix's `Checkbox` wasn't a real `<input>`. It's removed here.

- [ ] **Step 1: Replace the component**

Replace the entire contents of `src/blocks/Form/Checkbox/index.tsx` with:

```tsx
import type { CheckboxField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { FormError } from '../Error'
import { Width } from '../Width'

export const Checkbox: React.FC<
  CheckboxField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => {
  const hasError = Boolean(errors[name])
  const errorId = `${name}-error`

  return (
    <Width
      width={width}
      className="bp-checkbox-field"
    >
      <label className="bp-checkbox">
        <input
          className="bp-checkbox__input"
          defaultChecked={defaultValue}
          id={name}
          type="checkbox"
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          {...register(name, { required })}
        />
        {label}
        {required && (
          <span className="required">
            * <span className="sr-only">(required)</span>
          </span>
        )}
      </label>
      {hasError && (
        <FormError
          className="bp-checkbox-field__error"
          id={errorId}
          name={name}
        />
      )}
    </Width>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx biome check src/blocks/Form/Checkbox/index.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/blocks/Form/Checkbox/index.tsx
git commit -m "feat: migrate Checkbox form field off shadcn/Radix to native DS bp-checkbox"
```

---

## Task 15: Migrate the Form submit button + update the test mock

**Files:**
- Modify: `src/blocks/Form/Component.tsx`
- Modify: `tests/unit/blocks/Form.test.tsx`

**Interfaces:**
- Produces: a native `<button className="bp-btn bp-btn--dark ak-form__submit">` — same visible classes the shadcn `Button` was already forwarding, so no visual change.

- [ ] **Step 1: Remove the shadcn Button import and usage**

In `src/blocks/Form/Component.tsx`, remove this import line:

```tsx
import { Button } from '@/components/ui/button'
```

Then find:

```tsx
              <Button
                form={formID}
                type="submit"
                variant="default"
                className="bp-btn bp-btn--dark ak-form__submit"
              >
                {submitButtonLabel}
              </Button>
```

Replace it with:

```tsx
              <button
                className="bp-btn bp-btn--dark ak-form__submit"
                form={formID}
                type="submit"
              >
                {submitButtonLabel}
              </button>
```

- [ ] **Step 2: Remove the now-unnecessary test mock**

In `tests/unit/blocks/Form.test.tsx`, remove this block:

```tsx
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...rest }: React.ComponentPropsWithoutRef<'button'>) => (
    <button {...rest}>{children}</button>
  ),
}))

```

(Leave the other mocks — `next/navigation`, `@tanstack/react-query`, `@/components/RichText`, `@/blocks/Form/fields` — untouched.)

- [ ] **Step 3: Run the test**

Run: `npx vitest run tests/unit/blocks/Form.test.tsx`
Expected: all 8 tests pass, including `renders the submit button with the configured label` (now matching a real `<button>` instead of the mocked one).

- [ ] **Step 4: Verify types and lint**

Run: `npx tsc --noEmit && npx biome check src/blocks/Form/Component.tsx tests/unit/blocks/Form.test.tsx`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/blocks/Form/Component.tsx tests/unit/blocks/Form.test.tsx
git commit -m "feat: migrate Form submit button off shadcn to native bp-btn"
```

---

## Task 16: Migrate Pagination

**Files:**
- Modify: `src/components/Pagination/index.tsx`

**Interfaces:**
- Produces: same public props (`className?`, `page`, `totalPages`), same two call sites (`src/app/(frontend)/[locale]/insights/page.tsx`, `.../insights/page/[pageNumber]/page.tsx`) — no changes needed there.

Switches from `onClick` + `router.push()` (no real `href`, a secondary a11y/SEO gap) to real `<Link href>` anchors, matching the DS's `<nav><ol class="bp-pagination"><li><a>` contract. Disabled prev/next use `aria-disabled="true"` — the DS's own `.bp-pagination__link[aria-disabled="true"]` CSS (Task 4) already sets `pointer-events: none`, so `href="#"` on a disabled link is inert.

- [ ] **Step 1: Replace the component**

Replace the entire contents of `src/components/Pagination/index.tsx` with:

```tsx
import Link from 'next/link'
import type React from 'react'

export const Pagination: React.FC<{
  className?: string
  page: number
  totalPages: number
}> = ({ className, page, totalPages }) => {
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1
  const hasExtraPrevPages = page - 1 > 1
  const hasExtraNextPages = page + 1 < totalPages

  return (
    <nav
      aria-label="Pagination"
      className={className}
    >
      <ol className="bp-pagination">
        <li className="bp-pagination__item">
          <Link
            aria-disabled={!hasPrevPage}
            aria-label="Go to previous page"
            className="bp-pagination__link"
            href={hasPrevPage ? `/insights/page/${page - 1}` : '#'}
          >
            ← Prev
          </Link>
        </li>

        {hasExtraPrevPages && (
          <li className="bp-pagination__item">
            <span className="bp-pagination__ellipsis">…</span>
          </li>
        )}

        {hasPrevPage && (
          <li className="bp-pagination__item">
            <Link
              className="bp-pagination__link"
              href={`/insights/page/${page - 1}`}
            >
              {page - 1}
            </Link>
          </li>
        )}

        <li className="bp-pagination__item">
          <Link
            aria-current="page"
            className="bp-pagination__link"
            href={`/insights/page/${page}`}
          >
            {page}
          </Link>
        </li>

        {hasNextPage && (
          <li className="bp-pagination__item">
            <Link
              className="bp-pagination__link"
              href={`/insights/page/${page + 1}`}
            >
              {page + 1}
            </Link>
          </li>
        )}

        {hasExtraNextPages && (
          <li className="bp-pagination__item">
            <span className="bp-pagination__ellipsis">…</span>
          </li>
        )}

        <li className="bp-pagination__item">
          <Link
            aria-disabled={!hasNextPage}
            aria-label="Go to next page"
            className="bp-pagination__link"
            href={hasNextPage ? `/insights/page/${page + 1}` : '#'}
          >
            Next →
          </Link>
        </li>
      </ol>
    </nav>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx biome check src/components/Pagination/index.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Pagination/index.tsx
git commit -m "feat: migrate Pagination off shadcn to DS bp-pagination, use real Link hrefs"
```

---

## Task 17: Migrate Search

**Files:**
- Modify: `src/search/Component.tsx`

**Interfaces:**
- No public API change — still a bare `<Search />` component, used by `src/app/(frontend)/[locale]/search/page.tsx` unchanged.

The search input had zero brand-specific styling before (`className=""` on both `Label` and the wrapping button) — plain DS defaults are the correct outcome here, no Level 2 overrides needed.

- [ ] **Step 1: Replace the component**

Replace the entire contents of `src/search/Component.tsx` with:

```tsx
'use client'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useDebounce } from '@/utilities/useDebounce'

export const Search: React.FC = () => {
  const [value, setValue] = useState('')
  const router = useRouter()
  const t = useTranslations('search')

  const debouncedValue = useDebounce(value)

  useEffect(() => {
    router.push(`/search${debouncedValue ? `?q=${debouncedValue}` : ''}`)
  }, [debouncedValue, router])

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <div className="bp-field">
          <label
            className="bp-field__label"
            htmlFor="search"
          >
            {t('heading')}
          </label>
          <input
            className="bp-input"
            id="search"
            onChange={(event) => {
              setValue(event.target.value)
            }}
            placeholder={t('placeholder')}
          />
        </div>
        <button
          className="bp-btn"
          type="submit"
        >
          submit
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx biome check src/search/Component.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/search/Component.tsx
git commit -m "feat: migrate Search input off shadcn to DS bp-field/bp-input"
```

---

## Task 18: Delete dead shadcn files, prune dependencies, final verification

**Files:**
- Delete: `src/components/ui/input.tsx`
- Delete: `src/components/ui/label.tsx`
- Delete: `src/components/ui/textarea.tsx`
- Delete: `src/components/ui/select.tsx`
- Delete: `src/components/ui/checkbox.tsx`
- Delete: `src/components/ui/pagination.tsx`
- Modify: `package.json` (remove 3 now-unused Radix packages)
- Modify: `pnpm-lock.yaml` (regenerated by `pnpm install`)

**Interfaces:** none — this task only removes dead code and confirms the whole suite is green.

- [ ] **Step 1: Confirm no remaining consumers**

Run:
```bash
grep -rln "@/components/ui/\(input\|label\|textarea\|select\|checkbox\|pagination\)'" src --include="*.tsx" --include="*.ts"
```
Expected: no output (empty). If anything prints, stop — a consumer was missed in an earlier task; go fix that file instead of deleting.

- [ ] **Step 2: Delete the six files**

```bash
git rm src/components/ui/input.tsx src/components/ui/label.tsx src/components/ui/textarea.tsx src/components/ui/select.tsx src/components/ui/checkbox.tsx src/components/ui/pagination.tsx
```

- [ ] **Step 3: Confirm `button.tsx` is still needed and stays**

Run:
```bash
grep -rln "@/components/ui/button'" src --include="*.tsx"
```
Expected: `src/blocks/ClaimForm/Component.tsx`, `src/blocks/Code/CopyButton.tsx` (both out of scope for this migration — do not delete `button.tsx`).

- [ ] **Step 4: Confirm the Radix packages have no other consumers, then remove them**

Run:
```bash
grep -rln "@radix-ui/react-label\|@radix-ui/react-checkbox\|@radix-ui/react-select" src --include="*.tsx" --include="*.ts"
```
Expected: no output (empty).

Remove these three lines from `package.json`'s `dependencies`:
```json
    "@radix-ui/react-checkbox": "^1.3.8",
    "@radix-ui/react-label": "^2.1.12",
    "@radix-ui/react-select": "^2.3.4",
```

Then run: `pnpm install`
Expected: `pnpm-lock.yaml` updates to drop the three packages and their now-orphaned transitive deps; exit code 0.

- [ ] **Step 5: Full verification**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors (biome + `validate-ds-tokens.mjs` + `validate-no-raw-icon-image.mjs` all pass across the whole repo, not just touched files).

Run: `pnpm test:int`
Expected: all tests pass (546+ tests, same count as before this migration — no test was deleted, only the one mock in Task 15).

- [ ] **Step 6: Manual QA** (can't be automated — no browser test tooling in this repo)

- Submit `Start a Partnership Form` (or any Form block) with a required field empty — confirm the error message shows in the brand accent color and the input gets a visible red-ish border.
- Open a page with the State/Country field while a mega menu or drawer with `popover` is also open elsewhere — confirm the dropdown renders above everything correctly (this is the bug being fixed).
- On a real mobile device or Chrome DevTools device emulation, focus the Email field — confirm the `@`-key email keyboard appears (was previously the default text keyboard).
- Visit `/insights` with more than one page of results — confirm pagination links navigate correctly and the active page is visually distinct.
- Visit `/search` — confirm the input and submit button render with visible DS styling (previously unstyled).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: delete unused shadcn primitives and Radix deps after DS migration"
```
