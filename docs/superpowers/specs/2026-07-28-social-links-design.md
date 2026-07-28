# Social links — design

**Date:** 2026-07-28
**Branch:** `feat/social-links`

## Problem

The site had no social profile links anywhere, and the `Organization` JSON-LD had no
`sameAs` — the field search engines use to tie official profiles to a brand.

## Decisions

**Single source of data: `Settings` global.** The links render in three places (footer,
header, mobile menu) plus the JSON-LD. Putting the array in `Footer` would force the
Header to read the Footer global to paint its own icons; duplicating it per global would
let the two drift. `Settings` is already the site-wide global.

The array is **not localized** — a profile URL is the same in every locale. Only the
optional `label` (the screen-reader override) is localized.

**Curated icon set, not free text or uploads.** Brand logos do not exist in Material
Symbols, so `Icon` cannot render them. The editor picks a `platform` from a fixed select
and the icon is resolved from that value; a free-text field would leave links iconless on
a typo, and per-icon uploads would let a wrong-sized SVG into the header. Paths come from
[Simple Icons](https://simpleicons.org) (CC0, no attribution required).

`brandIcons.ts` and `BrandIcon` are **separate** from `iconPaths`/`Icon`: Simple Icons use
a `0 0 24 24` viewBox, Material Symbols use `0 -960 960 960`. Sharing one map would render
one set distorted.

**One component, three mount points.** `SocialLinks` is a server component taking
`variant: 'footer' | 'header' | 'mobile'`, which only picks the root class. Markup,
accessibility and analytics have a single implementation; each zone owns its own colour
and sizing in CSS.

## Behaviour

- Renders `null` when the array is empty, so the site is unchanged until the client fills
  it in. Rows missing `platform` or `url` are skipped.
- Links are `target="_blank" rel="noopener noreferrer"`, with an `aria-label` that defaults
  to `Amerikiosks on <Platform>` and can be overridden per row.
- `data-ga-event="social_link_click"`, `data-ga-section={variant}`, `data-ga-label={platform}`.
- Hit area is padded to the 44px touch-target minimum without changing the visual size.

## Placement

| Zone | Where | Visibility |
|---|---|---|
| Footer | `ak-footer__bottom`, opposite the copyright | Always; stacks and centres under 40rem |
| Header | `bp-header__actions`, before the language switcher, divider on its right | Hidden below the `header-inner` container width where the nav collapses (59.99rem) |
| Mobile menu | Bottom of the sheet's main panel, above the sub-panel | Only below that same width |

The header/mobile split uses the **container query** `header-inner`, matching how the nav
and the desktop CTA already hide themselves — a viewport media query would desync from
them.

Colour goes through a local `--_social-color` (defaulting to `--ak-white`) rather than
using `--ak-*` directly in a `color` property, per the DS 3-level variable contract.

## SEO

`generateOrganizationJsonLd` takes `socialUrls` and emits `sameAs` when at least one URL
is present, omitting the key entirely otherwise.

## Data

`settings.socialLinks` (array, max 8):

| Field | Type | Notes |
|---|---|---|
| `platform` | select, required | instagram, linkedin, facebook, youtube, tiktok, x, whatsapp |
| `url` | text, required | `validate` requires an `https://` prefix |
| `label` | text, localized | Optional `aria-label` override |

Migration `20260728_041216_settings_social_links` — additive, no defaults that alter
existing content.

## Tests

Unit coverage for `SocialLinks` (link count, `rel`/`target`, label precedence, empty and
half-filled rows) and for `sameAs` in the JSON-LD (present with URLs, omitted without).
