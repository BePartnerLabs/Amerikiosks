# Manual setup: kiosk-development & placement-application forms → Monday.com

This site's generic Form/drawer system (form-builder plugin) now supports syncing any Form's submissions to a Monday.com board — see `src/plugins/index.ts` (`formBuilderPlugin` config) and `src/collections/FormSubmissions/hooks/dispatchFormSync.ts`. This doc is the manual, step-by-step `/admin` setup for the two new forms discussed. There is now a sandbox account with `[LAB]` copies of these boards — see the Monday section of `CLAUDE.md` and `scripts/move-monday-to-sandbox.mjs` — so integration changes can be exercised for real before touching the client's. The setup below is still done directly in production `/admin`, not via the local seed system (seeds are dev-only and must never run against real content, per `src/endpoints/seed/CLAUDE.md`).

## Prerequisites (one-time)

1. `/admin` → Settings → Integrations → set **Monday.com API Token** (same field Claims already uses).
2. Confirm the target boards still match what was verified live during this design:
   - **"Design your kiosk"** — board id `4024508641`, group id `topics` ("Pending Review").
   - **"Amerikiosks Placement"** — board id `4024476985`, group id `topics` ("Pending Review").

## How the sync works (for context)

- Each **Form** document has 3 new fields (sidebar): **Integration target** (None/Monday.com/Odoo — Odoo isn't implemented yet), **External id** (the Monday **board id**), **Monday group id**.
- Each **field** inside the form (every block: text, email, textarea, number, select, radio, checkbox, upload) has a new **External id** input — the Monday **column id** that field's value maps to. Leave it blank to exclude that field from the sync entirely.
- **Special value `item_name`**: whichever field's External id is literally `item_name` becomes the Monday item's title, instead of a regular column. Pick whichever field best identifies the record (see mapping tables below — company/brand name and property name, not the contact's personal name).
- The `numbers1` ("Ammount") column on both boards has no equivalent field on our forms — left blank intentionally, for the Monday board operator to fill in by hand.
- File uploads (`upload` blockType) go to Monday's **Attachments** column (`files3`) as a real attached file — set External id to `files3` on that field.

---

## Form 1: "Start developing your kiosk"

**Form-level config:**
| Field | Value |
|---|---|
| Title | `Start developing your kiosk` |
| Integration target | `Monday.com` |
| External id | `4024508641` |
| Monday group id | `topics` |

**Fields, in order:**

| # | Name | Type | Label | Required | Options | External id |
|---|---|---|---|---|---|---|
| 1 | `company-brand-name` | Text | Company/brand name | Yes | — | `item_name` |
| 2 | `contact-name` | Text | Contact name | Yes | — | `text7` |
| 3 | `address` | Text | Address | Yes | — | `text` |
| 4 | `phone` | Text | Phone number | Yes | — | `phone` |
| 5 | `email` | Email | Email | Yes | — | `email` |
| 6 | `website` | Text | Website | No | — | `text7` — ⚠️ **conflict, see note below** |
| 7 | `hardware-interest` | Select | Which hardware are you interested in? | No | Gamma 10 / Gamma 13 / Zeta 2 / Delta 7 / Alpha 13 / Kappa 13 / Other | *(no column — leave blank)* |
| 8 | `sales-channels` | Select | Current sales channels | No | Traditional Retail / E-commerce / Wholesale / Other | `text4` |
| 9 | `has-kiosks` | Radio | Do you currently have or have had automated kiosks? | No | Yes / No | `text6` |
| 10 | `main-goal` | Select | Main goal for automated kiosks | No | Generate more revenue / Advertise my brand / Collect traffic data / Sampling / Other | `text02` |
| 11 | `products` | Textarea | What products are you looking to commercialize? | No | — | `text78` |
| 12 | `success-indicators` | Textarea | What indicators would you evaluate for success? | No | — | `text_1` |
| 13 | `location-types` | Textarea | Which types of locations/lease agreements? | No | — | `text3` |
| 14 | `monthly-sales-expectation` | Number | Expected monthly sales per kiosk | Yes | — | `numbers7` |
| 15 | `additional-info` | Textarea | Additional info about your brand | No | — | `text99` |
| 16 | `photo` | Upload (media) | Attach images/files | No | — | `files3` |

**⚠️ Note on row 6 (`website`)**: both "Contact name" and "Website" mapped to Monday text columns, but the board only has one obvious free-text column left after Address/Phone/Email are placed (`text7`, titled "website" per the live column list) — and Contact name also needs somewhere to go. Recommend: put **Contact name** in `text7` (matches the column's original JotForm intent — item name is now the company, not the contact) and fold **Website** into the `additional-info` textarea's value instead (prefix it, e.g. "Website: https://..."), or leave Website's External id blank if it's not critical to have on the board. Decide before creating the field in `/admin` — don't guess further.

---

## Form 2: "Placement Application"

**Form-level config:**
| Field | Value |
|---|---|
| Title | `Placement Application` |
| Integration target | `Monday.com` |
| External id | `4024476985` |
| Monday group id | `topics` |

**Fields, in order:**

| # | Name | Type | Label | Required | Options | External id |
|---|---|---|---|---|---|---|
| 1 | `property-name` | Text | Property name | Yes | — | `item_name` |
| 2 | `property-type` | Select | Property type | Yes | Hotel/Residency / University / Shopping Center / Airport / Transit Station / Grocery Store / Convention Center / Amusement Park / Other | `dropdown5` — send as plain text label, not `{label:...}` (Monday's column here is typed `text`, confirmed live) |
| 3 | `contact-name` | Text | Contact name | Yes | — | `long_text6` |
| 4 | `address` | Text | Address | Yes | — | `text` |
| 5 | `phone` | Text | Phone number | Yes | — | `phone` |
| 6 | `email` | Email | Email | Yes | — | `email` |
| 7 | `kiosks-interested` | Select | Which kiosks are you looking to add? | No | Pharmabox / CVS / COCO POINT / Fan Stand / Carlo's Bakery Express / Other | *(no column — leave blank)* |
| 8 | `suggested-location` | Text | Suggested location in the building | Yes | — | `text7` |
| 9 | `daily-traffic` | Number | Estimated daily traffic | Yes | — | `numbers8` |
| 10 | `rooms` | Number | Number of rooms in the building | Yes | — | `numbers` |
| 11 | `occupancy-percentage` | Number | Current occupancy percentage | Yes | — | `numbers19` |
| 12 | `additional-info` | Textarea | Additional info about the property | No | — | `text9` |
| 13 | `photo` | Upload (media) | Attach pictures/map of property | No | — | `files3` |
| 14 | `installation-schedule` | Select | Preferred installation schedule | No | Mondays / Tuesdays / Wednesdays / Thursdays / Fridays / Mornings / Afternoons | *(no column — leave blank)* |
| 15 | `loading-zone` | Radio | Loading/Unloading zone | No | High dock / Floor level / Other | *(no column — leave blank)* |
| 16 | `access-challenges` | Textarea | Any access challenges (stairs, doors)? | No | — | *(no column — leave blank)* |

No naming conflict on this form — every text-capable column (`item_name`, `long_text6`, `text`, `text7`, `text9`) has exactly one field mapped to it.

---

## After creating both forms

1. Point each form's CTA (wherever it's linked from — `CMSLink` `type: "modal"`, same drawer pattern used by "Start a Partnership" etc.) at the new Form document.
2. Submit one real test entry per form (with a photo, to exercise the upload path) and confirm:
   - A new item appears in the right Monday board/group, correctly named (matches whichever field has `item_name`).
   - All mapped columns are populated.
   - The photo actually attached to the item (not just a text pointer).
   - `form-submissions` → that submission's sidebar shows `syncStatus: synced`.
3. If something fails, `syncStatus: error` + `syncError` on the submission doc will say why (mirrors the same pattern already used for Claims).
