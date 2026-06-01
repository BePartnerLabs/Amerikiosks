---
name: centralized-bpl-workflows
description: Future task — centralize reusable GitHub workflows in a BePartnerLabs org repo
metadata:
  type: project
---

Create a `BePartnerLabs/.github` (or `BePartnerLabs/workflows`) repo with reusable workflows (release drafting, CI, deploy) so all client projects call them via `uses: BePartnerLabs/.github/.github/workflows/....yml@main` instead of duplicating workflow files per repo.

**Why:** Currently each project (starting with Amerikiosks) has its own copy of workflow logic. As more projects are added, maintenance diverges.

**How to apply:** Trigger this work when a second client project needs the same CI/release/deploy pattern. At that point the duplication cost justifies the overhead of a centralized repo.
