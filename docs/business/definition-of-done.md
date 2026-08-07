---
title: Definition of Done
read_when: Starting a block, and again before calling one finished.
enforced_by: partly — see the "Enforced" column
---

# Definition of Done

A block is not done when it renders. It is done when the client can operate it,
a visitor can use it on any device with any assistive technology, and a search
or generative engine can quote it.

This document is the single source. `src/blocks/_template.md` carries the
checklist you tick per block; this explains what each part means and adds the
business half, which no checklist covered before.

## Part 1 — Business

Answer these in the block's `README.md`, in prose, before writing the checklist.
They take five minutes and they are the ones that change what you build.

**Who is this for, and where are they?** Amerikiosks sells to brands placing
kiosks, to venues hosting them, and to agencies brokering both. A block aimed at
a venue manager comparing footprints is not the same block as one aimed at a
brand evaluating the whole line. If the answer is "everyone", the block has no
job.

**What question does it answer?** Write the question a visitor would actually
type or ask an assistant. This is the AIO/GEO criterion the roadmap already
treats as a business decision, and it is what determines whether the content
gets cited or skipped. "Hot food in about 50 seconds" answers something;
"innovative solutions" answers nothing.

**What happens when it is empty?** CMS-driven blocks break where nobody looks:
a family with no highlights, a carousel with one item, a spec label three times
longer than the others. State the intended behaviour — render nothing, fall back,
or show a placeholder — and make sure the code does it. Rendering nothing is
usually right and is the cheapest to reason about.

**What can the client change, and what can't they?** Every field is either
authorable or derived, and derived means it must stay derived. A model count
typed by hand disagrees with the machines collection within a month. Whatever
you decide here goes into `docs/CLIENT-MANUAL.md`, which is a project
deliverable, not an afterthought.

## Part 2 — Technical

The 21-item checklist lives in `src/blocks/_template.md`. Grouped by what
actually enforces it:

| Group | Items | Enforced |
|---|---|---|
| Accessibility AAA | 5 | `<section>` landmark by `validate-block-markup.mjs`; the rest by review |
| HTML semantics | 3 | Review |
| Performance | 3 | Raw `<img>` blocked by `validate-no-raw-icon-image.mjs` and a GritQL plugin |
| SEO / AIO / GEO | 3 | Review |
| Analytics GA4 | 1 | `data-ga-block` by `validate-block-markup.mjs` |
| Design System CSS | 11 | 4 of the rules by `validate-ds-tokens.mjs`; `bp-content-grid` by `validate-block-markup.mjs` |
| Delivery | 4 | Unit tests by CI; the rest by review |

Two notes on the score. **The denominator is 21** — files in the repo currently
show 19, 21 and 22, which makes the percentages incomparable; use 21 and fix the
outliers when you touch them. And **a percentage is not a gate**: 100% means
ready for client delivery, under 80% means not shippable, but a block at 90% with
an unanswered business question is less finished than one at 80% with all four
answered.

## Part 3 — Before merging

- `pnpm vitest run tests/unit` green, including tests for this block.
- `pnpm exec tsc --noEmit` clean.
- The block renders correctly with **no data** and with **too much data**.
- Both locales checked. If the block touches an array with localized subfields,
  read [`docs/patterns/payload-localized-arrays.md`](../patterns/payload-localized-arrays.md) first.
- If it is a client component, `node scripts/validate-react-compiler.mjs <file>`
  passes — see [`docs/patterns/react-compiler.md`](../patterns/react-compiler.md).
- `README.md` written from `_template.md`, with the four business answers.
- `docs/blocks/README.md` regenerated so the index does not drift.

## What this deliberately does not require

**Screenshots at creation time.** The template asks for desktop and mobile
captures, and they go stale faster than anything else in the document. Take them
when the block is marked finished for client delivery, not while it is still
moving.

**100% before merging.** A block can ship at 80% with the gaps named in its
README. What is not acceptable is an unticked box nobody noticed, which is the
difference between a known gap and a surprise.
