# Customer-service UX polish — design spec

## Context

Visual/interaction polish for the `/customer-service` flow (`SupportHub` block) and `/customer-service/request-a-refund` flow (`ClaimForm` block), found while reviewing https://amerikiosks.vercel.app/customer-service live.

## Scope

**In scope:**
- `ClaimForm`: "Previous" button missing on the first field step (step 0).
- `ClaimForm`: active/focus state on option cards (kiosk brand, payment method) falls back to the wrong color due to a nonexistent CSS variable.
- `ClaimForm`: not enough vertical space in short steps, footer sits too close.
- `SupportHub`: not enough spacing between the action buttons, and not enough spacing above the button list (a Content block was added above it in `/admin` separately — not part of this spec).

**Out of scope:**
- Any change to `SupportHub`'s Payload schema or seed data — the subtitle text is already handled via a separate Content block added in `/admin`, no code change needed for that.
- Monday.com integration (separate spec: `2026-07-22-monday-claims-integration-design.md`).

## 1. `ClaimForm` — Previous button on step 0

**File:** `src/blocks/ClaimForm/Component.tsx`

Current code only shows "Previous" when `step > 0`:

```tsx
{step > 0 && (
  <Button type="button" variant="outline" onClick={goBack}>
    Previous
  </Button>
)}
```

`goBack` (`setStep((s) => s - 1)`) already works correctly from step 0 → step -1 (intro screen) — the only issue is the button's visibility condition. Change to:

```tsx
{step >= 0 && (
  <Button type="button" variant="outline" onClick={goBack}>
    Previous
  </Button>
)}
```

No other change needed — the intro screen (`step === -1`) already renders its own "Start" button and doesn't go through this `.ak-claim-form__actions` block at all.

## 2. `ClaimForm` — accent color bug on active option cards

**File:** `src/blocks/ClaimForm/styles.css`

`--ak-color-accent` is referenced but never defined anywhere in the codebase — the real brand accent token is `--ak-accent` (`src/app/(frontend)/tokens.css:79`). Both rules below silently fall back to their second arg (`--ak-color-heading`) instead of using the brand accent color:

```css
/* current — bug */
.ak-claim-form__option-card:has(input:checked) {
  --_accent: var(--ak-color-accent, var(--ak-color-heading));
  ...
}
.ak-claim-form__option-card:has(input:focus-visible) {
  --_accent: var(--ak-color-accent, var(--ak-color-heading));
  ...
}
```

Fix — swap `--ak-color-accent` for `--ak-accent` in both rules:

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

This affects both the kiosk-brand step and the payment-method step (both share `.ak-claim-form__option-card`).

## 3. `ClaimForm` — more vertical space so the footer doesn't crowd the form

**File:** `src/blocks/ClaimForm/styles.css`

Add `min-height` to the block's outer container so short steps (e.g. a single select field) still reserve enough vertical space before the footer:

```css
.ak-claim-form {
  max-width: 32rem;
  margin-inline: auto;
  padding: var(--bp-space-8, 2rem) var(--bp-space-6, 1.5rem);
  min-height: 60vh;
  text-align: center;
}
```

## 4. `SupportHub` — more spacing between buttons and above the list

**File:** `src/blocks/SupportHub/styles.css`

```css
/* current */
.ak-support-hub {
  padding: var(--bp-space-12, 3rem) var(--bp-space-6, 1.5rem);
}

.ak-support-hub__list {
  display: flex;
  flex-direction: column;
  gap: var(--bp-space-3, 0.75rem);
  ...
}
```

Change to asymmetric top padding (more breathing room from whatever's above, e.g. the Content block added in `/admin`) and a larger gap between buttons:

```css
.ak-support-hub {
  padding: var(--bp-space-16, 4rem) var(--bp-space-6, 1.5rem) var(--bp-space-12, 3rem);
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

## Post-implementation

Manual verification in the browser (no schema/data changes, so no `generate:types`/seed step needed):
- `/customer-service/request-a-refund`: confirm "Previous" appears on the very first step and returns to the intro screen; select a kiosk brand / payment method and confirm the active state now shows the brand accent color (coral), not a dark/neutral fallback; confirm the page doesn't feel footer-cramped on a short step (e.g. `claimReason`, a single `<select>`).
- `/customer-service`: confirm more visual breathing room above and between the four action buttons.
