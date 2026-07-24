# Placement Application — design

> Second of two independent form-integration changes decided together — see `openspec/changes/kiosk-development-application/design.md` for the shared architecture (generic Form/drawer reuse, `integrationTarget`/`externalId` config schema, `dispatchFormSync` hook, `GenericJotFormRepository`/`GenericMondayRepository`, the new `Upload` field renderer). **This change depends on that shared plumbing existing** — build/merge `feat/kiosk-development-application` first, or duplicate the shared pieces if built independently. This doc only covers what's specific to this form: its JotForm source, its Monday board, and its own field mapping.

## Context

The venue/property "Placement Application" is currently a standalone JotForm form (`https://form.jotform.com/form/222934503618153`) — not part of this site. Rebuilt the same way as the kiosk-development form: an ordinary Payload `Form` document, opened via the existing modal-drawer CTA pattern, synced to the Monday.com board **"Amerikiosks Placement"** (id `4024476985`).

Verified the same way: the JotForm form was cloned via the API (`POST /form/{id}/clone` → clone id `262038017294051`) to read authoritative `questions` metadata, and the Monday board's `columns`/`groups` pulled live via GraphQL.

## Scope

**In scope:**
- The "Placement Application" `Form` document, configured in `/admin` (or via the MCP-enabled `forms` collection, see the kiosk-development change) with the field list below, `integrationTarget: monday`, `externalId: '4024476985'`, `mondayGroupId: 'topics'`.
- Nothing else — no new shared code. If the kiosk-development change's plumbing isn't merged first, this change needs to bring `formOverrides` additions, `dispatchFormSync.ts`, `GenericJotFormRepository`/`GenericMondayRepository`, and the `Upload` field renderer with it (duplicated, not re-designed).

**Out of scope:** identical to the kiosk-development change — the original JotForm form stays live untouched, no public UI to pick a target, no multi-step/panel grouping (see `docs/ROADMAP.md`), no dual-dispatch.

## Field mapping

Verified via JotForm's `GET /form/{id}/questions` API (clone `262038017294051`) and Monday's `boards { columns }` GraphQL query (board `4024476985`):

| Form field (label) | JotForm qid | Monday column id | Notes |
|---|---|---|---|
| Property Type (dropdown) | `29` | `dropdown5` ("Property Type") | Monday column is typed `text`, not `dropdown` — send the label as plain text, not `{label: ...}` |
| Property Name | `15` | `text0` ("Brand") | column title doesn't match ("Brand"), but it's the only free-text column left after Address/Contact/Phone/Email/Location/Rooms/Traffic are placed — confirm with client before finalizing |
| Which kiosks looking to add (checkbox) | `40` | — (no matching column) | JotForm only |
| Address (compound: `addr_line1`/`addr_line2`/`city`/`state`/`postal`) | `4` | `text` ("Address") | flattened to one string, same convention as `Claims.location` |
| Contact Name (compound: `first`/`last`) | `3` | `long_text6` ("Contact Name") | concatenated — Monday column isn't split first/last |
| Phone Number (compound, `full`) | `5` | `phone` | |
| E-mail | `6` | `email` | |
| Suggested Location in the building | `9` | `text7` ("Location in the building") | |
| Estimated Daily Traffic | `17` | `numbers8` ("Daily Traffic") | |
| Number of rooms in the building | `16` | `numbers` ("Rooms") | |
| Current Occupancy Percentage | `19` | `numbers19` ("Occupancy %") | |
| Additional info about property (textarea) | `11` | `text9` ("Additional info") | |
| Attach pictures/map (upload) | `18` | `files3` ("Attachments") | real file forwarded to Monday only, per the shared Upload-field design |
| Preferred installation schedule (checkbox) | `26` | — (no matching column) | JotForm only |
| Loading/Unloading zone (radio) | `28` | — (no matching column) | JotForm only |
| Access challenges (textarea) | `24` | — (no matching column) | JotForm only |

**Correction needed before implementation:** "Property Name" (qid `15`) mapping to Monday's `text0` ("Brand") is a guess of convenience, not a confirmed intent — the column title doesn't semantically match. Confirm with the client (or repurpose/rename the Monday column) before setting this `externalId` in `/admin`.

## Testing

Covered by the shared plumbing's tests (kiosk-development change) — this change doesn't add new test files beyond a config-level check (if any) that this `Form` document's field/`externalId` set round-trips correctly through the same generic repositories.

## Post-implementation

- Author the "Placement Application" `Form` document in `/admin` (or via MCP) once the "Property Name" column question above is resolved with the client.
- Manual verification: submit a real test entry, confirm it lands on Monday board `4024476985` with columns populated per the (corrected) mapping table, including one with a photo attached.
