# Source Documentation Overview

This file tracks the documentation status of all blocks, globals, and components in `src/`.

## Block & Global Documentation

Full index: [`docs/blocks/README.md`](../docs/blocks/README.md)  
Template: [`src/blocks/_template.md`](./blocks/_template.md)  
Agent guide: [`src/blocks/CLAUDE.md`](./blocks/CLAUDE.md)

### Current Status

| Component | Type | Completeness | README |
|-----------|------|-------------|--------|
| Header | Global | 35% | [→](./Header/README.md) |
| Footer | Global | 30% | [→](./Footer/README.md) |
| Hero — HighImpact | Hero Variant | 35% | [→](./heros/HighImpact/README.md) |

> Update this table whenever a block README is created or its completeness score changes.  
> Use `/document-block <path>` to generate or update block documentation.

## Checklist Items (21 total per block)

- Accessibility AAA (5): contrast, keyboard nav, ARIA, landmarks, focus
- HTML Semantics (3): heading hierarchy, semantic elements, alt text
- Performance (3): next/image, no CLS, lazy load
- SEO / AIO / GEO (3): GEO-ready content, Schema.org, no indexing block
- Analytics GA4 (1): GA4 events implemented
- Delivery (4): tests, fields documented, screenshots, delivery notes

## Key Directories

```
src/blocks/       Layout blocks (CTA, Banner, Content, Media, etc.)
src/heros/        Hero variants (HighImpact, MediumImpact, LowImpact)
src/Header/       Site header global
src/Footer/       Site footer global
src/components/   Shared UI components
src/collections/  Payload collection configs
src/globals/      Payload global configs (Header, Footer)
```
