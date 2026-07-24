# Machine tags — pre-migration mapping (reference for manual re-tagging)

Captured on 2026-07-24, right before the `machine-tags-collection` migration dropped the old free-text `tags` array data. The migration does not preserve this automatically — re-tag each machine by hand in `/admin` using this as a reference.

Cross-checked against a **production DB dump** (2026-07-24) — matches this table exactly except machine 1, which also had an extra tag `home` (not present in the local/seed data). Included below.

| Machine ID | Name (EN) | Old tag(s) |
|---|---|---|
| 1 | Full-size branded machine | `full-size`, `home` |
| 2 | Campaign activation unit | `campaign` |
| 3 | Compact footprint machine | `compact` |
| 4 | Premium venue configuration | `premium` |
| 5 | Lobby & Reception | `venue-lobby` |
| 6 | Waiting Areas | `venue-waiting` |
| 7 | Common Areas / Corridors | `venue-common` |
| 8 | Multi-Unit Configuration | `venue-multi` |
| 9 | Campaign Activation Unit | `agency-campaign` |
| 10 | Temporary Pop-up | `agency-popup` |
| 11 | Multi-Venue Configuration | `agency-multi-venue` |
| 12 | Digital Screen Integration | `agency-screens` |
| 13 | Single Location Pilot | `emerging-pilot` |
| 14 | Founder Program | `emerging-founder` |
| 15 | Multi-Venue Expansion | `emerging-multi` |
| 16 | Consignment Model | `emerging-consignment` |

Each machine had exactly one tag. Recreate as new `Tags` docs (`label` field) and assign via `Machines.tags` (relationship, multi-select) in `/admin`.
