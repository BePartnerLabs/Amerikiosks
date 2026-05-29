---
name: openspec-integration
description: Design for integrating OpenSpec as the living spec store alongside Superpowers brainstorming workflow
metadata:
  type: project
---

# OpenSpec Integration Design

## Goal

Use OpenSpec as the persistent spec store for features that need context across sessions, while keeping Superpowers to drive the design process for new features.

## When to Document (and When Not To)

**Document in OpenSpec when:**
- New feature with non-obvious design decisions
- Change that affects architecture or system behavior
- Something you'll need to remember in future sessions

**Go direct (no spec needed):**
- Bugfixes
- Style/copy changes
- Simple config tweaks
- Anything self-evident from reading the code

Rule of thumb: *Would you forget the why in 2 weeks? Write it. If not, just code.*

## Workflow

### New feature
1. Run `/superpowers:brainstorming`
2. Save design output to `openspec/changes/[change-id]/design.md`
3. Save implementation plan to `openspec/changes/[change-id]/tasks.md`
4. Create/update `openspec/specs/[feature]/spec.md` with the feature spec

### Change to existing feature
1. Read `openspec/specs/[feature]/spec.md` for context
2. Run `/openspec:proposal [description]` to generate a structured proposal
3. Review proposal, then implement

### Simple task (no spec warranted)
- Read relevant spec if it exists, then code directly

## File Structure

```
openspec/
├── specs/
│   └── [feature-name]/
│       └── spec.md          # living spec per feature
└── changes/
    └── [change-id]/
        ├── proposal.md      # what and why
        ├── design.md        # technical decisions (from brainstorming)
        └── tasks.md         # implementation plan (from writing-plans)
```

## Migration

Existing superpowers specs to migrate into OpenSpec:
- `docs/superpowers/specs/2026-05-28-header-megamenu-design.md` → `openspec/specs/mega-menu/spec.md`
- `docs/superpowers/specs/2026-05-28-translation-design.md` → `openspec/specs/i18n/spec.md`

## Installation

```bash
npm install -g @fission-ai/openspec@latest
```
