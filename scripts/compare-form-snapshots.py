"""Asserts that migrating did not lose a form, a field or any of their config.

Compares the two snapshots semantically. The only differences allowed are the
ones the migrations are *supposed* to make:

  - new nullable columns appearing on a field (value_type, autocomplete,
    granularity) — allowed only when the new value is null;
  - the Form block's panel fields moving from inline columns into
    pages_blocks_form_block_locales, where the default locale must end up
    holding exactly what the inline column held.
"""

import json
import sys

pre = json.load(open(sys.argv[1]))
post = json.load(open(sys.argv[2]))

failures = []
notes = []

# Values a newly added column is allowed to hold on a pre-existing row.
NEW_COLUMN_EXPECTED = {
    # DEFAULT 'text'; 'phone'/'website' come from the backfill that reads the
    # target Monday column's type.
    "value_type": {"text", "phone", "website"},
    "granularity": {"date"},
}

# ── forms ───────────────────────────────────────────────────────────────────
if set(pre["forms"]) != set(post["forms"]):
    failures.append(
        f"form ids changed: only in pre {sorted(set(pre['forms']) - set(post['forms']))}, "
        f"only in post {sorted(set(post['forms']) - set(pre['forms']))}"
    )

for fid, before in pre["forms"].items():
    after = post["forms"].get(fid)
    if not after:
        continue
    label = f"form {fid} ({before['doc'].get('title')})"

    for key, value in before["doc"].items():
        if key not in after["doc"]:
            failures.append(f"{label}: column {key} disappeared (was {value!r})")
        elif after["doc"][key] != value:
            failures.append(f"{label}: {key} changed {value!r} -> {after['doc'][key]!r}")

    if before["locales"] != after["locales"]:
        for loc, vals in before["locales"].items():
            got = after["locales"].get(loc)
            if got is None:
                failures.append(f"{label}: locale {loc} lost entirely")
                continue
            for k, v in vals.items():
                if got.get(k) != v:
                    failures.append(f"{label} [{loc}]: {k} changed {v!r} -> {got.get(k)!r}")

    # Fields are matched by id, not position: a migration that recreated rows
    # instead of altering them is exactly the failure we are looking for.
    before_by_id = {f["id"]: f for f in before["fields"]}
    after_by_id = {f["id"]: f for f in after["fields"]}
    lost = set(before_by_id) - set(after_by_id)
    if lost:
        for i in sorted(lost):
            failures.append(f"{label}: field row {i} ({before_by_id[i].get('name')}) lost")
    for i, bf in before_by_id.items():
        af = after_by_id.get(i)
        if not af:
            continue
        for k, v in bf.items():
            if k not in af:
                failures.append(f"{label}/{bf.get('name')}: {k} disappeared (was {v!r})")
            elif af[k] != v:
                failures.append(f"{label}/{bf.get('name')}: {k} changed {v!r} -> {af[k]!r}")
        for k, v in af.items():
            if k not in bf:
                # A column added by these migrations may arrive with its declared
                # default, or — for value_type — with what the backfill derived
                # from the target Monday column. Anything else means a migration
                # invented data for an existing row, which is a failure.
                if v is None or v in NEW_COLUMN_EXPECTED.get(k, set()):
                    notes.append(f"{label}/{bf.get('name')}: new column {k} = {v!r}")
                else:
                    failures.append(
                        f"{label}/{bf.get('name')}: new column {k} arrived unexpected: {v!r}"
                    )

# ── the Form block's panel fields ───────────────────────────────────────────
pre_blocks = {b["id"]: b for b in pre["pageBlocks"]}
post_blocks = {b["id"]: b for b in post["pageBlocks"]}
if set(pre_blocks) != set(post_blocks):
    failures.append("form block rows on pages changed")

PANEL = ["panel_label", "panel_headline", "intro_content"]
for bid, before in pre_blocks.items():
    after = post_blocks.get(bid)
    if not after:
        continue
    for key in PANEL:
        was = before.get(key)
        if was is None:
            continue
        # After the migration the value must be readable from the default locale.
        got = (after.get("panelByLocale") or {}).get("en", {}).get(key)
        if got != was:
            failures.append(
                f"form block {bid}: {key} not carried into the en locale — was {str(was)[:60]!r}, got {str(got)[:60]!r}"
            )
        else:
            notes.append(f"form block {bid}: {key} preserved in the en locale")

print(f"forms: {len(pre['forms'])} before, {len(post['forms'])} after")
print(
    f"fields: {sum(len(f['fields']) for f in pre['forms'].values())} before, "
    f"{sum(len(f['fields']) for f in post['forms'].values())} after"
)
for n in notes:
    print(f"  ok  {n}")
if failures:
    print(f"\n{len(failures)} PROBLEM(S):")
    for f in failures:
        print(f"  !!  {f}")
    sys.exit(1)
print("\nno form, field, label, option or panel value was lost.")
