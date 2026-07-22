# Forms shadcn → BPL DS migration — Design Spec
Date: 2026-07-22

## Goal

Replace every remaining `src/components/ui/*` (shadcn) primitive in Forms/Pagination/Search with the equivalent BPL Design System (`ds.bepartnerlabs.com`) component, preserving the current visual design exactly. This is a technical swap, not a redesign — the client already decided to standardize on the BPL DS instead of maintaining shadcn primitives in parallel.

Two real bugs get fixed as part of this pass, since they live in files already being touched:

- `Form/Email` sends `type="text"` instead of `type="email"` — mobile keyboard never adapted.
- `State`/`Country` use the Radix shadcn `Select`, which portals to `document.body` and can render underneath a native-popover drawer's top-layer — the exact bug already fixed in the generic `Select` field by switching to a native `<select>`.

## Scope

One PR, covering:

- `src/blocks/Form/Text`
- `src/blocks/Form/Email`
- `src/blocks/Form/Number`
- `src/blocks/Form/Textarea`
- `src/blocks/Form/Select` (already native `<select>` — class rename only)
- `src/blocks/Form/State`
- `src/blocks/Form/Country`
- `src/blocks/Form/Checkbox`
- `src/blocks/Form/Component.tsx` (submit button)
- `src/components/Pagination`
- `src/search/Component.tsx`

**Out of scope** (new capabilities, not shadcn replacements — deferred):
- A new "Phone" form-builder field type with `type="tel"`/`inputMode="tel"`.
- A new "Switch/Toggle" field type using the DS's `.bp-toggle`.

After this migration, `src/components/ui/{input,label,textarea,select,checkbox,button,pagination}.tsx` become dead code and should be deleted in the same PR (verify with a repo-wide grep for `@/components/ui/` before deleting each).

## DS contract (confirmed against the local `bpl-ds` repo)

- `.bp-field` wraps a label + input/textarea/select + optional `.bp-field__hint` or `.bp-field__error`. One component (`.bp-input`) styles all three native elements — no separate DS "Select" component.
- Error state: `aria-invalid="true"` on the control + `aria-describedby` pointing at the error message's `id`. CSS-only, no JS state classes.
- `.bp-checkbox` wraps a native `<input type="checkbox">` and its label text in one `<label>`. `.bp-checkbox-field` adds an error-message slot (same error pattern as `.bp-field__error`).
- `.bp-btn` — already used everywhere else in the project except the Form submit button.
- `.bp-pagination` — `<nav aria-label="Pagination"><ol class="bp-pagination"><li class="bp-pagination__item"><a class="bp-pagination__link" href="...">`. Real anchors with real `href`, not click handlers.

## Preserving the current look

Current brand values (from `src/app/(frontend)/tokens.css` and `src/blocks/Form/styles.css`) carry forward as Level 2 overrides, unchanged:

- `--ak-input-height: 3.375rem` (54px, Figma spec)
- `--ak-input-background`, `--ak-input-border`, `--ak-input-radius`
- Label: `--form-label-font-weight: 700`, `--form-label-font-size: var(--bp-text-xs)`, uppercase-adjacent small bold look
- Error color: `--ak-accent` (brand coral), not the DS default error color
- `.ak-form__submit` box-shadow override on the `.bp-btn`

`src/blocks/Form/styles.css`'s selectors move from shadcn's `[data-slot="input"]` etc. to `.bp-field .bp-input` / `.bp-field__label` / `.bp-field__error`, same override values.

## Per-component changes

### Text / Number / Email / Textarea
Markup becomes:
```html
<div class="bp-field">
  <label class="bp-field__label" for={name}>{label}{required indicator}</label>
  <input class="bp-input" type={...} aria-invalid={hasError} aria-describedby={hasError ? `${name}-error` : undefined} {...register} />
  {hasError && <p class="bp-field__error" id={`${name}-error`} role="alert">...}
</div>
```
- **Email**: `type` changes from `"text"` to `"email"`.
- **Number**: keeps `type="number"`, adds `inputMode="numeric"`.
- **Textarea**: same wrapper, `<textarea class="bp-input">`.

### Select (generic form-builder dropdown)
Already a native `<select>` (see `Form/Select/index.tsx` + `select.css`, using the Customizable Select API). Only the wrapping/label markup changes to `.bp-field`; the `<select>` itself keeps its existing `appearance: base-select` styling and `ak-form__native-select` → renamed/merged into `.bp-input` custom-select CSS (Level 2 override, same visual result).

### State / Country
Replace the `Controller` + Radix `Select`/`SelectTrigger`/`SelectContent`/`SelectItem` with a plain native `<select class="bp-input">` registered via `register(name, { required })` (same `react-hook-form` pattern the other native-select fields use) instead of `Controller`. `stateOptions`/`countryOptions` data files are untouched — just mapped to `<option>` tags like the generic `Select` field already does.

### Checkbox
```html
<div class="bp-checkbox-field">
  <label class="bp-checkbox">
    <input class="bp-checkbox__input" type="checkbox" {...register} />
    {label}
  </label>
  {hasError && <p class="bp-field__error" role="alert">...}
</div>
```

### Form submit button (`Form/Component.tsx`)
Drop the `Button` import from `@/components/ui/button`; render a native `<button type="submit" class="bp-btn">`, keeping the existing `.ak-form__submit` box-shadow override class alongside it.

### Pagination
Swap to the DS's `<nav><ol class="bp-pagination"><li class="bp-pagination__item">` structure. Replace the current `onClick` + `router.push()` navigation with real `<Link href={...}>` anchors (`aria-current="page"` on the active one) — fixes a secondary a11y/SEO gap (no real `href` today) while doing the markup swap anyway.

### Search (`src/search/Component.tsx`)
Same `.bp-field`/`.bp-input` wrapper as the Text field, applied to the single search input + its label.

## Testing

- `tests/unit/blocks/Form.test.tsx` mocks `@/components/ui/button` — remove that mock (submit button becomes a real `<button>`, no mocking needed) and verify the existing `getByRole('button', { name: ... })` assertion still passes.
- No other per-field-component unit tests exist today — low regression surface. Run the full `pnpm test:int` suite plus manual checks: submit a form with a validation error (confirm `aria-invalid`/error text), open State/Country dropdowns on a page where a popover/drawer is also present (confirms the portal-bug fix), and paginate the Insights listing.
- `node scripts/validate-ds-tokens.mjs` must stay clean (no `--ak-*` used as a direct property inside `.bp-*` selectors, etc.).

## Cleanup

Once every consumer is migrated, delete `src/components/ui/{input,label,textarea,select,checkbox,button,pagination}.tsx` (and their now-unused Radix/shadcn npm dependencies if nothing else in the repo imports them — grep first).
