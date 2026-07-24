# Monday.com claims integration — design spec

## Context

The Claims collection (`src/collections/Claims/`) syncs each refund claim to an external system via `integrationTarget` (`jotform` | `odoo` | `monday`), dispatched through `dispatchClaimSync.ts` (called from the `syncClaimTask` queued job — see `syncClaim.ts`) to a repository (`JotFormRepository` / `OdooRepository` / `MondayRepository`) that implements a shared `submit(claim: ClaimSubmission, req)` contract. `monday` posts each claim directly to a Monday.com board via their GraphQL API — independent of JotForm's own native Monday integration (already configured separately on JotForm's side, out of scope here).

Board verified live via the Monday GraphQL API (token in `.env.local`, not committed):
- Board: **"Amerikiosks - Customer Service"**, id `4498706759`
- Target group: **"NEW REFUND REQUESTS"**, id `topics`

## Scope

**In scope:**
- `monday` option added to `Claims.integrationTarget`.
- `mondayApiToken` field added to the `Settings` global, same pattern as `jotformApiKey`.
- `src/repositories/MondayRepository.ts` implementing `submit(claim: ClaimSubmission, req)`.
- `dispatchClaimSync.ts` updated to route to `MondayRepository` via an explicit lookup map.
- `machineId` (`Claims.machineId`, already existed for the QR-scan flow) added to `ClaimSubmission` and mapped to Monday's "Kiosk ID" column when present — JotForm has no matching question, so `JotFormRepository` ignores it.
- Real photo attachment forwarded to Monday (unlike JotForm — see below) via `add_file_to_column`, fetched from the private R2 bucket by `Claims.photoKey` only when routing to Monday.
- `SupportHub` block forwards the `machine_id` query param from its own page URL onto the "Request a refund" link, so the ClaimForm page (a different URL) still has it in its own `searchParams` when the customer lands there.

**Explicitly dropped from the original plan:**
- **No `amount` field.** The board's "Ammount" column (`numbers1`) has no equivalent in our claim model — decided not worth adding a form field for it; left unset for the Monday board operator to fill in manually.

**Out of scope:**
- Turning off or modifying JotForm's own native Monday.com integration (the "Match your fields" mapping configured in JotForm's dashboard) — unrelated, keeps working independently of this.
- Any UI to let staff choose "monday" from the ClaimForm's public submission flow — `integrationTarget` defaults to `'jotform'` and is only changed by staff editing a claim in `/admin` (same as `odoo` today).
- Adding dedicated Monday columns for `refundMethod`/`refundAccount` — these get folded into free text instead (see mapping).

## Upstream architecture change (main merge, 2026-07-23)

Between this spec's original draft and implementation, `main` landed a ClaimForm rewrite (multi-step wizard) and private R2 photo storage that changed `ClaimSubmission`'s shape:
- `customerName: string` → split into `customerFirstName` / `customerLastName`.
- `location: { state, city, propertyName }` group → flattened to a single `location: string` (already formatted `"<propertyName>, <city>, <state>"`).
- Photo is no longer passed in-memory through the submission at all by default — it's uploaded straight to a private R2 bucket, and `Claims.photoKey` is the durable reference. `dispatchClaimSync.ts` appends a `"[Photo attached — view in admin: Claim #<id>]"` text pointer to `additionalInfo` for JotForm/Odoo, since neither can receive a real file.
- Monday is the one target that *can* receive a real file, so `dispatchClaimSync.ts` special-cases it: when `repository === MondayRepository` and `claim.photoKey` is set, it fetches the raw bytes via `getPrivateFileBuffer()` (`src/utilities/privateUpload.ts`) and passes them as `ClaimSubmission.photo`.

## Field mapping

`ClaimSubmission` → board `4498706759`, group `topics` — verified against the live board's `columns`/`groups` GraphQL query:

