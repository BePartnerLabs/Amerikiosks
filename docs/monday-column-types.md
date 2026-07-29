# Monday.com column types — what a form can actually write

Verified empirically against the live Monday API (API-Version `2024-10`) on a
throwaway private board in the **Bepartnerlabs** account, not from the docs:
every row below was produced by creating the column, writing a value with
`create_item`, and **reading the value back**. That last step matters — several
columns accept a junk payload and return 200 while storing nothing useful.

Monday's `ColumnType` enum has 43 values (`query { __type(name: "ColumnType") { enumValues { name } } }`).

Two names for the same thing, and mixing them up costs an afternoon:

- the **friendly type** — what `columns { type }` returns (`checkbox`, `timeline`, `status`), and what `create_column` takes;
- the **internal type** — the prefix of the generated column id (`boolean_…`, `timerange_…`, `color_…`).

`buildColumnValue` in `src/collections/FormSubmissions/hooks/syncFormSubmission.ts`
switches on the **friendly** type, which is what `mondayBoardsCache` stores.

## Writable from a form submission

The JSON below is the exact payload that worked. `create_item(column_values: …)`
takes a JSON **string**, so these are the values inside that object.

| Friendly type | Payload that works | Read back as | Notes |
|---|---|---|---|
| `text` | `"Hello world"` | `Hello world` | Plain string. The `{"text": …}` wrapper is **rejected** here. |
| `long_text` | `{"text": "line\nline"}` | both lines | Newlines survive. |
| `numbers` | `"42"` | `42` | String is fine. |
| `checkbox` | `{"checked": "true"}` | `v` | The **string** `"true"`. A real boolean leaves it unchecked. |
| `date` | `{"date": "2026-08-01", "time": "14:30:00"}` | `2026-08-01 10:30` | ⚠️ Time is read as UTC and rendered in the viewer's timezone — see caveat below. |
| `dropdown` | `{"labels": ["Retail"]}` | `Retail` | Needs `create_labels_if_missing: true` unless the label already exists on the board. |
| `status` | `{"label": "Working on it"}` | `Working on it` | Same `create_labels_if_missing` rule. A plain `"Stuck"` string also works, so our default fallback already handles this column. |
| `email` | `{"email": "a@b.com", "text": "a@b.com"}` | `a@b.com` | |
| `phone` | `{"phone": "+15125550101", "countryShortName": "US"}` | `+15125550101` | Digits only in `phone`; formatting is rejected. |
| `link` | `{"url": "https://x.com", "text": "x.com"}` | `x.com - https://x.com` | |
| `country` | `{"countryCode": "US", "countryName": "United States"}` | `United States` | Both keys required. |
| `hour` | `{"hour": 14, "minute": 30}` | `02:30 PM` | Integers, not strings. |
| `week` | `{"week": {"startDate": "2026-08-03", "endDate": "2026-08-09"}}` | `2026-08-03 - 2026-08-09` | Nested under `week`, and must be a real Mon–Sun week. |
| `timeline` | `{"from": "2026-08-01", "to": "2026-08-05"}` | `2026-08-01 - 2026-08-05` | Internal type is `timerange`. |
| `rating` | `{"rating": 4}` | `4` | |
| `world_clock` | `{"timezone": "America/New_York"}` | `America/New York` | IANA name. Internal type is `timezone`. |
| `location` | `{"lat": "40.7128", "lng": "-74.0060", "address": "New York, NY"}` | `New York, NY` | |
| `tags` | `{"tag_ids": [29765987]}` | `kiosk` | **Ids only.** `"kiosk, retail"` is rejected; get ids first with `create_or_get_tag`. |
| `people` | `{"personsAndTeams": [{"id": 111872154, "kind": "person"}]}` | `Jorge Saud` | Needs a real Monday user id — not reachable from a public form. |
| `file` | — | — | Not written via `column_values`; needs `add_file_to_column` (what `GenericMondayRepository` already does). |

### The `date` timezone caveat

Sent `14:30:00`, the board displays `10:30`. The stored value is exactly what
was sent; only the rendering shifts, because Monday treats the time as UTC and
renders it in the account's timezone. Converting on our side would need the
visitor's timezone, which the submission does not carry. Left as-is on purpose.

## Accepted but useless from a form

`team` (needs a real team id), `dependency` (needs item ids), `doc`, `button`,
`integration` — the write returns 200 and stores nothing a form answer could
fill. Don't map a form field to these.

## Rejected: computed columns

`auto_number`, `item_id`, `creation_log`, `last_updated`, `formula`, `progress`,
`mirror` — *"This column type can not be updated or created (client side auto
calculated column)"*. Monday fills them itself.

## Rejected: not supported by the API

- **Cannot be written**: `color_picker`, `time_tracking`, `vote` — *"This column type is not supported yet in the API"*.
- **Cannot even be created** via `create_column`: `board_relation`, `direct_doc`, `item_assignees`, `mirror`, `person`, `subtasks`, `group`, `name`, `unsupported`.

If the client adds one of these to a board and points a form field at it, the
sync fails for the whole item — which is what the `externalId` validator
(`src/utilities/detectMondayDrift.ts`) is there to catch at edit time.

## Coverage of our own field types

What `buildColumnValue` handles today, and what a form field can be pointed at:

| Our field block | Safe Monday columns |
|---|---|
| `text` | `text`, and `phone`/`link` via the field's **Value type** |
| `textarea` | `long_text` |
| `email` | `email` |
| `number` | `numbers`. **Not** `rating`: that column rejects a plain `"3"` and needs `{"rating": 3}`, which `buildColumnValue` does not build yet. |
| `select` / `radio` | `dropdown`, `status` |
| `checkbox` / `toggle` | `checkbox` |
| `date` | `date` (with or without time) |
| `country` / `state` | `text`; `country` needs the `countryCode` + `countryName` pair, which the plugin's field does not provide |
| `upload` | `file`, via `add_file_to_column` |

**Not covered by `buildColumnValue` yet**, though the column is writable:
`country`, `hour`, `week`, `timeline`, `location`, `tags`, `rating`. None of the
client's current boards use them for form intake; add a `case` when one does.

Two columns are already handled by the plain-string `default` branch and need no
`case` of their own — verified, not assumed: `status` accepts `"Stuck"` and
`date` accepts `"2026-08-02"` (date only; the `{date, time}` shape is only
needed to also fill the time).
