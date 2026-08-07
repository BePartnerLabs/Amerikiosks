---
title: React Compiler
read_when: Touching a client component, or the compiler silently stops memoising one.
enforced_by: scripts/validate-react-compiler.mjs
---

# React Compiler

`next.config.ts` enables the React Compiler. It memoises components at build
time so you do not have to write `useMemo` and `useCallback` by hand.

The thing to understand about it: **it safe-fails silently.** When it meets a
pattern it cannot reason about, it skips that file and leaves your code exactly
as written. The build succeeds. Nothing in the output says so. A component can
stop being memoised and nobody finds out for months.

That is what `scripts/validate-react-compiler.mjs` exists for — it runs the
compiler over the files you touched and fails the commit if one starts bailing.

## Diagnose with Babel 7, never Babel 8

`babel-plugin-react-compiler` reads a **Babel 7** AST. Under `@babel/core` 8 it
produces a flood of false positives:

```
(BuildHIR::lowerAssignment) Expected object property value to be an LVal,
got: AssignmentPattern
```

— one for every destructured prop with a default value, which is most
components in any codebase.

On 2026-08-06 those false positives sent us refactoring **eleven files that had
nothing wrong with them**, and produced a confident diagnosis of a project-wide
"antipattern" that did not exist. Re-running under Babel 7 cleared all eleven.

`@babel/core` and `@babel/preset-typescript` are pinned to `^7` in
`package.json` for exactly this reason. **Do not bump them to 8 expecting a
no-op** — the validator will start failing on healthy code.

## The two rules that actually bite here

### Do not read a ref during render

The compiler's most common real complaint. It covers more than the obvious
`ref.current` in the render body — it also fires when a ref reaches JSX through
an object returned by a hook.

```ts
// ✗ The compiler treats `card.ref` in JSX as a ref read during render and
//   skips the whole consuming component.
function useClickableCard() {
  return { card: { ref: cardRef }, link: { ref: linkRef } }
}
// consumer: <article ref={card.ref}>

// ✓ Return refs at the top level, so the consumer gets a plain binding.
function useClickableCard() {
  return { cardRef, linkRef }
}
// consumer: <article ref={cardRef}>
```

This was a real bail in `src/components/Card/index.tsx`, fixed by reshaping
`src/utilities/useClickableCard.ts`. **If you write a hook that returns a ref,
return it directly rather than nested inside an object.**

### `'use memo'` in annotation mode is not reliable

The compiler was first enabled with `compilationMode: 'annotation'`, where only
components carrying a `'use memo'` directive get compiled. It was abandoned:
`src/components/MachinesLanding/Scene.tsx` compiled, while
`src/blocks/MachineLineup/Component.tsx` — equivalent code, same directive in
the same position — did not. Next pre-filters in SWC which files reach the Babel
pass, and the directive alone does not guarantee inclusion.

A directive that applies sometimes is worse than none, so the config is now
plain `reactCompiler: true` and the compiler decides.

## Known bails that are not our fault

Nine files bail for compiler limitations rather than bad code. They live in
`EXPECTED` in the validator, each with its reason, so a *new* bail stands out
instead of drowning in known noise:

- **Value blocks inside `try/catch`** (7 files) — the admin's resync and
  attachment buttons. The compiler cannot yet lower conditional or optional
  expressions inside a `try` block.
- **`Use of incompatible library`** (`src/blocks/ClaimForm/Component.tsx`) — a
  third-party hook the compiler cannot analyse.
- **`??=`** (`src/blocks/TrustStrip/Tracker.tsx`) — operator not yet handled.

When a compiler upgrade fixes one of these, delete its entry.

## One open item that *is* ours

`src/blocks/Form/Component.tsx` reports two `Cannot access refs during render`
bails **with no location attached**. Three hypotheses were tested and none
reduced the count: removing the refs handed to `useFormSubmission`, the
`lastDataRef.current` read in the retry callback, and the `Date.now()` ref
initialiser. Isolating it means bisecting a 400-line component that owns the
client's lead capture, so it is deferred rather than guessed at.

It sits in `EXPECTED` marked as the one entry that is our code. Do not remove
that marker without a fix that keeps the form's tests green.

## Measuring the cost

Build time in annotation mode was indistinguishable from no compiler at all
(12.5s / 15.2s / 12.5s without, 13.6s / 12.2s / 13.4s with, warm cache).

**Measure warm builds only.** Any change to `next.config.ts` invalidates
Turbopack's persistent cache, so the first build after touching the config
reports 40–80s and inverts the conclusion. Two cold runs nearly got the compiler
rejected on false evidence.

What has *not* been measured is the actual reduction in re-renders. That needs
the React DevTools Profiler with a scroll running. The cost side is proven; the
benefit is reasoned from the code.
