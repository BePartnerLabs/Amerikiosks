#!/usr/bin/env node
/**
 * DS token compliance validator.
 *
 * Rules checked (component CSS only — primitives files are excluded):
 *   1. background-color / color set directly with --ak-* (not through a --_* or Level 2 var)
 *   2. Hardcoded color literals in component CSS (hex, rgb, hsl outside tokens.css)
 *   3. Public slots use shorthand alias (-bg, -fg) instead of CSS property name
 *   4. Any CSS property using var(--ak-*) directly inside a .bp-* selector context
 *      (must be channeled through a Level 2 --<component>-* var instead)
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

  lines.forEach((line, i) => {
    const loc = `${file}:${i + 1}`
    const trimmed = line.trim()

    // ── Selector context tracking ─────────────────────────────────
    // Accumulate selector text before the opening brace
    if (!trimmed.includes('{') && !trimmed.includes('}') && !trimmed.startsWith('@')) {
      selectorBuffer += ' ' + trimmed
    }

    if (trimmed.includes('{')) {
      braceDepth++
      const currentSelector = selectorBuffer + ' ' + trimmed
      if (/\.bp-[\w_-]+/.test(currentSelector)) {
        insideBpSelector = true
        bpSelectorDepth = braceDepth
      }
      selectorBuffer = ''
    }

    if (trimmed.includes('}')) {
      if (insideBpSelector && braceDepth <= bpSelectorDepth) {
        insideBpSelector = false
        bpSelectorDepth = 0
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

    // Rule 3 — public slot shorthand names (project-defined slots only).
    // Skip when inside a .bp-* selector — there we are SETTING DS-defined slots
    // (e.g. --card-bg, --input-bg) whose names are authoritative from the DS source.
    // Only flag shorthand names declared on project selectors (.ak-*, custom).
    if (
      !isPrimitivesFile &&
      !insideBpSelector &&
      BANNED_SHORTHAND.test(line) &&
      !PRIVATE_VAR_DECL.test(line)
    ) {
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
  })
}

if (hasError) {
  console.error('DS token validation failed. Fix violations before committing.')
  process.exit(1)
}

console.log(`DS token validation passed (${files.length} file(s) checked).`)
