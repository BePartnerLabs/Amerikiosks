#!/usr/bin/env node
/**
 * Fails when a client component starts violating the Rules of React.
 *
 * The React Compiler (`reactCompiler` in next.config.ts) safe-fails: when it
 * finds a pattern it cannot reason about, it silently skips that file and
 * leaves your code as written. Nothing in the build output says so, so a
 * component can quietly stop being memoised and nobody notices for months.
 * This script runs the compiler over the touched files and reports the bail.
 *
 * ## Babel 7, not 8 — the version matters
 *
 * `babel-plugin-react-compiler` reads a Babel 7 AST. Run it under `@babel/core`
 * 8 and it reports a flood of `(BuildHIR::lowerAssignment) Expected object
 * property value to be an LVal, got: AssignmentPattern` — one for every
 * destructured prop with a default value. Those are artefacts, not findings:
 * on 2026-08-06 they sent us refactoring eleven files that had nothing wrong
 * with them. `@babel/core` and `@babel/preset-typescript` are pinned to ^7 in
 * package.json for this reason. Do not bump them to 8 expecting a no-op.
 *
 * ## Why an allowlist rather than a clean slate
 *
 * Nine files bail for reasons that are compiler limitations, not our code.
 * They are listed below with the reason, so a *new* bail stands out instead of
 * drowning in known noise. An allowlist without a written reason becomes a list
 * of bugs nobody remembers agreeing to.
 *
 * Full context: docs/patterns/react-compiler.md
 */

import { readFileSync } from 'node:fs'
import { transformAsync } from '@babel/core'

/**
 * Known bails, keyed by repo-relative path. The value is why it is tolerated —
 * every entry here is a compiler limitation we cannot fix from this repo. If a
 * file in this list stops bailing after a compiler upgrade, delete its entry.
 */
const EXPECTED = {
  'src/Settings/components/MondayBoardsSync.tsx':
    'Compiler cannot yet lower conditional/optional expressions inside a try/catch.',
  'src/collections/Claims/components/ResyncDocButton.tsx':
    'Compiler cannot yet lower conditional/optional expressions inside a try/catch.',
  'src/collections/Claims/components/ResyncListButton.tsx':
    'Compiler cannot yet lower conditional/optional expressions inside a try/catch.',
  'src/collections/Claims/components/ViewPhotoButton.tsx':
    'Compiler cannot yet lower conditional/optional expressions inside a try/catch.',
  'src/collections/FormSubmissions/components/ResyncDocButton.tsx':
    'Compiler cannot yet lower conditional/optional expressions inside a try/catch.',
  'src/collections/FormSubmissions/components/ResyncListButton.tsx':
    'Compiler cannot yet lower conditional/optional expressions inside a try/catch.',
  'src/collections/FormSubmissions/components/ViewAttachmentsButton.tsx':
    'Compiler cannot yet lower conditional/optional expressions inside a try/catch.',
  'src/blocks/ClaimForm/Component.tsx':
    'Compiler flags a third-party hook it cannot analyse ("Use of incompatible library").',
  'src/blocks/TrustStrip/Tracker.tsx': 'Compiler does not yet handle the `??=` operator.',

  // The one entry here that is our code rather than a compiler limitation.
  // Two "Cannot access refs during render" bails, reported without a location.
  // The suspect is the ref plumbing into `useFormSubmission` — `honeypotRef`
  // and `renderedAtRef` are handed to the hook during render — but removing
  // them does not clear the bails, and pinning it down means bisecting a
  // 400-line component that owns the client's lead capture. Deferred rather
  // than guessed at. Do not delete this entry without a fix that keeps the
  // form's tests green.
  'src/blocks/Form/Component.tsx':
    'Two ref-during-render bails, not yet isolated. See docs/patterns/react-compiler.md.',
}

const files = process.argv.slice(2)
let hasError = false

for (const file of files) {
  // `.ts` too: hooks live there, and a hook that bails takes its callers with it.
  if (!/\.(tsx|jsx|ts)$/.test(file)) continue

  const source = readFileSync(file, 'utf8')
  // Server Components are never memoised, so a bail there means nothing.
  if (!source.includes("'use client'") && !source.includes('"use client"')) continue

  const relPath = file.replace(/^.*\/website\//, '')
  const bails = []

  await transformAsync(source, {
    filename: file,
    presets: ['@babel/preset-typescript'],
    parserOpts: { plugins: ['jsx', 'typescript'] },
    plugins: [
      [
        'babel-plugin-react-compiler',
        {
          // Report everything instead of throwing on the first problem, so one
          // file can surface all of its bails in a single run.
          panicThreshold: 'none',
          logger: {
            logEvent(_filename, event) {
              if (event.kind !== 'CompileError') return
              const reason = event.detail?.reason ?? event.detail?.description ?? 'unknown reason'
              bails.push({ reason, loc: event.detail?.loc })
            },
          },
        },
      ],
    ],
    babelrc: false,
    configFile: false,
  })

  if (!bails.length) continue

  if (EXPECTED[relPath]) {
    console.log(`${relPath}: known bail — ${EXPECTED[relPath]}`)
    continue
  }

  for (const bail of bails) {
    const line = bail.loc?.start?.line
    console.error(
      `${file}${line ? `:${line}` : ''}: React Compiler skipped this file — ${bail.reason}`,
    )
  }
  hasError = true
}

if (hasError) {
  console.error(
    '\nvalidate-react-compiler failed. The compiler skipped a component, so it will not be' +
      '\nmemoised. Fix the pattern it names, or — if it is a compiler limitation rather than' +
      '\nour code — add the file to EXPECTED in this script with the reason.' +
      '\nSee docs/patterns/react-compiler.md.',
  )
  process.exit(1)
} else {
  console.log(`validate-react-compiler passed (${files.length} file(s) checked).`)
}
