# Form fields: attributes + new input types — design spec

## Context

The Form block (`src/blocks/Form/`) renders forms defined via `@payloadcms/plugin-form-builder@3.86.0`. The installed plugin already ships more block-level field schemas (`text`, `textarea`, `number`, `email`, `select`, `state`, `country`, `checkbox`, `date`, `radio`, `message`, `payment`, `upload`) than this project actually renders — only 9 of them are wired up in `src/blocks/Form/fields.tsx`, and none of the text-like fields expose `placeholder` or `autocomplete` to the content editor (the plugin's own `select` block ships a `placeholder` admin field, but `src/blocks/Form/Select/index.tsx` doesn't even render it).

This spec extends the admin schema and the frontend renderers so:
- Content editors can set `placeholder` and `autocomplete` on every text-like field from `/admin`.
- Three new field types are available: `tel`, `url`, `password` (not shipped by the plugin) and `date` (shipped by the plugin but never wired to a renderer).
- A new `switch` field type is available as a toggle-styled alternative to `checkbox` (same boolean semantics, different visual), using the BPL DS `Toggle` component (`.bp-toggle`).

## Scope

**In scope:**
- `placeholder` + `autocomplete` admin fields on `text`, `textarea`, `number`, `email`, `date`, and the three new text-like types (`tel`, `url`, `password`).
- New field types: `tel`, `url`, `password`, `date`, `switch`.
- Authoring the missing `.bp-toggle` Level 1 CSS (doesn't exist in this project yet).

**Out of scope:**
- Fixing the pre-existing `Select` component ignoring its `placeholder` admin field — noted here as a known gap, not touched by this work.
- `pattern`, `min`/`max`/`step`, or any validation-attribute configuration (deferred per earlier discussion — this spec covers `placeholder` + `autocomplete` only).
- Any change to `radio`, `payment`, `upload`, `message` field rendering.

## 1. Admin schema (`src/plugins/index.ts`)

`formOverrides.fields` currently maps over the Forms collection's top-level `defaultFields` looking for `confirmationMessage`. Extend it:

1. Find the `fields` blocks-array field within `defaultFields` (the field holding the `text`/`email`/etc. block configs consumed by the form builder's block picker).
2. Map over its `blocks` array:
   - For blocks with slug `text`, `textarea`, `number`, `email`, `date`: append two fields — `placeholder` (type `text`) and `autocomplete` (type `select`, options from a shared constant — see below).
   - Append three new custom blocks, shaped like the plugin's existing `Email` block (`name`/`label` row, `width`, `required`) plus `placeholder` + `autocomplete`:
     - `tel` (slug `tel`)
     - `url` (slug `url`)
     - `password` (slug `password`)
   - Append one new custom block shaped like the plugin's existing `Checkbox` block (`name`/`label` row, `width` + `required` row, `defaultValue` checkbox labeled "checked by default"):
     - `switch` (slug `switch`)

**Shared autocomplete options constant** (used by every block above): `off`, `name`, `given-name`, `family-name`, `email`, `tel`, `organization`, `street-address`, `address-line1`, `address-line2`, `address-level2`, `address-level1`, `postal-code`, `country`, `url`, `new-password`, `bday`.

`payment: false` stays as-is; no other change to the enabled/disabled field list.

## 2. Frontend renderers (`src/blocks/Form/`)

New components, each following the existing `Email/index.tsx` pattern (label + `bp-field`/`bp-input` wrapper + `FormError`):

| Component | Native attributes |
|---|---|
| `Tel/index.tsx` | `type="tel" inputMode="tel"` |
| `Url/index.tsx` | `type="url"` |
| `Password/index.tsx` | `type="password"` |
| `Date/index.tsx` | `type="date"` |
| `Switch/index.tsx` | DS `.bp-toggle` markup (see below), not `bp-field`/`bp-input` |

`Text`, `Textarea`, `Number`, `Email`, and the four new text-like components (`Tel`, `Url`, `Password`, `Date`) all read `placeholder` and `autocomplete` from props and pass them straight through as native attributes on the `<input>`/`<textarea>` — no transformation, no fallback logic.

`Switch/index.tsx` renders the DS canonical markup verbatim:

```tsx
<label className="bp-toggle">
  <input
    className="bp-toggle__input"
    type="checkbox"
    role="switch"
    defaultChecked={defaultValue}
    id={name}
    {...register(name)}
  />
  <span className="bp-toggle__track" aria-hidden="true">
    <span className="bp-toggle__thumb" />
  </span>
  <span className="bp-toggle__label">{label}</span>
</label>
```

Register all five new types (`tel`, `url`, `password`, `date`, `switch`) in `fields.tsx`'s `fields` map.

**Types:** the installed `@payloadcms/plugin-form-builder/types` package doesn't know about the injected `placeholder`/`autocomplete` admin fields or the new block slugs. Add a local `src/blocks/Form/types.ts` with intersection types (e.g. `TextField & { placeholder?: string; autocomplete?: string }`) for the affected components, and simple local interfaces for the three brand-new blocks (`TelField`, `UrlField`, `PasswordField`, `SwitchField`) matching the admin schema shape.

## 3. `.bp-toggle` Level 1 CSS

Doesn't exist in this project yet (per the same gap the #115 migration closed for checkbox/pagination). Author it in the appropriate DS base CSS location (same place `.bp-checkbox` was added in #115) using the DS's 12 public tokens, sourced from `--bp-*` base tokens:

`--toggle-track-background`, `--toggle-track-background-checked`, `--toggle-track-radius`, `--toggle-track-width`, `--toggle-track-height`, `--toggle-thumb-background`, `--toggle-thumb-size`, `--toggle-thumb-shadow`, `--toggle-duration`, `--toggle-label-color`, `--toggle-label-gap`, `--toggle-disabled-opacity`.

No `--ak-*` Level 2 overrides unless the rendered result doesn't match Figma — compare against spec before adding any.

## 4. Post-implementation

- `pnpm generate:types` then `pnpm generate:importmap` (schema changed).
- No DB migration — form-builder fields are stored as JSON blocks on the `forms` collection, not new columns.
- Manual verification: create a test form in `/admin` using each new field type + placeholder/autocomplete, render it on a page, confirm attributes appear in the DOM and the toggle renders/behaves correctly (keyboard, checked state, DS token compliance via `scripts/validate-ds-tokens.mjs`).
