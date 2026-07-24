# Machine tags — pre-migration mapping (reference for manual re-tagging)

Captured from the **local dev DB** on 2026-07-24, right before the `machine-tags-collection` migration dropped the old free-text `tags` array data. The migration does not preserve this automatically — re-tag each machine by hand in `/admin` using this as a reference. Verify against production data if it may have diverged from local/seed data since launch.

| Machine ID | Name (EN) | Old tag |
|---|---|---|
| 1 | Full-size branded machine | `full-size` |
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
