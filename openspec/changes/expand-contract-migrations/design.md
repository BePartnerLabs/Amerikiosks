# Expand-contract for destructive migrations — design

> Removes the window in which a release can serve 500s, rather than covering it
> with a maintenance page. Comes from the v1.38.0 outage.

## Context

A release runs `pnpm payload migrate` against the production database **while the
old build is still serving traffic**, and only promotes the new build afterwards.
Anything the migration removes is therefore missing from under the feet of code
that is still running.

v1.38.0 proved it. The migration moved the Form block's panel columns into a
`_locales` table and dropped the originals; for ~90 seconds the home page and
`/contact` answered `column pages__blocks_formBlock.intro_content does not
exist`. `/machines` stayed up only because it carries no form block. The
workflow's own comment had assumed reads survive a column move — they do not.

Two mitigations already shipped and neither closes the window:

- **#191** closes the public site during the migrate→deploy window, but only for
  releases that drop or rename. That is a maintenance page, not an absence of
  downtime.
- **#205** fixed the detection that decided when to do that: it read the whole
  migration file, so a `down` undoing an `ADD COLUMN` made *every* migration look
  destructive.

## The change

Split a destructive schema change across two releases.

**Release 1 — expand.** Add the new structure and backfill it. **Keep the old
columns.** The schema now satisfies both the old build (still reading the old
columns during the window) and the new one. Nothing is dropped, so nothing can
be missing.

**Release 2 — contract.** Once the new build is live and nothing reads the old
columns, drop them. By then no running code refers to them, so the window is
harmless.

At no point are the running code and the schema in disagreement.

## Cost, stated plainly

- **Payload's generated migrations bundle the `DROP`.** They have to be
  hand-edited to defer it, which means someone must notice that a given
  migration is destructive — `plan`'s `hasMigrations`/`destructive` outputs in
  `deploy.yml` already compute exactly that and can be the prompt.
- **Two releases per localization change**, and the second is easy to forget.
  An orphaned column is harmless but accumulates; the `autosave` columns dropped
  in #194 are what that looks like after a year.
- Backfills run against production data. The forms verification script
  (`./scripts/verify-forms-migration.sh --round-trip`) is the existing tool for
  proving one does not lose content.

## Scope

**Worth it for:** blocks that appear on high-traffic pages — anything carrying a
form block, the hero, the header/footer globals. Those are the pages where 90
seconds of 500s is visible.

**Not worth it for:** admin-only collections, or tables the public site never
reads. The maintenance page covers those at a fraction of the effort.

## Not chosen

- **Blue-green the database.** Correct in the abstract, disproportionate for a
  site taking ~6 leads a month, and Neon branching would still need the
  application to agree on which branch is authoritative mid-release.
- **Migrate after promotion instead of before.** Inverts the problem rather than
  solving it: the new build then queries a schema that has not changed yet.
- **Always close the public site.** Considered and rejected in #191 — most
  releases carry no migration at all, so it would be needless downtime.

## Open question

Whether to enforce it or leave it to judgement. A CI check could refuse a
release whose migration contains a `DROP` in `up` unless a marker says the
expand half already shipped. That is a stronger guarantee and a heavier process;
it should not be built until expand-contract has been done by hand at least once.
