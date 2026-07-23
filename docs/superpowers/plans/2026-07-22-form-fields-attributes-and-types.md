# Form fields: attributes + new input types Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let content editors configure `placeholder`/`autocomplete` on text-like form fields from `/admin`, and add `tel`, `url`, `password`, `date`, `switch` as new form-builder field types with working frontend renderers.

**Architecture:** Extend `formBuilderPlugin`'s `formOverrides.fields` in `src/plugins/index.ts` to inject `placeholder`/`autocomplete` admin fields onto existing block schemas and append new block schemas for `tel`/`url`/`password`/`switch` (the plugin's `date` block schema already exists — it's only missing a renderer). On the frontend, add/update React components in `src/blocks/Form/` that read those props and pass them through as native HTML attributes, then register the 5 new types in `src/blocks/Form/fields.tsx`. `switch` needs new `.bp-toggle` Level 1 CSS in `frontend.css` since it doesn't exist in this project yet.

**Tech Stack:** Next.js 16, Payload CMS 3.82 (`@payloadcms/plugin-form-builder@3.86.0`), React 19, `react-hook-form`, Vitest + Testing Library, TailwindCSS v4 + BPL DS (`.bp-*`).

## Global Constraints

- `placeholder` + `autocomplete` only — no `pattern`/`min`/`max`/`step` (spec explicitly excludes these).
- Autocomplete admin control is a `select` with a fixed shared option list (not free text): `off`, `name`, `given-name`, `family-name`, `email`, `tel`, `organization`, `street-address`, `address-line1`, `address-line2`, `address-level2`, `address-level1`, `postal-code`, `country`, `url`, `new-password`, `bday`.
- New field types: `tel`, `url`, `password`, `date`, `switch`. `date`'s admin schema already ships with the plugin — only its renderer and the `placeholder`/`autocomplete` injection are new.
- `switch` uses the DS `Toggle` component verbatim markup (`.bp-toggle` / `.bp-toggle__input` / `.bp-toggle__track` / `.bp-toggle__thumb` / `.bp-toggle__label`), `role="switch"` on the input. Same boolean semantics as `checkbox`.
- `.bp-toggle` Level 1 CSS must be authored in `src/app/(frontend)/frontend.css` (where `.bp-checkbox`/`.bp-input` already live), using only the 12 DS public tokens: `--toggle-track-background`, `--toggle-track-background-checked`, `--toggle-track-radius`, `--toggle-track-width`, `--toggle-track-height`, `--toggle-thumb-background`, `--toggle-thumb-size`, `--toggle-thumb-shadow`, `--toggle-duration`, `--toggle-label-color`, `--toggle-label-gap`, `--toggle-disabled-opacity` — each falling back to a `--bp-*` base token. No `--ak-*` used directly inside `.bp-toggle*` selectors (3-level CSS variable rule, enforced by `scripts/validate-ds-tokens.mjs` pre-commit).
- `payment: false` in `formBuilderPlugin({ fields: ... })` stays unchanged.
- Not in scope: fixing `Select`'s pre-existing unused `placeholder` admin field.
- After all schema changes: run `pnpm generate:types` then `pnpm generate:importmap`.

---

## File Structure

| File | Change |
|---|---|
| `src/plugins/index.ts` | Extend `formOverrides.fields` to inject `placeholder`/`autocomplete` on existing blocks and append `tel`/`url`/`password`/`switch` blocks |
| `src/blocks/Form/types.ts` | **New** — shared intersection types (`TextFieldWithAttrs`, `TelField`, `UrlField`, `PasswordField`, `SwitchField`) |
| `src/blocks/Form/Text/index.tsx`, `Textarea/index.tsx`, `Number/index.tsx`, `Email/index.tsx` | Add `placeholder`/`autocomplete` pass-through |
| `src/blocks/Form/Tel/index.tsx` | **New** |
| `src/blocks/Form/Url/index.tsx` | **New** |
| `src/blocks/Form/Password/index.tsx` | **New** |
| `src/blocks/Form/Date/index.tsx` | **New** |
| `src/blocks/Form/Switch/index.tsx` | **New** |
| `src/blocks/Form/fields.tsx` | Register `tel`/`url`/`password`/`date`/`switch` |
| `src/app/(frontend)/frontend.css` | Add `.bp-toggle*` Level 1 CSS |
| `tests/unit/blocks/Form/*.test.tsx` | **New** — one test file per new/modified field component |
| `tests/unit/plugins/formFieldOverrides.test.ts` | **New** — unit test for the `formOverrides.fields` mapping function |

---

### Task 1: Extract and test the form field admin-schema override function

**Files:**
- Modify: `src/plugins/index.ts`
- Test: `tests/unit/plugins/formFieldOverrides.test.ts`

