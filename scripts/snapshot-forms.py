"""Content-level snapshot of every form and its config, taken straight from
Postgres so it works on either side of a schema change.

Compares *meaning*, not table shape: the migrations under test move columns into
_locales tables, so a raw table diff would report differences by design.
"""

import json
import subprocess
import sys

DB = ["podman", "exec", "website_postgres_1", "psql", "-U", "payload", "-d", "amerikiosks", "-tAc"]

FIELD_TABLES = [
    "text",
    "textarea",
    "email",
    "number",
    "select",
    "checkbox",
    "country",
    "state",
    "upload",
    "message",
    # Present only after this branch's migrations; skipped when missing.
    "radio",
    "date",
    "toggle",
]


def q(sql):
    out = subprocess.run([*DB, sql], capture_output=True, text=True)
    if out.returncode != 0:
        raise RuntimeError(out.stderr.strip())
    return [line for line in out.stdout.strip().split("\n") if line]


def rows(sql):
    return [json.loads(line) for line in q(sql)] if q(sql) else []


def table_exists(name):
    return q(
        f"select count(*) from information_schema.tables where table_schema='public' and table_name='{name}'"
    )[0] == "1"


def columns(name):
    return set(
        q(
            f"select column_name from information_schema.columns where table_schema='public' and table_name='{name}'"
        )
    )


snapshot = {"forms": {}, "pageBlocks": []}

# ── forms and their document-level config ──────────────────────────────────
form_cols = columns("forms")
wanted = [
    c
    for c in [
        "id",
        "title",
        "integration_target",
        "external_id",
        "monday_group_id",
        "confirmation_type",
        "redirect_url",
        "requires_consent",
    ]
    if c in form_cols
]
for row in rows(
    "select json_build_object("
    + ",".join(f"'{c}', {c}" for c in wanted)
    + ") from forms order by id"
):
    snapshot["forms"][str(row["id"])] = {"doc": row, "fields": [], "locales": {}}

# Localized form-level values (title/confirmation message live here).
loc_cols = columns("forms_locales") & {
    "_locale",
    "_parent_id",
    "title",
    "submit_button_label",
    "confirmation_message",
    "confirmation_heading",
    "confirmation_next",
}
for row in rows(
    "select json_build_object("
    + ",".join(f"'{c}', {c}" for c in sorted(loc_cols))
    + ") from forms_locales order by _parent_id, _locale"
):
    form = snapshot["forms"].get(str(row["_parent_id"]))
    if form:
        form["locales"][row["_locale"]] = {
            k: v for k, v in row.items() if k not in ("_parent_id", "_locale")
        }

# ── one row per field, with its label per locale and its options ───────────
for kind in FIELD_TABLES:
    table = f"forms_blocks_{kind}"
    if not table_exists(table):
        continue
    cols = columns(table)
    keep = [
        c
        for c in ["id", "_parent_id", "_order", "name", "required", "external_id", "value_type", "granularity", "default_value", "width", "autocomplete"]
        if c in cols
    ]
    for row in rows(
        "select json_build_object("
        + ",".join(f"'{c}', {c}" for c in keep)
        + f") from {table} order by _parent_id, _order"
    ):
        form = snapshot["forms"].get(str(row["_parent_id"]))
        if not form:
            continue
        entry = {"blockType": kind, **{k: v for k, v in row.items() if k != "_parent_id"}}

        lt = f"{table}_locales"
        if table_exists(lt):
            lcols = columns(lt) & {"_locale", "label", "message", "default_value", "consent_text"}
            sel = sorted(lcols)
            entry["labels"] = {
                r["_locale"]: {k: v for k, v in r.items() if k != "_locale"}
                for r in rows(
                    f"select json_build_object("
                    + ",".join(f"'{c}', {c}" for c in sel)
                    + f") from {lt} where _parent_id = '{row['id']}' order by _locale"
                )
            }

        ot = f"{table}_options"
        if table_exists(ot):
            entry["options"] = [
                r
                for r in rows(
                    f"select json_build_object('value', o.value, 'labels', ("
                    f"select json_object_agg(ol._locale, ol.label) from {ot}_locales ol where ol._parent_id = o.id))"
                    f" from {ot} o where o._parent_id = '{row['id']}' order by o._order"
                )
            ]

        form["fields"].append(entry)

# ── the Form block on pages, including the panel fields the migration moves ─
pb_cols = columns("pages_blocks_form_block")
base = [c for c in ["id", "_parent_id", "_order", "form_id", "layout", "enable_intro"] if c in pb_cols]
panel_inline = [c for c in ["panel_label", "panel_headline", "intro_content"] if c in pb_cols]
for row in rows(
    "select json_build_object("
    + ",".join(f"'{c}', {c}" for c in base + panel_inline)
    + ") from pages_blocks_form_block order by _parent_id, _order"
):
    entry = dict(row)
    if table_exists("pages_blocks_form_block_locales"):
        entry["panelByLocale"] = {
            r["_locale"]: {k: v for k, v in r.items() if k != "_locale"}
            for r in rows(
                "select json_build_object('_locale', _locale, 'panel_label', panel_label,"
                " 'panel_headline', panel_headline, 'intro_content', intro_content)"
                f" from pages_blocks_form_block_locales where _parent_id = '{row['id']}' order by _locale"
            )
        }
    snapshot["pageBlocks"].append(entry)

json.dump(snapshot, open(sys.argv[1], "w"), indent=2, sort_keys=True, default=str)
print(
    f"snapshot: {len(snapshot['forms'])} forms, "
    f"{sum(len(f['fields']) for f in snapshot['forms'].values())} fields, "
    f"{len(snapshot['pageBlocks'])} form blocks on pages -> {sys.argv[1]}"
)
