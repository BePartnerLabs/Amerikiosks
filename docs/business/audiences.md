---
title: Audiences
read_when: Deciding who a page or block is for, or why a section is not landing.
enforced_by: nothing — a product decision, revisited with the client
---

# Audiences

**Status: skeleton. The three audiences below are read off the code, not
confirmed with the client.**

## What the codebase already assumes

The site was built around three audiences, visible in the route and spec
history:

- **Brands** — placing their product in kiosks. `for-brands` page, and an
  "emerging brands" variant, so the brand audience is already split by size.
- **Venues** — hosting a kiosk on their premises. `for-venues`.
- **Agencies** — brokering between the two. `for-agencies`.

There is an `audienceShowcase` block and a spec at
`openspec/specs/audience-showcase/spec.md`. The seeds for those pages were
deleted on 2026-07-24, so the concept survives in code and specs but not in
content.

## Questions to answer

**Are these still the three?** They came from an early phase. If the business
now sells mostly to one of them, the site's whole structure is over-serving the
other two.

**What does each one need to see before enquiring?** Different evidence:
a venue manager wants footprint, power and service; a brand wants placement
volume and audience; an agency wants both plus commercial terms. Today
`/machines` shows all of it to everyone.

**Where does each enter?** Organic search for a machine type, a referral, a
trade event. The entry point decides how much context a page has to establish
before it can sell anything.

**Which one is the actual buyer?** For a kiosk placement, brand and venue can
each be the party that signs. That determines who the CTAs are written for.

## Why this matters beyond copy

The Definition of Done asks who a block is for. Without this file, that question
gets answered as "everyone", which is how a page ends up saying nothing to
anyone. It also feeds the AIO/GEO work in the roadmap: what an assistant is
asked ("who installs kiosks in hotels?") is audience-shaped, and the answer only
gets cited if the site has written for that reader.
