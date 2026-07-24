# Kiosk development application ("Start developing your kiosk") — design

> First of two independent form-integration changes decided together — see also `openspec/changes/placement-application/`. This one lands the **shared plumbing** (generic external-sync infrastructure for form-builder forms); the placement-application change reuses it and only adds its own Form/field configuration.

## Context

"Start developing your kiosk" is currently a standalone JotForm form (`https://form.jotform.com/form/222934769553165`, internal title "Amerikiosks Design you Kiosk") — not part of this Next.js/Payload site at all. The client wants it rebuilt as a native form on this site, reachable the same way other partnership CTAs work today (a button that opens a modal drawer — `CMSLink` `type: 'modal'` → `FormBlock`, see `src/components/Link/index.tsx`), and its submissions synced to the Monday.com board **"Design your kiosk"** (id `4024508641`), the same way `Claims` now syncs to Monday (see `openspec/changes/*/monday-claims-integration` — actually filed at `docs/superpowers/specs/2026-07-22-monday-claims-integration-design.md`).

Both the JotForm form and the Monday board were inspected empirically before this design: the JotForm form was cloned into a test account via the API (`POST /form/{id}/clone`) to read its authoritative `questions` metadata (avoids guessing from scraped HTML), and the Monday board's `columns`/`groups` were pulled live via GraphQL. See the field mapping table below — every id in it is verified, not assumed.

## Decision: reuse the generic Form/drawer system, not a bespoke collection

