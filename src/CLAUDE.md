# src/ — Context Overview

## Block Documentation

Process guide: [`src/blocks/CLAUDE.md`](./blocks/CLAUDE.md)  
Template: [`src/blocks/_template.md`](./blocks/_template.md)  
Full index: [`docs/blocks/README.md`](../docs/blocks/README.md)

To document a block: `/document-block <path>` (e.g. `/document-block src/blocks/Banner`)

### Status

| Component | Type | Completeness | README |
|-----------|------|-------------|--------|
| Header | Global | 100% | [→](./Header/README.md) |
| Footer | Global | 100% | [→](./Footer/README.md) |
| Hero — HighImpact | Hero Variant | 95% | [→](./heros/HighImpact/README.md) |
| Hero — MediumImpact | Hero Variant | 89% | [→](./heros/MediumImpact/README.md) |
| Hero — LowImpact | Hero Variant | 73% | [→](./heros/LowImpact/README.md) |

> Update this table when a block README is created or its completeness score changes.

## Key Directories

| Path | Purpose |
|------|---------|
| `blocks/` | Layout blocks (CTA, Banner, Content, Media, etc.) |
| `heros/` | Hero variants (HighImpact, MediumImpact, LowImpact) |
| `Header/` | Site header global |
| `Footer/` | Site footer global |
| `components/` | Shared UI components |
| `collections/` | Payload collection configs |
| `globals/` | Payload global configs |
