# src/ — Context Overview

## Context you may need

| Read | When |
|------|------|
| [`docs/patterns/`](../docs/patterns/README.md) | Patterns and antipatterns this project learned the hard way. One file per topic — open the index and read only the one that applies. |
| [`docs/business/`](../docs/business/README.md) | Definition of Done, and who the product is talking to. |

## Block Documentation

Process guide: [`src/blocks/CLAUDE.md`](./blocks/CLAUDE.md)  
Template: [`src/blocks/_template.md`](./blocks/_template.md)  
Full index: [`docs/blocks/README.md`](../docs/blocks/README.md) — the only place
completeness is tracked. A second table here was maintained by hand, contradicted
that index on every row, and missed three blocks; it was deleted rather than
re-synced.

To document a block: `/document-block <path>` (e.g. `/document-block src/blocks/Banner`)

## Key Directories

| Path | Purpose |
|------|---------|
| `blocks/` | Layout blocks (CTA, Banner, Content, Media, etc.) |
| `heros/` | Hero variants (HighImpact, MediumImpact, LowImpact) |
| `Header/` | Site header global |
| `Footer/` | Site footer global |
| `components/` | Shared UI components |
| `collections/` | Payload collection configs — see [`collections/CLAUDE.md`](./collections/CLAUDE.md) before enabling drafts on an existing collection |
| `globals/` | Payload global configs |
