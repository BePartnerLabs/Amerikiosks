#!/usr/bin/env bash
# Proves that applying the pending migrations does not lose a form, a field,
# a label, a select option or a Form block's panel content.
#
# Run it on a *production restore* (./scripts/restore-prod-dump.sh) — that is
# the only data that can show what real content the migrations touch. A fresh
# local database has nothing to lose and will pass no matter what.
#
#   ./scripts/verify-forms-migration.sh              # snapshot → migrate → compare
#   ./scripts/verify-forms-migration.sh --round-trip # ...then down, up and compare again
#
# The comparison is semantic, not a table diff: these migrations move columns
# into _locales tables, so a raw diff would report differences by design.
set -euo pipefail

OUT="${TMPDIR:-/tmp}/forms-migration-check"
mkdir -p "$OUT"

echo "== snapshot before migrating =="
python3 scripts/snapshot-forms.py "$OUT/pre.json"

echo "== applying pending migrations =="
pnpm payload migrate

echo "== snapshot after migrating =="
python3 scripts/snapshot-forms.py "$OUT/post.json"

echo "== comparing =="
python3 scripts/compare-form-snapshots.py "$OUT/pre.json" "$OUT/post.json"

if [[ "${1:-}" == "--round-trip" ]]; then
  # Exercises the down paths too — the localized-panel migration restores the
  # inline columns from the locales table, and a wrong down loses one locale.
  echo
  echo "== rolling back and re-applying =="
  pnpm payload migrate:down
  pnpm payload migrate:down
  pnpm payload migrate
  python3 scripts/snapshot-forms.py "$OUT/post2.json"
  python3 scripts/compare-form-snapshots.py "$OUT/pre.json" "$OUT/post2.json"
fi
