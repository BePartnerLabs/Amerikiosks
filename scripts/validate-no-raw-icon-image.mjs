#!/usr/bin/env node
/**
 * Guards against two regressions this codebase migrated away from:
 *
 *   1. The Material Symbols icon *font* (7.9MB variable font download,
 *      FOUT risk — see src/components/Icon). Use `<Icon name="..." />`.
 *   2. Raw `<img>` tags bypassing next/image (loses optimization, priority
 *      hints, and the ImageMedia abstraction). Use `<Media>`/`next/image`.
 *
 * Both checks skip the files that legitimately define the exception.
 */

import { readFileSync } from 'node:fs'

const MATERIAL_FONT_CLASS = /material-symbols-outlined/
const RAW_IMG_TAG = /<img[\s>]/

const MATERIAL_FONT_ALLOWLIST = new Set(['src/components/Icon/icons.ts'])
const RAW_IMG_ALLOWLIST = new Set([
  // Mocks DOM markup via innerHTML to test IntersectionObserver behavior
  // against a real <img>'s alt text — not production JSX.
  'tests/unit/blocks/TrustStripTracker.test.tsx',
])

const files = process.argv.slice(2)
let hasError = false

for (const file of files) {
  if (!/\.(tsx|ts|jsx)$/.test(file)) continue

  const relPath = file.replace(/^.*\/website\//, '')
  const lines = readFileSync(file, 'utf8').split('\n')

  lines.forEach((line, i) => {
    const loc = `${file}:${i + 1}`

    if (MATERIAL_FONT_CLASS.test(line) && !MATERIAL_FONT_ALLOWLIST.has(relPath)) {
      console.error(
        `${loc}: Material Symbols font class found — use <Icon name="..." /> from @/components/Icon instead.\n  ${line.trim()}`,
      )
      hasError = true
    }

    if (RAW_IMG_TAG.test(line) && !RAW_IMG_ALLOWLIST.has(relPath)) {
      console.error(
        `${loc}: raw <img> tag found — use next/image (typically via @/components/Media) instead.\n  ${line.trim()}`,
      )
      hasError = true
    }
  })
}

if (hasError) {
  console.error('\nvalidate-no-raw-icon-image failed.')
  process.exit(1)
} else {
  console.log(`validate-no-raw-icon-image passed (${files.length} file(s) checked).`)
}
