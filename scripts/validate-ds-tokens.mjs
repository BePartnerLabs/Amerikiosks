#!/usr/bin/env node
/**
 * DS token compliance validator.
 *
 * Rules checked (component CSS only — tokens.css is excluded):
 *   1. background-color / color set directly with --ak-* (not through --_* private var)
 *   2. Hardcoded color literals in component CSS (hex, rgb, hsl outside tokens.css)
 *   3. Public slots use shorthand alias (-bg, -fg) instead of CSS property name
 */

import { readFileSync } from 'fs'
import { basename } from 'path'

const BANNED_SHORTHAND = /--[\w-]+-(?:bg|fg|clr|col)\b/
const HARDCODED_COLOR =
  /(?:^|[^-\w])(?:#[0-9a-f]{3,8}|rgb\(|rgba\(|hsl\((?!.*var)|hsla\((?!.*var))/i

// Only flag background-color and color — the primary surface properties
const SURFACE_PROPERTY_LINE = /^\s*(background-color|(?<!\w)color)\s*:[^;{]*var\(--ak-/

const PRIVATE_VAR_DECL = /^\s*--_[\w-]+\s*:/

// Files where hardcoded values and shorthand aliases are allowed
const PRIMITIVES_FILES = new Set(['tokens.css', 'frontend.css', 'globals.css'])

const files = process.argv.slice(2)
let hasError = false

for (const file of files) {
  if (!file.endsWith('.css')) continue

  const isPrimitivesFile = PRIMITIVES_FILES.has(basename(file))
  const lines = readFileSync(file, 'utf8').split('\n')

  lines.forEach((line, i) => {
    const loc = `${file}:${i + 1}`
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('/*') || trimmed.startsWith('//')) return

    // Rule 1 — background-color/color set directly with --ak-* (not via private var)
    if (!isPrimitivesFile && SURFACE_PROPERTY_LINE.test(line) && !PRIVATE_VAR_DECL.test(line)) {
      console.error(`[DS] Rule 1 — surface property uses --ak-* directly (wrap in --_*): ${loc}`)
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

    // Rule 3 — public slot shorthand names (skip primitives file)
    if (!isPrimitivesFile && BANNED_SHORTHAND.test(line) && !PRIVATE_VAR_DECL.test(line)) {
      console.error(
        `[DS] Rule 3 — public slot should match CSS property (-bg → -background, -fg → -color): ${loc}`,
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
