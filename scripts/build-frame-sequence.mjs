#!/usr/bin/env node
/**
 * Turns a Blender turntable export into a frame sequence the scrub hero can use.
 *
 * Blender writes `0001.png … 0060.png` (or `10001.png` with a scene offset).
 * The hero resolves `frame-001 … frame-NNN` by convention, and the frames have
 * to be WebP. This does both in one pass, so nobody renames sixty files by hand
 * — which is exactly where a frame ends up in the wrong place with no error.
 *
 * ## Why WebP is not optional
 *
 * Measured on a real 60-frame Gamma export (2026-08-09): PNG at 1600px is
 * ~1.05 MB per frame, 58 MB for the sequence. The same frames as WebP are
 * 11–18 KB at 1200px, or ~27 KB at full 1600px with high quality — **40× to 90×
 * smaller**, with the alpha channel intact.
 *
 * The renders are cut-outs on transparency: empty background, one machine, flat
 * colour. PNG stores that badly and WebP crushes it. The alpha matters — the
 * machine sits on the navy stage, and a white machine on a light background
 * disappears (see docs/patterns/, and the note at the top of
 * MachinesLanding/styles.css).
 *
 * ## Usage
 *
 *   node scripts/build-frame-sequence.mjs <src-dir> <out-dir> [--width 1600] [--quality 90]
 *
 * Example:
 *   node scripts/build-frame-sequence.mjs ~/Documents/gamma12 public/rotation-spike
 *
 * Requires `cwebp` (Homebrew: `brew install webp`). sharp is in the project and
 * could do this too, but cwebp is what the measurements above were taken with
 * and it keeps this script independent of the app's dependency tree.
 */

import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'

const [srcDir, outDir, ...rest] = process.argv.slice(2)

if (!srcDir || !outDir) {
  console.error(
    'Usage: node scripts/build-frame-sequence.mjs <src-dir> <out-dir> [--width N] [--quality N]',
  )
  process.exit(1)
}

const flag = (name, fallback) => {
  const at = rest.indexOf(`--${name}`)
  return at === -1 ? fallback : Number(rest[at + 1])
}

const width = flag('width', 1600)
const quality = flag('quality', 90)

// Numeric filenames only, sorted as numbers — `10.png` must not land between
// `1.png` and `2.png`, which is what a plain string sort would do.
const frames = readdirSync(srcDir)
  .filter((name) => /^\d+\.png$/i.test(name))
  .sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10))

if (!frames.length) {
  console.error(`No numeric .png frames found in ${srcDir}.`)
  process.exit(1)
}

const isRgba = (file) => {
  // PNG colour type lives at byte 25 of the IHDR chunk. 6 = RGBA, 4 = grey+alpha.
  const head = readFileSync(file).subarray(0, 26)
  return head[25] === 6 || head[25] === 4
}

if (!isRgba(join(srcDir, frames[0]))) {
  console.error(
    `${frames[0]} has no alpha channel. The machine has to be a cut-out on transparency,\n` +
      'or it arrives on the navy stage carrying its own background. Re-export with RGBA.',
  )
  process.exit(1)
}

mkdirSync(outDir, { recursive: true })

let total = 0
let heaviest = { name: '', bytes: 0 }

frames.forEach((name, i) => {
  const out = join(outDir, `frame-${String(i + 1).padStart(3, '0')}.webp`)
  execFileSync('cwebp', [
    '-quiet',
    '-q',
    String(quality),
    '-alpha_q',
    '100',
    ...(width ? ['-resize', String(width), '0'] : []),
    join(srcDir, name),
    '-o',
    out,
  ])

  const { size } = statSync(out)
  total += size
  if (size > heaviest.bytes) heaviest = { name: basename(out), bytes: size }
})

// A manifest so the component does not have to guess the count, and so a
// half-finished conversion is visible rather than silently short.
writeFileSync(
  join(outDir, 'sequence.json'),
  `${JSON.stringify({ frames: frames.length, width, quality, format: 'webp' }, null, 2)}\n`,
)

const kb = (bytes) => Math.round(bytes / 1024)
console.log(`${frames.length} frames → ${outDir}`)
console.log(`  total    ${kb(total)} KB`)
console.log(`  heaviest ${heaviest.name} at ${kb(heaviest.bytes)} KB`)
console.log(`  average  ${kb(total / frames.length)} KB`)
