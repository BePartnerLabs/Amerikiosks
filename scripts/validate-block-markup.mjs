#!/usr/bin/env node
/**
 * Every block registered in src/blocks/RenderBlocks.tsx must render:
 *
 *   1. a `<section>` — one landmark per page block, so the page is navigable;
 *   2. `data-ga-block` — without it the block is invisible to GA4 block
 *      reporting, which is the whole point of that attribute;
 *   3. `bp-content-grid` — the shared page gutter and content width. A block's
 *      own `max-width` does not provide the gutter, so on narrow screens the
 *      content ends up flush against the viewport edge.
 *
 * All three were in src/blocks/_template.md as manual checklist items, and the
 * checklist did not catch the Form block shipping without any of them. Hence a
 * script.
 *
 * Checks the block *directory*, not the single staged file: several blocks
 * split into Server.tsx (which owns the chrome) + Component.tsx (which owns
 * the content), and either file alone looks non-compliant.
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..')
const RENDER_BLOCKS = join(ROOT, 'src/blocks/RenderBlocks.tsx')

// Reasons, not just names — an allowlist without one becomes a list of bugs
// nobody remembers agreeing to.
const EXEMPT = {
  MediaBlock: {
    section:
      'Rendered inline inside RichText as well as standalone; a landmark in the middle of prose is noise, and the surrounding content already provides the grid.',
    grid: 'Rendered inline inside RichText, where the parent already establishes the content width.',
  },
  TrustStrip: {
    grid: 'Full-bleed strip with its own ak-trust-strip inner container; using the grid would double the horizontal padding.',
  },
  SupportHub: {
    grid: 'Own ak-support-hub__inner container, same reason as TrustStrip.',
  },
  MachineLineup: {
    grid: 'Full-bleed pinned scene: the machine is centred in the viewport and the copy is positioned against the pin, not the page gutter. A content grid would inset the render and break the sticky geometry.',
  },
}

const registered = (() => {
  const src = readFileSync(RENDER_BLOCKS, 'utf8')
  const names = new Set()
  for (const match of src.matchAll(/from '@\/blocks\/([^/']+)\//g)) names.add(match[1])
  return names
})()

const files = process.argv.slice(2)
const checkedDirs = new Set()
let hasError = false

for (const file of files) {
  const match = file.match(/src\/blocks\/([^/]+)\/(Component|Server)\.tsx$/)
  if (!match) continue

  const [, blockName] = match
  if (!registered.has(blockName) || checkedDirs.has(blockName)) continue
  checkedDirs.add(blockName)

  const dir = join(ROOT, 'src/blocks', blockName)
  const source = ['Component.tsx', 'Server.tsx']
    .map((name) => join(dir, name))
    .filter((path) => existsSync(path))
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n')

  const exempt = EXEMPT[blockName] ?? {}
  const checks = [
    ['section', /<section[\s>]/, 'no <section> landmark'],
    ['ga', /data-ga-block/, 'no data-ga-block attribute (invisible to GA4 block reporting)'],
    ['grid', /bp-content-grid/, 'no bp-content-grid wrapper (block will have no page gutter)'],
  ]

  for (const [key, pattern, message] of checks) {
    if (exempt[key] || pattern.test(source)) continue
    console.error(`src/blocks/${blockName}: ${message}`)
    hasError = true
  }
}

if (hasError) {
  console.error(
    '\nvalidate-block-markup failed. See src/blocks/_template.md, or add an entry with a reason to EXEMPT in this script if the block genuinely should not have it.',
  )
  process.exit(1)
} else {
  console.log(`validate-block-markup passed (${checkedDirs.size} block(s) checked).`)
}
