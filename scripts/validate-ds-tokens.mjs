#!/usr/bin/env node
/**
 * DS token compliance validator.
 *
 * Rules checked (component CSS only — primitives files are excluded, unless noted):
 *   1. background-color / color set directly with --ak-* (not through a --_* or Level 2 var)
 *   2. Hardcoded color literals in component CSS (hex, rgb, hsl outside tokens.css)
 *   3. Public slots use shorthand alias (-bg, -fg) instead of CSS property name
 *   4. Any CSS property using var(--ak-*) directly inside a .bp-* selector context
 *      (must be channeled through a Level 2 --<component>-* var instead)
 *   5. Spacing/typography custom properties declared in px instead of rem — applies
 *      to ALL files including primitives, since px there breaks browser text-zoom
 *      for anything referencing the token (border-width and shadow offsets are exempt,
 *      those are conventionally px).
 *   6. Box-model/typography property (padding, height, width, border-radius, font-size,
 *      font-weight, line-height, letter-spacing...) set with a raw literal inside a
 *      .bp-* selector — shared components expose their own --<component>-* slots for
 *      this (e.g. --btn-height, --btn-padding); redeclaring the property directly
 *      shadows the component's real base styles instead of overriding through its
 *      contract, and silently drifts once the DS itself changes. Caught live: a block
 *      reimplemented .bp-btn's entire box model (min-width/height/padding/font-size/
 *      line-height/letter-spacing) instead of picking an existing appearance modifier.
 */

import { readFileSync } from 'node:fs'
import { basename } from 'node:path'