| Claim field | Monday column | Column id | Type | `column_values` value |
|---|---|---|---|---|
| `customerFirstName` + `customerLastName` | Name (item title) | `item_name` | name | passed as `item_name` on the mutation, not in `column_values` |
| `customerFirstName` + `customerLastName` | Name | `text7` | text | `"<first> <last>"` |
| `paymentMethod` | Payment Method | `dropdown` | dropdown | `{"label": "..."}` — reuse `PAYMENT_METHOD_LABEL` (now in `src/repositories/claimLabels.ts`, shared with `JotFormRepository`) |
| `customerEmail` | Email | `email` | email | `{"email": "<email>", "text": "<email>"}` |
| `customerPhone` | Phone | `phone` | phone | `{"phone": "<phone>", "countryShortName": "US"}` |
| `transactionDateTime` | Transaction Date | `date4` | date | `{"date": "YYYY-MM-DD"}` — date only |
| `claimReason` | What happenned? | `dropdown0` | dropdown | `{"label": "..."}` — reuse `CLAIM_REASON_LABEL` |
| `additionalInfo` + time + `refundMethod` + `refundAccount` | Additional information | `long_text6` | long_text | `{"text": "<concatenated, see below>"}` |
| `lastFourCardDigits` | Last 4 | `numbers3` | numbers | `"<digits>"` |
| `kioskBrand` (resolved brand name) | Kiosk Brand | `text__1` | text | `"<brand.name>"` |
| `location` (already flattened string) | Property | `text9` | text | `"<location>"` |
| `machineId` | Kiosk ID | `text_mkve20y8` | text | `"<machineId>"` — omitted entirely when absent |
| `photo` (fetched from R2 by `photoKey`) | Attachments | `files3` | file | not part of `column_values` — separate `add_file_to_column` mutation after item creation |
| — (none) | Ammount | `numbers1` | numbers | intentionally left unset — no equivalent claim field |

**`long_text6` ("Additional information") concatenation**, one line per present value (transaction time always present since `transactionDateTime` is required):

```
<additionalInfo, if present>
Transaction time: <h:mm AM/PM, derived from transactionDateTime>
Refund method: <refundMethod, if present>
Refund account: <refundAccount, if present>
```

**Unmapped:** `numbers1` (Ammount) by decision (see Scope), and board-internal columns with no claim equivalent (`Subitems`, `Agent`, `Status`, `Recomendation`, `Footage Reviewed`, `KioskLog Error`, `ID`, `Last Update`).

## 1. `Claims` collection changes (`src/collections/Claims/index.ts`)

- Add `'monday'` to `integrationTarget`'s options: `{ label: 'Monday.com', value: 'monday' }`.
- No new fields — `machineId` already existed.

## 2. `Settings` global (`src/Settings/config.ts`)

`mondayApiToken` added under the existing "Integrations" tab, mirroring `jotformApiKey` (same `access.read: authenticatedFieldAccess` gate). Editable at `/admin` → Settings → Integrations by any authenticated staff user; never exposed in the public Settings API response.

## 3. `src/repositories/MondayRepository.ts`

- Reads `mondayApiToken` from the Settings global via the Local API (bypasses the field's own access gate, same as `JotFormRepository`).
- `create_item` mutation with `column_values` built per the mapping table above.
- When `claim.photo` is present: a second `add_file_to_column` mutation (multipart POST) targeting the item id returned by `create_item`.
- Payment method / claim reason label maps live in `src/repositories/claimLabels.ts`, shared with `JotFormRepository` so the two integrations' option sets can't drift apart.
- HTTP via `serverHttpClient` (`post` for JSON, `postMultipart` for the file upload).
- Errors: throws on non-2xx (via `ServerHttpClient`) or a GraphQL `errors` array present in the response body, so `dispatchClaimSync.ts`'s existing try/catch → `syncStatus: 'error'` path works unchanged.

## 4. `dispatchClaimSync.ts`

Explicit lookup map, no implicit default beyond a `jotform` fallback for an unrecognized value:

```ts
const REPOSITORIES = {
  jotform: JotFormRepository,
  odoo: OdooRepository,
  monday: MondayRepository,
} as const

const repository = REPOSITORIES[claim.integrationTarget as keyof typeof REPOSITORIES] ?? JotFormRepository
```

Photo handling is repository-aware: the raw R2 bytes are only fetched (`getPrivateFileBuffer`) when `repository === MondayRepository`, to avoid wasted R2 calls on the other targets.

## 5. `src/blocks/SupportHub/Component.tsx`

Converted to a client component (`useSearchParams`) so it can read `machine_id` off its own `/customer-service` page URL (where the kiosk's QR code lands) and append it onto the "Request a refund" link — `withMachineId()` no-ops when the param isn't present. This is what lets the ClaimForm page (a separate URL) still have `machine_id` in its own `searchParams` when the customer arrives there.

## Post-implementation

- `pnpm generate:types` (new `integrationTarget` option + `Settings.mondayApiToken`).
- Migration `20260724_001423_add_monday_integration` (Postgres): adds the `monday` enum value and `settings.monday_api_token` column. Applied locally.
- Manual verification still needed: set a real `mondayApiToken` in `/admin` → Settings → Integrations, create a test claim with `integrationTarget: monday`, confirm an item appears in board `4498706759` under "NEW REFUND REQUESTS" with all columns populated per the mapping table, including a claim with a photo (verify the real attachment lands, not just a text pointer) and one without.
