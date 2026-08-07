#!/usr/bin/env node
/**
 * Regenerates the index tables in docs/patterns/README.md and
 * docs/business/README.md from the frontmatter of the documents beside them.
 *
 * ## Why generate rather than hand-write
 *
 * This repo already has two hand-maintained indexes and both are wrong:
 * `docs/blocks/README.md` lists five blocks at percentages that contradict
 * `src/CLAUDE.md`'s table, and neither mentions CardGrid or two of the three
 * heros. An index nobody regenerates is worse than no index — it is read as
 * authoritative and quietly lies.
 *
 * So each document declares its own metadata in frontmatter, and the table is
 * derived. Adding a document means writing the document; the index follows.
 *
 * ## Usage
 *
 *   node scripts/generate-context-index.mjs           # rewrite the indexes
 *   node scripts/generate-context-index.mjs --check   # fail if out of date (CI)
 *
 * Unlike the validate-*.mjs scripts this one takes no file arguments: it always
 * scans the whole folder, because an index is only correct as a whole.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const FOLDERS = [
  { dir: 'docs/patterns', heading: 'Topic' },
  { dir: 'docs/business', heading: 'Document' },
]

const START = '<!-- index:start -->'
const END = '<!-- index:end -->'

/** Minimal frontmatter reader — key: value pairs, no nesting, no dependencies. */
const readFrontmatter = (source) => {
  if (!source.startsWith('---\n')) return null
  const end = source.indexOf('\n---', 4)
  if (end === -1) return null

  const meta = {}
  for (const line of source.slice(4, end).split('\n')) {
    const at = line.indexOf(':')
    if (at === -1) continue
    meta[line.slice(0, at).trim()] = line
      .slice(at + 1)
      .trim()
      .replace(/^["']|["']$/g, '')
  }
  return meta
}

let stale = false
const check = process.argv.includes('--check')

for (const { dir, heading } of FOLDERS) {
  const folder = join(ROOT, dir)
  const readmePath = join(folder, 'README.md')

  let readme
  try {
    readme = readFileSync(readmePath, 'utf8')
  } catch {
    continue
  }

  const rows = []
  for (const name of readdirSync(folder).sort()) {
    if (!name.endsWith('.md') || name === 'README.md') continue

    const meta = readFrontmatter(readFileSync(join(folder, name), 'utf8'))
    if (!meta?.title) {
      console.error(`${dir}/${name}: missing frontmatter with a \`title\`. Not indexed.`)
      stale = true
      continue
    }
    // `read_when` is the useful column: a title tells you what a document is,
    // but only this tells you whether to open it now.
    rows.push(`| [${meta.title}](./${name}) | ${meta.read_when ?? '—'} |`)
  }

  const table = [`| ${heading} | Read it when |`, '|---|---|', ...rows].join('\n')
  const next = `${START}\n${table}\n${END}`

  if (!readme.includes(START) || !readme.includes(END)) {
    console.error(`${dir}/README.md: missing ${START} / ${END} markers. Cannot generate.`)
    stale = true
    continue
  }

  const updated = readme.replace(
    new RegExp(`${START}[\\s\\S]*?${END}`),
    // `$` is special in String.replace patterns; a literal function avoids it.
    () => next,
  )

  if (updated === readme) continue

  if (check) {
    console.error(`${dir}/README.md is out of date. Run: pnpm docs:index`)
    stale = true
  } else {
    writeFileSync(readmePath, updated)
    console.log(`${dir}/README.md regenerated (${rows.length} document(s)).`)
  }
}

if (stale) process.exit(1)
if (!check) console.log('context indexes up to date.')