Unlike `Claims` (a bespoke collection + a custom multi-step wizard block, `ClaimForm`), this form — and its sibling, the placement application — are built as ordinary Payload `Form` documents (`@payloadcms/plugin-form-builder`, already installed and used by every "Open a modal form" CTA on the site today). Rationale:
- No new frontend page/wizard needed — the existing modal-drawer pattern already handles presentation, portal-to-body isolation, and close/escape behavior.
- Both target forms are flat (a handful of question groups, not the branching multi-step logic `ClaimForm` has for cash vs. card refunds) — a single scrollable form in the drawer is adequate. (A generic step/panel grouping UI was considered and deliberately deferred — see `docs/ROADMAP.md` → Admin/CMS → "Generic multi-step/panel grouping for `src/blocks/Form`".)
- Content editors can build/edit the actual field list in `/admin` without a code change per form — important since there will be at least two of these (and potentially the other partnership forms mentioned in `docs/ROADMAP.md`'s PII-consent note: Brand/Venue/Agency/Emerging-Brand/Start-a-Partnership).

The trade-off: form-builder fields are generic (`{ field: string, value: unknown }[]` submissions, no typed shape like `ClaimSubmission`), so the field→external-system mapping has to be **data**, configured per `Form` document and per field — not hardcoded TypeScript like `JotFormRepository`/`MondayRepository`'s `QUESTION_ID` maps.

## Scope

**In scope (this change):**
- `formOverrides` additions to `formBuilderPlugin` (`src/plugins/index.ts`): `integrationTarget` (select: `jotform` | `monday` | `none`, default `none`), `externalId` (text, condition `integrationTarget !== 'none'`), `mondayGroupId` (text, condition `integrationTarget === 'monday'`) on the `Form` collection itself.
- Per-field-block override: an `externalId` text field added to every default form-builder field type (`text`, `textarea`, `email`, `number`, `checkbox`, `radio`, `select`, `country`, `state`, `upload`) — the JotForm qid or Monday column id that field's value goes to, contextual to the parent form's `integrationTarget`. Blank = not synced.
- New fields on `form-submissions`: `syncStatus` (`pending`/`synced`/`error`), `syncError`, `syncedAt` — same pattern as `Claims`.
- `src/blocks/Form/Upload/index.tsx` — new frontend renderer for form-builder's `upload` field type (not previously wired into `src/blocks/Form/fields.tsx`). Uploads to the private R2 bucket (`uploadPrivateFile`, reused from the Claims/ClaimForm work) on file selection; the submitted field value is the R2 **key**, not the file.
- `src/collections/FormSubmissions/hooks/dispatchFormSync.ts` — `afterChange` hook on `form-submissions`, mirrors `dispatchClaimSync.ts`: loads the related `Form`, no-ops if `integrationTarget === 'none'`, otherwise builds a generic `{ [externalId]: value }` map from `submissionData` × each field's `externalId`, dispatches to the matching generic repository, updates `syncStatus`/`syncError`/`syncedAt`.
- `src/repositories/GenericJotFormRepository.ts` — `submit(externalFormId: string, fieldMap: Record<string, string>)`, POSTs `submission[<qid>]=<value>` pairs to `https://api.jotform.com/form/<externalFormId>/submissions`, same auth/header pattern as `JotFormRepository`. File-upload fields are sent as their R2 key string (a lookup pointer, not the real file — JotForm's public API can't accept a real attachment here either, same limitation already documented in `JotFormRepository`).
- `src/repositories/GenericMondayRepository.ts` — `submit(boardId: string, groupId: string, fieldMap: Record<string, unknown>)`, `create_item` mutation with `column_values` built from the map; any field whose `externalId` matches a Monday `file`-type column additionally triggers `add_file_to_column` with the real bytes (fetched via `getPrivateFileBuffer`, reused from Claims).
- The "Start developing your kiosk" `Form` document itself, configured in `/admin` with the field list below and `integrationTarget: monday`, `externalId: '4024508641'`, `mondayGroupId: 'topics'` — **the JotForm target on this form is not configured to fire simultaneously**; per the routing decision below, one form = one active target, not a dual dispatch. (JotForm's own submissions are unaffected — the client keeps using the standalone JotForm form independently until/unless they choose to retire it, which is outside this change.)
- Enabling `forms` in `mcpPlugin`'s config (`src/plugins/index.ts`) — lets the Payload MCP server (already wired up locally, `http://127.0.0.1:3000/api/mcp`) create/edit `Form` documents directly, used to author this form's fields from the verified JotForm question table below instead of hand-entering them in `/admin`.

**Explicitly decided:**
- **Routing is fixed per `Form` document, not per-submission** (unlike `Claims.integrationTarget`, which staff can change per record after the fact). There is no UI for site visitors to choose a target — it's baked into which `Form` doc a given CTA points to.
- **No dual-dispatch.** `integrationTarget` is a single select, not multi — a form syncs to exactly one external system (or none). If the client later wants both JotForm and Monday fired per submission, that's a bigger change (parallel dispatch + two independent `externalId`/mapping sets) not covered here.

**Out of scope:**
- The client's original JotForm form (`222934769553165`) itself — untouched, still live independently.
- Any UI to let the public visitor pick JotForm vs. Monday.
- Multi-step/panel grouping for long forms (see `docs/ROADMAP.md`).
- Retiring/redirecting the old JotForm form once this one ships — a client decision, not a code change.

## Field mapping

Verified via JotForm's `GET /form/{id}/questions` API (against a clone, `262038063695057`) and Monday's `boards { columns }` GraphQL query (board `4024508641`):

| Form field (label) | JotForm qid | Monday column id | Notes |
|---|---|---|---|
| Company/brand name | `15` | *unresolved* | no existing column fits — see correction note below |
| Contact Name (first) | `3` (compound, `first`) | `long_text6` | Monday's "Contact Name" column is `long_text`, not split first/last — concatenate |
| Contact Name (last) | `3` (compound, `last`) | `long_text6` | same column as above, concatenated |
| Address (all sub-fields) | `4` (compound: `addr_line1`/`addr_line2`/`city`/`state`/`postal`) | `text` ("Address") | flatten to one string for Monday, same convention as Claims' `location` |
| Phone Number | `5` (compound, `full`) | `phone` | |
| E-mail | `6` | `email` | |
| Website | `48` | `text7` ("website") | |
| Which hardware are you interested in? (checkbox) | `40` | — (no matching column on this board) | JotForm only |
| Current sales channels (checkbox) | `41` | `text4` ("Sales Channels") | |
| Do you currently have/had kiosks? (radio) | `42` | `text6` ("Currently has kiosks?") | |
| Main goal for automated kiosks (checkbox) | `43` | `text02` ("Main goal") | |
| What products to commercialize (textarea) | `45` | `text78` ("Products") | |
| Success indicators (textarea) | `44` | `text_1` ("success Indicators") | |
| Types of locations/lease agreements (textarea) | `46` | `text3` ("Types of Locations") | |
| Expected monthly sales per kiosk (number) | `19` | `numbers7` ("Sales Expectations") | |
| Additional info about brand (textarea) | `11` | `text99` ("Additional information") | |
| Attach images/files (upload) | `18` | `files3` ("Attachments") | see file-upload handling above |

**Correction needed before implementation:** the "Design your kiosk" board's `text0` column is titled **"Kiosk Type"**, not brand/company name — there is no direct 1:1 column for "Company/brand name" on this board as currently structured. This needs a real decision (add a column on the Monday side, fold it into the item name only, or pick an existing free-text column) before the `externalId` values above are finalized in `/admin` — flagged here rather than guessed.

## Testing

- `tests/unit/repositories/GenericJotFormRepository.test.ts` — field-map → `submission[qid]` building, auth header, error propagation.
- `tests/unit/repositories/GenericMondayRepository.test.ts` — field-map → `column_values` building, file-column detection + `add_file_to_column`, GraphQL error propagation.
- `tests/unit/collections/FormSubmissions/dispatchFormSync.test.ts` — no-op on `'none'`, correct repository selection, `syncStatus` transitions.
- `tests/unit/blocks/Form/Upload.test.tsx` — file → R2 key on submit.

## Post-implementation

- `pnpm generate:types` (new `Form`/`form-submissions` fields).
- `pnpm generate:importmap` if any new admin-facing field component is added.
- Author the actual "Start developing your kiosk" `Form` document in `/admin` (or via the newly MCP-enabled `forms` collection) once the column-mapping correction above is resolved.
- Manual verification: submit a real test entry through the drawer, confirm it lands on Monday board `4024508641` under a sensible group with columns populated per the (corrected) mapping table, including one with a file attached.
