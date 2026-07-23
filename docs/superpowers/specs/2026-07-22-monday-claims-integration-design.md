# Monday.com claims integration — design spec

## Context

The Claims collection (`src/collections/Claims/`) syncs each refund claim to an external system via `integrationTarget` (`jotform` | `odoo` today), dispatched through `dispatchClaimSync.ts` to a repository (`JotFormRepository` / `OdooRepository`) that implements a shared `submit(claim: ClaimSubmission, req)` contract. We're adding `monday` as a third target, posting each claim directly to a Monday.com board via their GraphQL API — independent of JotForm's own native Monday integration (already configured separately on JotForm's side, out of scope here).

Board discovered live via the Monday GraphQL API using a token stored temporarily in `.env.local`:
- Board: **"Amerikiosks - Customer Service"**, id `4498706759`
- Target group: **"NEW REFUND REQUESTS"**, id `topics`

## Scope

**In scope:**
- `amount` field added to the `Claims` collection (number, optional) — the board has an "Ammount" column with no equivalent in our current claim model.
- `monday` option added to `Claims.integrationTarget`.
- `mondayApiToken` field added to the `Settings` global, same pattern as `jotformApiKey`.
- `src/repositories/MondayRepository.ts` implementing `submit(claim: ClaimSubmission, req)`.
- `dispatchClaimSync.ts` updated to route to `MondayRepository` when `integrationTarget === 'monday'`.

**Out of scope:**
- Turning off or modifying JotForm's own native Monday.com integration (the "Match your fields" mapping configured in JotForm's dashboard) — unrelated, keeps working independently of this.
- Any UI to let staff choose "monday" from the ClaimForm's public submission flow — `integrationTarget` defaults to `'jotform'` and is only changed by staff editing a claim in `/admin` (same as `odoo` today).
- Adding dedicated Monday columns for `refundMethod`/`refundAccount` — these get folded into free text instead (see mapping).

## Field mapping

`ClaimSubmission` → board `4498706759`, group `topics`:

| Claim field | Monday column | Column id | Type | `column_values` value |
|---|---|---|---|---|
| `customerName` | Name (item title) | `item_name` | name | passed as `item_name` on the mutation, not in `column_values` |
| `customerName` | Name | `text7` | text | `"<customerName>"` |
| `paymentMethod` | Payment Method | `dropdown` | dropdown | `{"label": "..."}` — reuse `PAYMENT_METHOD_LABEL` from `JotFormRepository`; board options (`Google Pay`/`Cash`/`Credit/Debit Card`/`Apple Pay`) match 1:1 |
| `customerEmail` | Email | `email` | email | `{"email": "<email>", "text": "<email>"}` |
| `customerPhone` | Phone | `phone` | phone | `{"phone": "<phone>", "countryShortName": "US"}` |
| `transactionDateTime` | Transaction Date | `date4` | date | `{"date": "YYYY-MM-DD"}` — date only, Monday's date column has no time component |
| `claimReason` | What happenned? | `dropdown0` | dropdown | `{"label": "..."}` — reuse `CLAIM_REASON_LABEL`; board has 2 extra options (`Duplicate charge`, `Got charged twiced`) our `claimReason` select doesn't produce — unreachable, no action needed |
| `additionalInfo` + time + `refundMethod` + `refundAccount` | Additional information | `long_text6` | long_text | `{"text": "<concatenated, see below>"}` |
| `lastFourCardDigits` | Last 4 | `numbers3` | numbers | `"<digits>"` |
| `kioskBrand` (resolved brand name) | Kiosk Brand | `text__1` | text | `"<brand.name>"` |
| `location` (state/city/propertyName) | Property | `text9` | text | `"<state>, <city>, <propertyName>"` — same flatten format `JotFormRepository` already uses |
| `photo` | Attachments | `files3` | file | not part of `column_values` — separate `add_file_to_column` mutation after item creation |
| `amount` (new Claims field) | Ammount | `numbers1` | numbers | `"<amount>"` |

**`long_text6` ("Additional information") concatenation**, one line per present value (transaction time always present since `transactionDateTime` is required):

```
<additionalInfo, if present>
Transaction time: <h:mm AM/PM, derived from transactionDateTime>
Refund method: <refundMethod, if present>
Refund account: <refundAccount, if present>
```

**Unmapped:** none — every `ClaimSubmission` field has a destination. Board columns with no claim equivalent (`Subitems`, `Agent`, `Status`, `Recomendation`, `Footage Reviewed`, `KioskLog Error`, `ID`, `Last Update`) are Monday-internal and untouched by this integration.

## 1. `Claims` collection changes (`src/collections/Claims/index.ts`)

- Add `amount` field: `{ name: 'amount', type: 'number', admin: { description: 'Refund amount requested, if known.' } }`.
- Add `'monday'` to `integrationTarget`'s options: `{ label: 'Monday.com', value: 'monday' }`.

## 2. `Settings` global (`src/Settings/config.ts`)

Add `mondayApiToken` under the existing "Integrations" tab, mirroring `jotformApiKey` exactly (same `access.read: authenticatedFieldAccess` gate, same admin description pattern, noting it's used by the Claims refund flow's Monday sync).

## 3. `src/repositories/MondayRepository.ts`

```
export const MONDAY_BOARD_ID = 4498706759
export const MONDAY_GROUP_ID = 'topics'

export const MondayRepository = {
  async submit(claim: ClaimSubmission, req: PayloadRequest): Promise<{ responseCode: number; message: string }> {
    // 1. Read mondayApiToken from Settings global (same Local API pattern as JotFormRepository)
    // 2. Build column_values per the mapping table above
    // 3. POST to https://api.monday.com/v2 — create_item mutation (board_id, group_id, item_name, column_values)
    // 4. If claim.photo present: second mutation add_file_to_column using the created item's id, multipart upload
  },
}
```

- Payment method / claim reason label maps: reuse `PAYMENT_METHOD_LABEL` and `CLAIM_REASON_LABEL` — extract them to a small shared module (e.g. `src/repositories/claimLabels.ts`) consumed by both `JotFormRepository` and `MondayRepository`, since the values must stay in sync and duplicating them risks drift.
- HTTP: use the existing `serverHttpClient` (`src/repositories/clients/ServerHttpClient.ts`) the same way `JotFormRepository` does — JSON POST for `create_item`, multipart POST for `add_file_to_column`.
- Errors: same contract as `JotFormRepository.submit` — throw on non-2xx / GraphQL `errors` array present in the response body, so `dispatchClaimSync.ts`'s existing try/catch → `syncStatus: 'error'` path works unchanged.

## 4. `dispatchClaimSync.ts`

Replace the ternary with a lookup map so all three targets are explicit and there's no implicit default:

```ts
const REPOSITORIES = {
  jotform: JotFormRepository,
  odoo: OdooRepository,
  monday: MondayRepository,
} as const

const repository = REPOSITORIES[claim.integrationTarget as keyof typeof REPOSITORIES] ?? JotFormRepository
```

## Post-implementation

- `pnpm generate:types` (new `amount` field + `integrationTarget` option + `Settings.mondayApiToken`).
- Manual verification: set `mondayApiToken` in `/admin` → Settings → Integrations, create a test claim in `/admin` with `integrationTarget: monday`, confirm an item appears in board `4498706759` under "NEW REFUND REQUESTS" with all columns populated per the mapping table, including a claim with a photo (verify the attachment lands) and one without.