const BANNED_SHORTHAND = /--[\w-]+-(?:bg|fg|clr|col)\b/
const HARDCODED_COLOR =
  /(?:^|[^-\w])(?:#[0-9a-f]{3,8}|rgb\(|rgba\(|hsl\((?!.*var)|hsla\((?!.*var))/i

// Only flag background-color and color — the primary surface properties
const SURFACE_PROPERTY_LINE = /^\s*(background-color|(?<!\w)color)\s*:[^;{]*var\(--ak-/

const PRIVATE_VAR_DECL = /^\s*--_[\w-]+\s*:/
const LEVEL2_VAR_DECL = /^\s*--(?!_)[\w-]+\s*:/

// Any CSS property value (not a var declaration) using --ak-* directly
const CSS_PROPERTY_WITH_AK = /^\s*(?!--[\w-]+\s*:)[\w-]+\s*:[^;{]*var\(--ak-/

// Files where hardcoded values and shorthand aliases are allowed
const PRIMITIVES_FILES = new Set(['tokens.css', 'frontend.css', 'globals.css'])

// Rule 6 — box-model/typography properties a shared .bp-* component already owns.
// Flags a raw literal value; var(...)-only values (the component's own slot, or a
// design token) are the correct override path and are exempt.
const BOX_TYPOGRAPHY_PROPERTY =
  /^\s*(padding(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?|margin(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?|height|width|min-width|max-width|min-height|max-height|border-radius|font-size|font-weight|line-height|letter-spacing)\s*:\s*(.+?);?\s*$/i

// Rule 5 — custom property declarations for spacing/typography must use rem, not px.
// Matches the *declaration* of a token (--foo-space-8: 8px;), not usages (padding: var(--foo)).
const SPACING_TYPOGRAPHY_VAR_DECL =
  /^\s*--[\w-]*(?:space|spacing|font-size|line-height|gap|padding|margin|radius|height|width)[\w-]*\s*:\s*[\d.]+px/i
// Exempt: border-width, shadow offsets/blur, fixed layout containers, pill radius, and
// explicitly-named "-px" utility tokens — all conventionally kept in px regardless of scale.
const PX_EXEMPT_NAME =
  /--[\w-]*(?:border-width|shadow|navbar-height|navbar-inner|-px\s*:|radius-full|radius-pill|content-max-width|breakout-max-width|max-width)/i

const files = process.argv.slice(2)
let hasError = false

for (const file of files) {
  if (!file.endsWith('.css')) continue

  const isPrimitivesFile = PRIMITIVES_FILES.has(basename(file))
  const lines = readFileSync(file, 'utf8').split('\n')

  // Selector context tracking for Rule 4
  let selectorBuffer = ''
  let insideBpSelector = false
  let braceDepth = 0
  let bpSelectorDepth = 0

  // Selector context tracking for Rule 6 — deliberately narrower than Rule 4's
  // insideBpSelector (which also matches merely being nested inside a .bp-*
  // layout wrapper like .bp-content-grid, far too broad for this check). Rule 6
  // only cares about a COMPOUND selector — a local class glued directly onto
  // .bp-btn with no combinator (.foo.bp-btn or .bp-btn.foo) — because that's a
  // custom class styling the *same element* as the shared component, not a
  // descendant. Extend BP_COMPOUND_COMPONENTS if this needs to cover more
  // components later (.bp-card, .bp-input, ...); kept to .bp-btn for now since
  // that's the pattern actually caught in the wild.
  const BP_COMPOUND_COMPONENTS = ['btn']
  const compoundPattern = new RegExp(
    BP_COMPOUND_COMPONENTS.map(
      (c) => `\\.[A-Za-z][\\w-]*\\.bp-${c}(?![\\w-])|\\.bp-${c}\\.[A-Za-z][\\w-]*`,
    ).join('|'),
  )
  let insideBpCompound = false
  let bpCompoundDepth = 0

  lines.forEach((line, i) => {
    const loc = `${file}:${i + 1}`
    const trimmed = line.trim()

    // ── Selector context tracking ─────────────────────────────────
    // Accumulate selector text before the opening brace
    if (!trimmed.includes('{') && !trimmed.includes('}') && !trimmed.startsWith('@')) {
      selectorBuffer += ` ${trimmed}`
    }

    if (trimmed.includes('{')) {
      braceDepth++
      const currentSelector = `${selectorBuffer} ${trimmed}`
      if (/\.bp-[\w_-]+/.test(currentSelector)) {
        insideBpSelector = true
        bpSelectorDepth = braceDepth
      }
      if (compoundPattern.test(currentSelector)) {
        insideBpCompound = true
        bpCompoundDepth = braceDepth
      }
      selectorBuffer = ''
    }

    if (trimmed.includes('}')) {
      if (insideBpSelector && braceDepth <= bpSelectorDepth) {
        insideBpSelector = false
        bpSelectorDepth = 0
      }
      if (insideBpCompound && braceDepth <= bpCompoundDepth) {
        insideBpCompound = false
        bpCompoundDepth = 0
      }
      braceDepth = Math.max(0, braceDepth - trimmed.split('}').length + 1)
    }

    // Skip comments and empty lines for rule checks
    if (!trimmed || trimmed.startsWith('/*') || trimmed.startsWith('//') || trimmed.startsWith('*'))
      return

    // Rule 1 — background-color/color set directly with --ak-* (not via private var)
    if (!isPrimitivesFile && SURFACE_PROPERTY_LINE.test(line) && !PRIVATE_VAR_DECL.test(line)) {
      console.error(
        `[DS] Rule 1 — surface property uses --ak-* directly (wrap in --_* or Level 2): ${loc}`,
      )
      console.error(`     ${trimmed}\n`)
      hasError = true
    }

    // Rule 2 — hardcoded color literals (skip primitives file where they're intentional)
    if (!isPrimitivesFile && HARDCODED_COLOR.test(line)) {
      const stripped = line.replace(/var\([^)]+\)/g, '')
      if (HARDCODED_COLOR.test(stripped)) {
        console.error(`[DS] Rule 2 — hardcoded color literal (use a token): ${loc}`)
        console.error(`     ${trimmed}\n`)
        hasError = true
      }
    }

    // Rule 3 — public slot shorthand names. DS v1.7.1 enforces Rule 1 consistently
    // across all components (--card-background, --input-background, --accordion-background).
    // No exemption needed for .bp-* context — flag abbreviations everywhere.
    if (!isPrimitivesFile && BANNED_SHORTHAND.test(line) && !PRIVATE_VAR_DECL.test(line)) {
      console.error(
        `[DS] Rule 3 — public slot should match CSS property (-bg → -background, -fg → -color): ${loc}`,
      )
      console.error(`     ${trimmed}\n`)
      hasError = true
    }

    // Rule 4 — any CSS property using var(--ak-*) directly inside a .bp-* selector
    // Level 2 var declarations (--component-*: var(--ak-*)) are the correct pattern — skip those
    if (
      !isPrimitivesFile &&
      insideBpSelector &&
      CSS_PROPERTY_WITH_AK.test(line) &&
      !LEVEL2_VAR_DECL.test(line) &&
      !PRIVATE_VAR_DECL.test(line)
    ) {
      console.error(
        `[DS] Rule 4 — var(--ak-*) used directly as CSS property value inside .bp-* selector (use Level 2 --component-* intermediary): ${loc}`,
      )
      console.error(`     ${trimmed}\n`)
      hasError = true
    }

    // Rule 5 — spacing/typography token declared in px (breaks browser text-zoom).
    // Applies everywhere, including primitives files — this is where these tokens live.
    // Private (--_*) vars are component-internal one-offs, not reusable design tokens — exempt.
    if (
      SPACING_TYPOGRAPHY_VAR_DECL.test(line) &&
      !PX_EXEMPT_NAME.test(line) &&
      !PRIVATE_VAR_DECL.test(line)
    ) {
      console.error(`[DS] Rule 5 — spacing/typography token declared in px, use rem: ${loc}`)
      console.error(`     ${trimmed}\n`)
      hasError = true
    }

    // Rule 6 — raw box-model/typography literal inside a .bp-* selector. Strip every
    // var(...) call from the value; a keyword-only or fully-var value is a legitimate
    // override, anything left over (a number, unit, or literal) means the component's
    // own box model is being reimplemented instead of overridden through its slots.
    if (!isPrimitivesFile && insideBpCompound && !PRIVATE_VAR_DECL.test(line)) {
      const match = line.match(BOX_TYPOGRAPHY_PROPERTY)
      if (match) {
        const property = match[1]
        const value = match[2]
        const stripped = value
          .replace(/var\([^()]*(?:\([^()]*\)[^()]*)*\)/g, '')
          .replace(/[,\s]/g, '')
        const isSafeKeyword = /^(inherit|initial|unset|revert|auto|none|0)$/i.test(value.trim())
        if (stripped !== '' && !isSafeKeyword) {
          console.error(
            `[DS] Rule 6 — "${property}" set with a raw value inside a .bp-* selector (use the component's --<component>-${property} slot or an existing modifier instead): ${loc}`,
          )
          console.error(`     ${trimmed}\n`)
          hasError = true
        }
      }
    }
  })
}

if (hasError) {
  console.error('DS token validation failed. Fix violations before committing.')
  process.exit(1)
}

console.log(`DS token validation passed (${files.length} file(s) checked).`)
