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

The checklist lives in `src/blocks/_template.md`. Grouped by what actually
enforces it — the point of this table is that **only about six of the thirty are
machine-checked**; the rest depend on someone looking.

| Group | Items | Enforced |
|---|---|---|
| Accessibility AAA | 5 | `<section>` landmark by `validate-block-markup.mjs`; the rest by review |
| HTML semantics | 3 | Review |
| Performance | 3 | Raw `<img>` blocked by `validate-no-raw-icon-image.mjs` and a GritQL plugin |
| SEO / AIO / GEO | 3 | Review |
| Analytics GA4 | 1 | `data-ga-block` by `validate-block-markup.mjs` |

| Design System CSS | 11 | 4 of the rules by `validate-ds-tokens.mjs`; `bp-content-grid` by `validate-block-markup.mjs` |
| Delivery | 4 | Unit tests by CI; the rest by review |

`GAListener.tsx:27-28` reads **both** GA attributes, into different params:
`data-ga-block` becomes `block`, `data-ga-section` becomes `section`. They are
dimensions, not alternatives — `data-ga-block` is the required one, and the
template's events table was asking for the wrong one until 2026-08-06.

**The denominator is 30.** Count the boxes in `_template.md` and you get
5 + 3 + 3 + 3 + 1 + 11 + 4 = 30. An earlier version of this document asserted 21,
copied from the template's own header, which was also wrong — so a block with
nine unticked boxes scored 100%, and the READMEs closest to correct (22) were
the ones it told you to "fix". Existing READMEs written against 19 or 21 are
under-counted; recompute when you touch them.

**100% is not reachable honestly, and that is fine.** Several items cannot be
evaluated without rendering the block — 7:1 contrast, cumulative layout shift,
"markup copied verbatim from the DS site". `src/blocks/CLAUDE.md` says to leave
manual items unticked, which structurally caps an honest README below 100%.
Treat the number as a map of what is unverified, not a grade. **A block at 60%
with four business answers and honest gaps is more finished than one at 100%
where somebody ticked contrast by eye.**

## Part 3 — Before merging

- `pnpm vitest run tests/unit` green, including tests for this block.
- `pnpm exec tsc --noEmit` clean.
- The block renders correctly with **no data** and with **too much data**. This
  has no checklist box on purpose — it is a thing you do, not a thing you tick —
  but it is where CMS-driven blocks actually break. `MachineFamily` silently caps
  at five highlights; the sixth vanishes with no warning to the editor. Say what
  the cap is in the README, or remove it.
- Both locales checked. If the block touches an array with localized subfields,
  read [`docs/patterns/payload-localized-arrays.md`](../patterns/payload-localized-arrays.md) first.
- If it is a client component, `node scripts/validate-react-compiler.mjs <file>`
  passes — see [`docs/patterns/react-compiler.md`](../patterns/react-compiler.md).
- `README.md` written from `_template.md`, with the four business answers **and
  the Production setup section**. Merged code is not a shipped feature: a block
  nobody adds to a page in `/admin` renders nowhere, and that step is the one
  that goes missing between merge and "why isn't it live?".
- `docs/blocks/README.md` regenerated so the index does not drift.

## What this deliberately does not require

**Screenshots at creation time.** The template asks for desktop and mobile
captures, and they go stale faster than anything else in the document. Take them
when the block is marked finished for client delivery, not while it is still
moving.

**100% before merging.** A block can ship with gaps named in its README. What is
not acceptable is an unticked box nobody noticed — the difference between a known
gap and a surprise.

**A business answer invented to fill the box.** Three of the four questions have
no source in this repo yet: [`audiences.md`](./audiences.md) and
[`voice-and-tone.md`](./voice-and-tone.md) are skeletons awaiting the client.
Writing "cannot determine — no audience brief exists" is the correct answer and
it is more useful than a guess, because it counts the gap.