**Interfaces:**
- Produces: `export const AUTOCOMPLETE_OPTIONS: { label: string; value: string }[]` and `export function buildFormFieldsOverride(defaultFields: unknown[]): unknown[]` — both exported from `src/plugins/index.ts` so the test can import them directly and later tasks can extend `buildFormFieldsOverride`.

Currently `formOverrides.fields` is an inline arrow function only doing the `confirmationMessage` lexical-editor swap. Pull the "find the `fields` blocks array field and rewrite its blocks" logic into a named, exported function so it's independently testable, and call it from the existing `fields` override alongside the current `confirmationMessage` logic.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/plugins/formFieldOverrides.test.ts
import { describe, expect, it } from 'vitest'
import { AUTOCOMPLETE_OPTIONS, buildFormFieldsOverride } from '@/plugins/index'

const baseBlock = (slug: string, extraFieldNames: string[] = []) => ({
  slug,
  fields: [
    { name: 'name', type: 'text' },
    { name: 'label', type: 'text' },
    { name: 'width', type: 'number' },
    ...extraFieldNames.map((name) => ({ name, type: 'text' })),
  ],
})

const fieldsBlocksField = {
  name: 'fields',
  type: 'blocks',
  blocks: [baseBlock('text'), baseBlock('textarea'), baseBlock('number'), baseBlock('email')],
}

