<!--
Delete any section that does not apply. An empty heading is worse than no
heading — it reads as "we checked and there was nothing", which is a claim.
-->

## What and why

<!-- What changes, and the reason. If a bug: what broke, and what the root
cause turned out to be — not just the symptom. -->

## Verification

<!-- What you actually ran, with the result. "Tests pass" is not verification;
"1089 tests, 163 files, green" is. Say what you did NOT check. -->

---

### Did anything here cost more than half an hour?

If yes, it probably belongs in [`docs/patterns/`](../docs/patterns/README.md) —
one file, with the incident that motivated it. The bar is: **it cost real time,
and the reason is not obvious from the code.**

Before writing it, answer the `enforced_by` question. If a
`scripts/validate-*.mjs`, a GritQL plugin in `biome-plugins/`, or a Biome rule
could catch it instead, **build that** — the enforcement is the documentation,
and it does not rot.

Most PRs answer "no" here. That is the expected answer.

### If this adds or changes a block

- [ ] `README.md` from `src/blocks/_template.md`, including the four business
      questions in [`docs/business/definition-of-done.md`](../docs/business/definition-of-done.md).
      "Cannot determine — no audience brief exists" is a valid answer; a guess is not.
- [ ] **Production setup** section filled — what someone has to create in
      `/admin` for this to appear. Merged code is not a shipped feature.
- [ ] Renders correctly with **no data** and with **too much data**
- [ ] Both locales checked

### If this needs anything done in `/admin` after deploy

Say it here too, not only in the block README — this is the list someone works
through on release day. Content to create, in which locales, in what order,
and anything that is not automatic.

### If this adds a migration

Say whether it was round-tripped locally against a production restore, or
whether it needs a `preview/**` rehearsal first. Per `CLAUDE.md`, one of the two
has to happen — a release migrates production with no dry run.
