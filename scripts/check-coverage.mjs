#!/usr/bin/env node
/**
 * Coverage threshold gate.
 * Reads coverage/coverage-summary.json and exits 1 if any metric is below threshold.
 * Thresholds are intentionally low initially — raise them as coverage grows.
 */

import { existsSync, readFileSync } from 'node:fs'

const THRESHOLDS = {
  statements: 17,
  branches: 20,
  functions: 17,
  lines: 17,
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
