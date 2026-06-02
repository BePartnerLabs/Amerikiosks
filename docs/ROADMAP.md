# Roadmap

Future ideas and planned improvements for the Amerikiosks website. Items are grouped by theme, not prioritized — move to a spec when ready to implement.

---

## SEO & Discoverability

- **`llms.txt` support** — Add `/llms.txt` and `/llms-full.txt` routes (markdown overview of the site for AI assistants). Gated by the `noIndex` Settings flag — returns a minimal "not available" response when blocked, serves site description + page index when public.
- **PR labeler (no external deps)** — GitHub Actions workflow that reads branch prefix (`feat/`, `fix/`, `docs/`) and PR commit messages to auto-apply labels. Release Drafter uses these labels to categorize changelog entries.
- **Changelog from semantic commits** — Switch `release-draft.yml` from `--generate-notes` (PR titles only) to a custom `git log` parser that groups entries by commit type (`feat`, `fix`, `perf`, `docs`) for richer release notes.

---

## Admin / CMS

- **TrustStrip WCAG 2.2.2 keyboard pause** — Add a visually-hidden pause/play toggle button to the marquee carousel so keyboard users without `prefers-reduced-motion` can pause animation. Currently documented as a known limitation in `src/blocks/TrustStrip/README.md`.
- **TrustStrip screenshots** — Take desktop (1280px) and mobile (375px) screenshots with real partner logos seeded and add to `src/blocks/TrustStrip/README.md` to reach 80%+ completeness score.
- **Partner drag-to-reorder** — Replace the `order` number field with a drag-and-drop interface in admin. Requires a `PartnerOrder` Global or a custom Payload UI component.

---

## Infrastructure

- **Branch protection enforcement** — Several recent commits bypassed branch protection ("Changes must be made through a pull request"). Enforce required status checks (`Lint and Test`) so direct pushes to `main` are blocked for all contributors.
- **`llms.txt` + markdown pages** — Payload-driven markdown pages served at known URLs (e.g. `/about.md`, `/services.md`) for AI agent consumption, following the `llms.txt` spec.

---

## Analytics

- **TrustStrip dwell time dashboard** — `partner_logo_dwell` events are firing to GA4. Create a GA4 custom report or Looker Studio dashboard to visualize which partner logos get the most screen time.

---

## Content

- **Seed TrustStrip block on home page** — After running the seed, the home page still needs a TrustStrip block added manually in `/admin`. Automate this in `src/endpoints/seed/pages/home.ts` so the section appears out of the box after seeding.
