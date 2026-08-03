#!/usr/bin/env node
/**
 * Coverage threshold gate.
 * Reads coverage/coverage-summary.json and exits 1 if any metric is below threshold.
 *
 * Kept a couple of points under the real numbers, deliberately. A gate set far
 * below reality — as these were, 48/50/44/49 against 65/57/62/66 — catches
 * nothing: a quarter of the tests could be deleted and CI would stay green.
 * A gate set *at* reality fails on an unrelated refactor that legitimately
 * removes covered lines. The margin is for that, not for slack.
 *
 * Raise them when coverage rises. The number matters less than the distance.
 */

import { existsSync, readFileSync } from 'node:fs'

const THRESHOLDS = {
  statements: 67,
  branches: 57,
  functions: 62,
  lines: 68,
}

const SUMMARY_PATH = 'coverage/coverage-summary.json'

if (!existsSync(SUMMARY_PATH)) {
  console.error(`Coverage report not found at ${SUMMARY_PATH}. Run pnpm test:coverage first.`)
  process.exit(1)
}

const summary = JSON.parse(readFileSync(SUMMARY_PATH, 'utf8'))
const total = summary.total

let hasError = false

for (const [metric, threshold] of Object.entries(THRESHOLDS)) {
  const actual = total[metric]?.pct ?? 0
  const status = actual >= threshold ? '✓' : '✗'
  const line = `  ${status} ${metric}: ${actual}% (threshold: ${threshold}%)`
  if (actual < threshold) {
    console.error(line)
    hasError = true
  } else {
    console.log(line)
  }
}

if (hasError) {
  console.error(
    '\nCoverage below threshold. Add tests or lower the threshold in scripts/check-coverage.mjs.',
  )
  process.exit(1)
}

console.log('\nCoverage thresholds passed.')