describe('buildFormFieldsOverride', () => {
  it('adds placeholder and autocomplete fields to text-like blocks', () => {
    const result = buildFormFieldsOverride([fieldsBlocksField]) as {
      name: string
      blocks: { slug: string; fields: { name: string }[] }[]
    }[]
    const fieldsField = result.find((f) => f.name === 'fields')!
    const textBlock = fieldsField.blocks.find((b) => b.slug === 'text')!
    const fieldNames = textBlock.fields.map((f) => f.name)
    expect(fieldNames).toContain('placeholder')
    expect(fieldNames).toContain('autocomplete')
  })

  it('leaves non-text-like blocks (e.g. message) untouched', () => {
    const messageBlocksField = {
      name: 'fields',
      type: 'blocks',
      blocks: [{ slug: 'message', fields: [{ name: 'message', type: 'richText' }] }],
    }
    const result = buildFormFieldsOverride([messageBlocksField]) as {
      name: string
      blocks: { slug: string; fields: { name: string }[] }[]
    }[]
    const fieldsField = result.find((f) => f.name === 'fields')!
    const messageBlock = fieldsField.blocks.find((b) => b.slug === 'message')!
    expect(messageBlock.fields.map((f) => f.name)).toEqual(['message'])
  })

  it('exposes the shared autocomplete option list with an "off" default option', () => {
    expect(AUTOCOMPLETE_OPTIONS[0]).toEqual({ label: 'Off', value: 'off' })
    expect(AUTOCOMPLETE_OPTIONS.map((o) => o.value)).toContain('email')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/plugins/formFieldOverrides.test.ts`
Expected: FAIL — `buildFormFieldsOverride` is not exported from `@/plugins/index` (module has no such export).

- [ ] **Step 3: Implement `buildFormFieldsOverride` and `AUTOCOMPLETE_OPTIONS` in `src/plugins/index.ts`**

Add near the top of the file, after the existing imports:

```ts
export const AUTOCOMPLETE_OPTIONS = [
  { label: 'Off', value: 'off' },
  { label: 'Full name', value: 'name' },
  { label: 'First name', value: 'given-name' },
  { label: 'Last name', value: 'family-name' },
  { label: 'Email', value: 'email' },
  { label: 'Phone', value: 'tel' },
  { label: 'Organization', value: 'organization' },
  { label: 'Street address', value: 'street-address' },
  { label: 'Address line 1', value: 'address-line1' },
  { label: 'Address line 2', value: 'address-line2' },
  { label: 'City', value: 'address-level2' },
  { label: 'State/Province', value: 'address-level1' },
  { label: 'Postal code', value: 'postal-code' },
  { label: 'Country', value: 'country' },
  { label: 'URL', value: 'url' },
  { label: 'New password', value: 'new-password' },
  { label: 'Birthday', value: 'bday' },
]

const TEXT_LIKE_BLOCK_SLUGS = ['text', 'textarea', 'number', 'email', 'date', 'tel', 'url', 'password']

const withPlaceholderAndAutocomplete = (block: { slug: string; fields: unknown[] }) => {
  if (!TEXT_LIKE_BLOCK_SLUGS.includes(block.slug)) return block
  return {
    ...block,
    fields: [
      ...block.fields,
      {
        name: 'placeholder',
        type: 'text',
        label: 'Placeholder',
      },
      {
        name: 'autocomplete',
        type: 'select',
        label: 'Autocomplete',
        defaultValue: 'off',
        options: AUTOCOMPLETE_OPTIONS,
      },
    ],
  }
}

export function buildFormFieldsOverride(defaultFields: unknown[]): unknown[] {
  return defaultFields.map((field) => {
    const f = field as { name?: string; blocks?: { slug: string; fields: unknown[] }[] }
    if (f.name === 'fields' && Array.isArray(f.blocks)) {
      return { ...f, blocks: f.blocks.map(withPlaceholderAndAutocomplete) }
    }
    return field
  })
}
```

- [ ] **Step 4: Wire it into `formBuilderPlugin`'s `formOverrides.fields`**

In the existing `formBuilderPlugin({...})` call, change:

```ts
formOverrides: {
  fields: ({ defaultFields }) => {
    return defaultFields.map((field) => {
      if ('name' in field && field.name === 'confirmationMessage') {
        return {
          ...field,
          editor: lexicalEditor({
            features: ({ rootFeatures }) => {
              return [
                ...rootFeatures,
                FixedToolbarFeature(),
                HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
              ]
            },
          }),
        }
      }
      return field
    })
  },
},
```

to:

```ts
formOverrides: {
  fields: ({ defaultFields }) => {
    const withConfirmationEditor = defaultFields.map((field) => {
      if ('name' in field && field.name === 'confirmationMessage') {
        return {
          ...field,
          editor: lexicalEditor({
            features: ({ rootFeatures }) => {
              return [
                ...rootFeatures,
                FixedToolbarFeature(),
                HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
              ]
            },
          }),
        }
      }
      return field
    })
    // @ts-expect-error - buildFormFieldsOverride works on the generic blocks shape, not Payload's mapped Field union
    return buildFormFieldsOverride(withConfirmationEditor)
  },
},
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/plugins/formFieldOverrides.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add src/plugins/index.ts tests/unit/plugins/formFieldOverrides.test.ts
git commit -m "feat: inject placeholder/autocomplete admin fields into text-like form blocks"
```

---

### Task 2: Add `tel`, `url`, `password`, `switch` block schemas to the admin

**Files:**
- Modify: `src/plugins/index.ts`
- Test: `tests/unit/plugins/formFieldOverrides.test.ts`

**Interfaces:**
- Consumes: `AUTOCOMPLETE_OPTIONS`, `buildFormFieldsOverride` from Task 1.
- Produces: `buildFormFieldsOverride` now also appends 4 new blocks (`tel`, `url`, `password`, `switch`) to any `fields`-blocks-array field it's given.

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/plugins/formFieldOverrides.test.ts`:

```ts
describe('buildFormFieldsOverride — new block types', () => {
  it('adds tel, url, password, and switch blocks alongside the defaults', () => {
    const result = buildFormFieldsOverride([fieldsBlocksField]) as {
      name: string
      blocks: { slug: string; fields: { name: string }[] }[]
    }[]
    const fieldsField = result.find((f) => f.name === 'fields')!
    const slugs = fieldsField.blocks.map((b) => b.slug)
    expect(slugs).toEqual(
      expect.arrayContaining(['text', 'textarea', 'number', 'email', 'tel', 'url', 'password', 'switch']),
    )
  })

  it('tel/url/password blocks expose name, label, width, required, placeholder, and autocomplete', () => {
    const result = buildFormFieldsOverride([fieldsBlocksField]) as {
      name: string
      blocks: { slug: string; fields: { name: string }[] }[]
    }[]
    const fieldsField = result.find((f) => f.name === 'fields')!
    for (const slug of ['tel', 'url', 'password']) {
      const block = fieldsField.blocks.find((b) => b.slug === slug)!
      const fieldNames = block.fields.map((f) => f.name)
      expect(fieldNames).toEqual(
        expect.arrayContaining(['name', 'label', 'width', 'required', 'placeholder', 'autocomplete']),
      )
    }
  })

  it('switch block exposes name, label, width, required, and defaultValue (checked by default)', () => {
    const result = buildFormFieldsOverride([fieldsBlocksField]) as {
      name: string
      blocks: { slug: string; fields: { name: string }[] }[]
    }[]
    const fieldsField = result.find((f) => f.name === 'fields')!
    const switchBlock = fieldsField.blocks.find((b) => b.slug === 'switch')!
    expect(switchBlock.fields.map((f) => f.name)).toEqual(
      expect.arrayContaining(['name', 'label', 'width', 'required', 'defaultValue']),
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/plugins/formFieldOverrides.test.ts`
Expected: FAIL — new slugs (`tel`, `url`, `password`, `switch`) not present in the returned `blocks` array.

- [ ] **Step 3: Implement the new blocks in `src/plugins/index.ts`**

Add below `withPlaceholderAndAutocomplete`:

```ts
const textLikeCustomBlock = (slug: string, label: string) => ({
  slug,
  labels: { singular: label, plural: `${label}s` },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
    { name: 'label', type: 'text', localized: true, admin: { width: '50%' } },
    { name: 'width', type: 'number', label: 'Field width' },
    { name: 'required', type: 'checkbox', label: 'Required' },
    { name: 'placeholder', type: 'text', label: 'Placeholder' },
    {
      name: 'autocomplete',
      type: 'select',
      label: 'Autocomplete',
      defaultValue: 'off',
      options: AUTOCOMPLETE_OPTIONS,
    },
  ],
})

const SWITCH_BLOCK = {
  slug: 'switch',
  labels: { singular: 'Switch', plural: 'Switches' },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
    { name: 'label', type: 'text', localized: true, admin: { width: '50%' } },
    { name: 'width', type: 'number', label: 'Field width', admin: { width: '50%' } },
    { name: 'required', type: 'checkbox', label: 'Required', admin: { width: '50%' } },
    { name: 'defaultValue', type: 'checkbox', label: 'Checked by default' },
  ],
}

const NEW_TEXT_LIKE_BLOCKS = [
  textLikeCustomBlock('tel', 'Phone'),
  textLikeCustomBlock('url', 'URL'),
  textLikeCustomBlock('password', 'Password'),
]
```

Then change `buildFormFieldsOverride` to append the new blocks:

```ts
export function buildFormFieldsOverride(defaultFields: unknown[]): unknown[] {
  return defaultFields.map((field) => {
    const f = field as { name?: string; blocks?: { slug: string; fields: unknown[] }[] }
    if (f.name === 'fields' && Array.isArray(f.blocks)) {
      return {
        ...f,
        blocks: [...f.blocks.map(withPlaceholderAndAutocomplete), ...NEW_TEXT_LIKE_BLOCKS, SWITCH_BLOCK],
      }
    }
    return field
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/plugins/formFieldOverrides.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/plugins/index.ts tests/unit/plugins/formFieldOverrides.test.ts
git commit -m "feat: add tel, url, password, and switch form block schemas"
```

---

### Task 3: Shared field types for the new/extended components

**Files:**
- Create: `src/blocks/Form/types.ts`

**Interfaces:**
- Produces: `TextFieldWithAttrs`, `TelFieldType`, `UrlFieldType`, `PasswordFieldType`, `SwitchFieldType` — imported by Tasks 4–7.

No test — this is a type-only file (no runtime behavior to verify); `tsc --noEmit` in Task 8's final verification covers correctness.

- [ ] **Step 1: Write the file**

```ts
// src/blocks/Form/types.ts
import type { CheckboxField, TextField } from '@payloadcms/plugin-form-builder/types'

/** TextField plus the placeholder/autocomplete admin fields injected in src/plugins/index.ts. */
export type TextFieldWithAttrs = TextField & {
  placeholder?: string
  autocomplete?: string
}

export type TelFieldType = TextFieldWithAttrs
export type UrlFieldType = TextFieldWithAttrs
export type PasswordFieldType = TextFieldWithAttrs

/** Same shape as CheckboxField — the switch block mirrors the checkbox admin schema. */
export type SwitchFieldType = CheckboxField
```

- [ ] **Step 2: Commit**

```bash
git add src/blocks/Form/types.ts
git commit -m "feat: add shared form field types for placeholder/autocomplete and switch"
```

---

### Task 4: Add placeholder/autocomplete pass-through to Text, Textarea, Number, Email

**Files:**
- Modify: `src/blocks/Form/Text/index.tsx`
- Modify: `src/blocks/Form/Textarea/index.tsx`
- Modify: `src/blocks/Form/Number/index.tsx`
- Modify: `src/blocks/Form/Email/index.tsx`
- Test: `tests/unit/blocks/Form/Text.test.tsx` (representative — same pattern applies to the other three; each gets its own test file per Step 1)

**Interfaces:**
- Consumes: `TextFieldWithAttrs` from `@/blocks/Form/types` (Task 3).

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/unit/blocks/Form/Text.test.tsx
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useForm } from 'react-hook-form'
import { Text } from '@/blocks/Form/Text'

function renderText(props: Partial<React.ComponentProps<typeof Text>> = {}) {
  function Harness() {
    const { register, formState } = useForm()
    return (
      <Text
        name="phone_label_test"
        label="Test field"
        register={register}
        errors={formState.errors}
        {...props}
      />
    )
  }
  return render(<Harness />)
}

describe('Text form field', () => {
  afterEach(cleanup)

  it('renders the placeholder attribute when provided', () => {
    renderText({ placeholder: 'Jane Doe' })
    expect(screen.getByLabelText('Test field')).toHaveAttribute('placeholder', 'Jane Doe')
  })

  it('renders the autocomplete attribute when provided', () => {
    renderText({ autocomplete: 'given-name' })
    expect(screen.getByLabelText('Test field')).toHaveAttribute('autocomplete', 'given-name')
  })

  it('omits placeholder/autocomplete attributes when not provided', () => {
    renderText()
    const input = screen.getByLabelText('Test field')
    expect(input).not.toHaveAttribute('placeholder')
    expect(input).not.toHaveAttribute('autocomplete')
  })
})
```

Repeat the same three assertions (adjusted for element/label) in:
- `tests/unit/blocks/Form/Textarea.test.tsx` (import `Textarea` from `@/blocks/Form/Textarea`)
- `tests/unit/blocks/Form/Number.test.tsx` (import `FormNumber` from `@/blocks/Form/Number`)
- `tests/unit/blocks/Form/Email.test.tsx` (import `Email` from `@/blocks/Form/Email`)

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run tests/unit/blocks/Form/Text.test.tsx tests/unit/blocks/Form/Textarea.test.tsx tests/unit/blocks/Form/Number.test.tsx tests/unit/blocks/Form/Email.test.tsx`
Expected: FAIL — `placeholder`/`autocomplete` attributes not rendered (components don't destructure or use those props yet).

- [ ] **Step 3: Update `src/blocks/Form/Text/index.tsx`**

```tsx
import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import type { TextFieldWithAttrs } from '../types'
import { FormError } from '../Error'
import { Width } from '../Width'

export const Text: React.FC<
  TextFieldWithAttrs & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, autocomplete, defaultValue, errors, label, placeholder, register, required, width }) => {
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
        autoComplete={autocomplete}
        className="bp-input"
        defaultValue={defaultValue}
        id={name}
        placeholder={placeholder}
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

- [ ] **Step 4: Update `src/blocks/Form/Textarea/index.tsx`** — same change: import `TextFieldWithAttrs`, destructure `autocomplete`/`placeholder`, add `autoComplete={autocomplete}` and `placeholder={placeholder}` to the `<textarea>`.

- [ ] **Step 5: Update `src/blocks/Form/Number/index.tsx`** — same change on the `FormNumber` component's `<input type="number">`.

- [ ] **Step 6: Update `src/blocks/Form/Email/index.tsx`** — same change on the `Email` component's `<input type="email">` (keep the existing `register(name, { pattern: ..., required })` call untouched).

- [ ] **Step 7: Run tests to verify they pass**

Run: `pnpm vitest run tests/unit/blocks/Form/Text.test.tsx tests/unit/blocks/Form/Textarea.test.tsx tests/unit/blocks/Form/Number.test.tsx tests/unit/blocks/Form/Email.test.tsx`
Expected: PASS (12 tests total)

- [ ] **Step 8: Commit**

```bash
git add src/blocks/Form/Text/index.tsx src/blocks/Form/Textarea/index.tsx src/blocks/Form/Number/index.tsx src/blocks/Form/Email/index.tsx tests/unit/blocks/Form/Text.test.tsx tests/unit/blocks/Form/Textarea.test.tsx tests/unit/blocks/Form/Number.test.tsx tests/unit/blocks/Form/Email.test.tsx
git commit -m "feat: render placeholder/autocomplete on text, textarea, number, and email form fields"
```

---

### Task 5: New Tel, Url, Password field components

**Files:**
- Create: `src/blocks/Form/Tel/index.tsx`
- Create: `src/blocks/Form/Url/index.tsx`
- Create: `src/blocks/Form/Password/index.tsx`
- Test: `tests/unit/blocks/Form/Tel.test.tsx`, `tests/unit/blocks/Form/Url.test.tsx`, `tests/unit/blocks/Form/Password.test.tsx`

**Interfaces:**
- Consumes: `TelFieldType`/`UrlFieldType`/`PasswordFieldType` from `@/blocks/Form/types` (Task 3), `FormError` from `../Error`, `Width` from `../Width`.

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/unit/blocks/Form/Tel.test.tsx
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useForm } from 'react-hook-form'
import { Tel } from '@/blocks/Form/Tel'

function renderTel(props: Partial<React.ComponentProps<typeof Tel>> = {}) {
  function Harness() {
    const { register, formState } = useForm()
    return (
      <Tel
        name="phone"
        label="Phone"
        register={register}
        errors={formState.errors}
        {...props}
      />
    )
  }
  return render(<Harness />)
}

describe('Tel form field', () => {
  afterEach(cleanup)

  it('renders a native tel input with inputMode tel', () => {
    renderTel()
    const input = screen.getByLabelText('Phone')
    expect(input).toHaveAttribute('type', 'tel')
    expect(input).toHaveAttribute('inputmode', 'tel')
  })

  it('renders placeholder and autocomplete when provided', () => {
    renderTel({ placeholder: '(555) 555-5555', autocomplete: 'tel' })
    const input = screen.getByLabelText('Phone')
    expect(input).toHaveAttribute('placeholder', '(555) 555-5555')
    expect(input).toHaveAttribute('autocomplete', 'tel')
  })
})
```

```tsx
// tests/unit/blocks/Form/Url.test.tsx — same harness shape, importing Url from '@/blocks/Form/Url'
describe('Url form field', () => {
  afterEach(cleanup)

  it('renders a native url input', () => {
    // render with name="website" label="Website"
    const input = screen.getByLabelText('Website')
    expect(input).toHaveAttribute('type', 'url')
  })
})
```

```tsx
// tests/unit/blocks/Form/Password.test.tsx — same harness shape, importing Password from '@/blocks/Form/Password'
describe('Password form field', () => {
  afterEach(cleanup)

  it('renders a native password input', () => {
    // render with name="password" label="Password"
    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('type', 'password')
  })
})
```

(Fill in the full harness boilerplate for `Url.test.tsx` and `Password.test.tsx` identically to `Tel.test.tsx`, swapping only the component import, `name`/`label`, and expected `type`.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run tests/unit/blocks/Form/Tel.test.tsx tests/unit/blocks/Form/Url.test.tsx tests/unit/blocks/Form/Password.test.tsx`
Expected: FAIL — `@/blocks/Form/Tel`, `@/blocks/Form/Url`, `@/blocks/Form/Password` don't exist yet.

- [ ] **Step 3: Create `src/blocks/Form/Tel/index.tsx`**

```tsx
import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import type { TelFieldType } from '../types'
import { FormError } from '../Error'
import { Width } from '../Width'

export const Tel: React.FC<
  TelFieldType & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, autocomplete, defaultValue, errors, label, placeholder, register, required, width }) => {
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
        autoComplete={autocomplete}
        className="bp-input"
        defaultValue={defaultValue}
        id={name}
        inputMode="tel"
        placeholder={placeholder}
        type="tel"
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

- [ ] **Step 4: Create `src/blocks/Form/Url/index.tsx`** — identical to `Tel`, but `export const Url`, `type UrlFieldType`, `type="url"`, no `inputMode`.

- [ ] **Step 5: Create `src/blocks/Form/Password/index.tsx`** — identical to `Tel`, but `export const Password`, `type PasswordFieldType`, `type="password"`, no `inputMode`. Do not spread `defaultValue` into the DOM as plaintext beyond what `TextField` already does elsewhere in this file set — keep parity with `Email`/`Text` (they already pass `defaultValue` straight to `defaultValue` on the input, which is how react-hook-form's uncontrolled pattern works here; no behavior change needed).

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm vitest run tests/unit/blocks/Form/Tel.test.tsx tests/unit/blocks/Form/Url.test.tsx tests/unit/blocks/Form/Password.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 7: Commit**

```bash
git add src/blocks/Form/Tel src/blocks/Form/Url src/blocks/Form/Password tests/unit/blocks/Form/Tel.test.tsx tests/unit/blocks/Form/Url.test.tsx tests/unit/blocks/Form/Password.test.tsx
git commit -m "feat: add tel, url, and password form field components"
```

---

### Task 6: New Date field component

**Files:**
- Create: `src/blocks/Form/Date/index.tsx`
- Test: `tests/unit/blocks/Form/Date.test.tsx`

**Interfaces:**
- Consumes: `TextFieldWithAttrs` from `@/blocks/Form/types` (the injected `placeholder`/`autocomplete` apply to `date` too, per Task 1's `TEXT_LIKE_BLOCK_SLUGS`).

- [ ] **Step 1: Write the failing test**

```tsx
// tests/unit/blocks/Form/Date.test.tsx
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useForm } from 'react-hook-form'
import { FormDate } from '@/blocks/Form/Date'

function renderDate(props: Partial<React.ComponentProps<typeof FormDate>> = {}) {
  function Harness() {
    const { register, formState } = useForm()
    return (
      <FormDate
        name="event_date"
        label="Event date"
        register={register}
        errors={formState.errors}
        {...props}
      />
    )
  }
  return render(<Harness />)
}

describe('Date form field', () => {
  afterEach(cleanup)

  it('renders a native date input', () => {
    renderDate()
    expect(screen.getByLabelText('Event date')).toHaveAttribute('type', 'date')
  })

  it('renders autocomplete when provided', () => {
    renderDate({ autocomplete: 'bday' })
    expect(screen.getByLabelText('Event date')).toHaveAttribute('autocomplete', 'bday')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/blocks/Form/Date.test.tsx`
Expected: FAIL — `@/blocks/Form/Date` doesn't exist yet.

- [ ] **Step 3: Create `src/blocks/Form/Date/index.tsx`**

```tsx
import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import type { TextFieldWithAttrs } from '../types'
import { FormError } from '../Error'
import { Width } from '../Width'

export const FormDate: React.FC<
  TextFieldWithAttrs & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, autocomplete, defaultValue, errors, label, placeholder, register, required, width }) => {
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
        autoComplete={autocomplete}
        className="bp-input"
        defaultValue={defaultValue}
        id={name}
        placeholder={placeholder}
        type="date"
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

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/blocks/Form/Date.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/blocks/Form/Date tests/unit/blocks/Form/Date.test.tsx
git commit -m "feat: add date form field component"
```

---

### Task 7: New Switch field component + `.bp-toggle` Level 1 CSS

**Files:**
- Create: `src/blocks/Form/Switch/index.tsx`
- Modify: `src/app/(frontend)/frontend.css`
- Test: `tests/unit/blocks/Form/Switch.test.tsx`

**Interfaces:**
- Consumes: `SwitchFieldType` from `@/blocks/Form/types` (Task 3).

- [ ] **Step 1: Write the failing test**

```tsx
// tests/unit/blocks/Form/Switch.test.tsx
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useForm } from 'react-hook-form'
import { Switch } from '@/blocks/Form/Switch'

function renderSwitch(props: Partial<React.ComponentProps<typeof Switch>> = {}) {
  function Harness() {
    const { register, formState } = useForm()
    return (
      <Switch
        name="marketing_opt_in"
        label="Send me updates"
        register={register}
        errors={formState.errors}
        {...props}
      />
    )
  }
  return render(<Harness />)
}

describe('Switch form field', () => {
  afterEach(cleanup)

  it('renders an input with role=switch', () => {
    renderSwitch()
    expect(screen.getByRole('switch', { name: 'Send me updates' })).toBeInTheDocument()
  })

  it('renders the DS bp-toggle markup', () => {
    renderSwitch()
    const input = screen.getByRole('switch', { name: 'Send me updates' })
    expect(input).toHaveClass('bp-toggle__input')
    expect(input.closest('.bp-toggle')).not.toBeNull()
  })

  it('defaults to checked when defaultValue is true', () => {
    renderSwitch({ defaultValue: true })
    expect(screen.getByRole('switch', { name: 'Send me updates' })).toBeChecked()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/blocks/Form/Switch.test.tsx`
Expected: FAIL — `@/blocks/Form/Switch` doesn't exist yet.

- [ ] **Step 3: Create `src/blocks/Form/Switch/index.tsx`**

```tsx
import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import type { SwitchFieldType } from '../types'
import { FormError } from '../Error'
import { Width } from '../Width'

export const Switch: React.FC<
  SwitchFieldType & {
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
      <label className="bp-toggle">
        <input
          className="bp-toggle__input"
          defaultChecked={defaultValue}
          id={name}
          role="switch"
          type="checkbox"
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          {...register(name, { required })}
        />
        <span
          className="bp-toggle__track"
          aria-hidden="true"
        >
          <span className="bp-toggle__thumb" />
        </span>
        <span className="bp-toggle__label">
          {label}
          {required && (
            <span className="required">
              * <span className="sr-only">(required)</span>
            </span>
          )}
        </span>
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

- [ ] **Step 4: Author `.bp-toggle` Level 1 CSS in `src/app/(frontend)/frontend.css`**

Add after the existing `.bp-checkbox-field__error` block (around line 324):

```css
/* ─── DS: Toggle ─────────────────────────────────────────────
   Public API: --toggle-track-background, --toggle-track-background-checked,
   --toggle-track-radius, --toggle-track-width, --toggle-track-height,
   --toggle-thumb-background, --toggle-thumb-size, --toggle-thumb-shadow,
   --toggle-duration, --toggle-label-color, --toggle-label-gap,
   --toggle-disabled-opacity */
.bp-toggle {
  --_track-background: var(--toggle-track-background, var(--bp-color-border));
  --_track-background-checked: var(--toggle-track-background-checked, var(--bp-primary));
  --_track-radius: var(--toggle-track-radius, var(--bp-radius-full));
  --_track-width: var(--toggle-track-width, 2.75rem);
  --_track-height: var(--toggle-track-height, 1.5rem);
  --_thumb-background: var(--toggle-thumb-background, #fff);
  --_thumb-size: var(--toggle-thumb-size, 1.125rem);
  --_thumb-shadow: var(--toggle-thumb-shadow, var(--bp-shadow-sm));
  --_duration: var(--toggle-duration, var(--bp-duration-fast));
  --_label-color: var(--toggle-label-color, var(--bp-color-text));
  --_label-gap: var(--toggle-label-gap, var(--bp-space-3));
  --_disabled-opacity: var(--toggle-disabled-opacity, 0.45);

  display: inline-flex;
  align-items: center;
  gap: var(--_label-gap);
  cursor: pointer;
  color: var(--_label-color);
  font-size: var(--bp-text-base);
  line-height: var(--bp-leading-normal);
}

.bp-toggle__input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.bp-toggle__track {
  position: relative;
  flex-shrink: 0;
  width: var(--_track-width);
  height: var(--_track-height);
  background-color: var(--_track-background);
  border-radius: var(--_track-radius);
  transition: background-color var(--_duration) var(--bp-ease);
}

.bp-toggle__thumb {
  position: absolute;
  top: 50%;
  left: 0.1875rem;
  transform: translateY(-50%);
  width: var(--_thumb-size);
  height: var(--_thumb-size);
  background-color: var(--_thumb-background);
  border-radius: var(--bp-radius-full);
  box-shadow: var(--_thumb-shadow);
  transition: left var(--_duration) var(--bp-ease);
}

.bp-toggle__input:checked + .bp-toggle__track {
  background-color: var(--_track-background-checked);
}

.bp-toggle__input:checked + .bp-toggle__track .bp-toggle__thumb {
  left: calc(var(--_track-width) - var(--_thumb-size) - 0.1875rem);
}

.bp-toggle__input:focus-visible + .bp-toggle__track {
  outline: none;
  box-shadow: var(--bp-focus-ring);
}

.bp-toggle__input:disabled ~ * {
  opacity: var(--_disabled-opacity);
  cursor: not-allowed;
}

.bp-toggle:has(.bp-toggle__input:disabled) {
  cursor: not-allowed;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/blocks/Form/Switch.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 6: Run the DS token validator**

Run: `node scripts/validate-ds-tokens.mjs`
Expected: no violations reported for `frontend.css`

- [ ] **Step 7: Commit**

```bash
git add src/blocks/Form/Switch src/app/\(frontend\)/frontend.css tests/unit/blocks/Form/Switch.test.tsx
git commit -m "feat: add switch form field component and bp-toggle base CSS"
```

---

### Task 8: Register new field types, regenerate Payload artifacts, full verification

**Files:**
- Modify: `src/blocks/Form/fields.tsx`

**Interfaces:**
- Consumes: `Tel`, `Url`, `Password`, `FormDate`, `Switch` from Tasks 5–7.

- [ ] **Step 1: Update `src/blocks/Form/fields.tsx`**

```tsx
import { Checkbox } from './Checkbox'
import { Country } from './Country'
import { FormDate } from './Date'
import { Email } from './Email'
import { Message } from './Message'
import { FormNumber } from './Number'
import { Password } from './Password'
import { Select } from './Select'
import { State } from './State'
import { Switch } from './Switch'
import { Tel } from './Tel'
import { Text } from './Text'
import { Textarea } from './Textarea'
import { Url } from './Url'

export const fields = {
  checkbox: Checkbox,
  country: Country,
  date: FormDate,
  email: Email,
  message: Message,
  number: FormNumber,
  password: Password,
  select: Select,
  state: State,
  switch: Switch,
  tel: Tel,
  text: Text,
  textarea: Textarea,
  url: Url,
}
```

- [ ] **Step 2: Run the full unit test suite**

Run: `pnpm test:int`
Expected: all tests pass, including `tests/unit/blocks/Form.test.tsx` (unaffected — it mocks `@/blocks/Form/fields` directly) and every new test file from Tasks 1–7.

- [ ] **Step 3: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Regenerate Payload types and import map**

Run: `pnpm generate:types && pnpm generate:importmap`
Expected: `src/payload-types.ts` regenerates without diffing in unrelated collections; commit whatever diff results.

- [ ] **Step 5: Lint**

Run: `pnpm lint`
Expected: no errors

- [ ] **Step 6: Manual verification in the admin**

Run: `pnpm dev`, open `/admin`, create or edit a Form, add one field of each new type (`Phone`, `URL`, `Password`, `Date`, `Switch`), set a `placeholder` and `autocomplete` value on the text-like ones, save, then view the form on a page that renders a `formBlock` and confirm each input renders with the correct `type`/`placeholder`/`autocomplete` attributes in the DOM, and the switch toggles visually with correct focus/keyboard behavior.

- [ ] **Step 7: Commit**

```bash
git add src/blocks/Form/fields.tsx src/payload-types.ts src/app/\(payload\)/admin/importMap.js
git commit -m "feat: register tel, url, password, date, and switch form field renderers"
```
