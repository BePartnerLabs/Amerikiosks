# Analytics (GA4) & the `tags` field — developer reference

How click tracking works site-wide, and how the reusable `tags` field behaves across the
collections/globals that use it. For editor-facing instructions see `docs/CLIENT-MANUAL.md`;
for the pre-launch GA audit see `docs/analytics-migration-report.md`.

## GA4 click tracking

### How it works

One global listener, `src/components/Analytics/GAListener.tsx`, mounted once in
`src/app/(frontend)/[locale]/layout.tsx`. It attaches a single `click` listener on `document`
and looks for the closest ancestor with `data-ga-event`. No per-component JS — tracking is
declarative via `data-ga-*` attributes on the markup.

```tsx
<button
  data-ga-event="cta_click"
  data-ga-section="header"
  data-ga-label={link.label}
>
```

On click, `GAListener` fires:

```js
gtag('event', el.dataset.gaEvent, {
  block: blockEl?.dataset.gaBlock,                                   // closest [data-ga-block] ancestor
  section: el.dataset.gaSection ?? blockEl?.dataset.gaSection,       // own attr wins, else inherited from block
  label: el.dataset.gaLabel || el.innerText.trim().slice(0, 100),    // explicit label, else visible text
  locale: document.documentElement.lang,
  machineId: el.dataset.gaMachineId,
  formName: el.dataset.gaFormName,
})
```

Attribute reference:

| Attribute | Purpose |
|---|---|
| `data-ga-event` | **Required** to trigger anything — the event name sent to GA4. |
| `data-ga-section` | Free-text grouping (e.g. `"header"`, `"footer"`). Set directly on the clicked element, or inherited from an ancestor `data-ga-block` element that also sets it. |
| `data-ga-block` | Marks a layout-builder block wrapper so events inside it can report which block instance fired. Usually `toSnakeCase(blockType)`. |
| `data-ga-label` | Explicit label; falls back to the element's trimmed innerText (max 100 chars) if omitted. |
| `data-ga-machine-id` | Machines-specific — attached to claim-form submit. |
| `data-ga-form-name` | Form-specific — attached to Payload Form block submits. |

Because `gtag` may not exist (blocked, not loaded yet), the handler no-ops silently if
`window.gtag` isn't a function — no console errors, no queueing.

### Adding a new tracked action

Add `data-ga-event` (+ `data-ga-label`/`data-ga-section` as needed) to the clickable element.
No new listener or React state required. If the click happens inside a block component and you
want it attributed to that block, wrap the block root with `data-ga-block={toSnakeCase(blockType)}`.

### Current event inventory

| Event | Where | Section / block | Notes |
|---|---|---|---|
| `navigation_click` | `Header/Nav/index.tsx` (mega menu button + plain links) | `"header"` | label = nav item label |
| `mobile_menu_open` | `Header/MobileMenu/index.tsx` | `"header"` | hamburger click |
| `cta_click` | `Header/Component.client.tsx`, `Header/MobileMenu/index.tsx` | `"header"` | header "Start a Partnership" CTA, desktop + mobile |
| `cta_click` | `blocks/CallToAction/Component.tsx`, `blocks/ProcessSteps/Component.tsx` | own block | in-page CTA blocks |
| `card_grid_cta_click` | `blocks/CardGrid/Component.tsx` | own block | |
| `card_cta_click` / `insight_card_click` | `components/Card/index.tsx` | — | generic card component, no section set |
| `project_card_click` | `blocks/ProjectsShowcase/Component.tsx` | own block | label = project title |
| `insights_featured_click` / `insights_card_click` | `blocks/InsightsShowcase/Component.tsx` | own block | |
| `audience_card_click` | `blocks/AudienceShowcase/Component.tsx` | own block | |
| `machine_card_click` | `blocks/MachinesListing/MachineCard.tsx`, `blocks/FormatsGrid/Component.tsx` | — / own block | same event name, two different sources |
| `machines_filter` | `blocks/MachinesListing/Component.tsx` | own block (`machines_page`) | label = selected tag or `"all"` |
| `faq_expand` | `blocks/FAQWithForm/Component.tsx`, `[locale]/faq/FaqClient.tsx` | own block / — | accordion open |
| `faq_filter` | `[locale]/faq/FaqClient.tsx` | `faq_page` block | label = selected tag or `"all"` |
| `claim_submit` | `blocks/ClaimForm/Component.tsx` | — | carries `data-ga-machine-id` |
| `generate_lead` | `blocks/Form/Component.tsx` | — | Payload Form block submit; carries `data-ga-form-name` |
| `footer_link_click` / `footer_contact_click` | `Footer/FooterContent.tsx` | `"footer"` | |
| `support_refund_link` / `support_call` / `support_text` / `support_whatsapp` | `blocks/SupportHub/Component.tsx` | `support_hub` block | dynamic per-option event name |
| `hero_cta_click` | `heros/HighImpact/index.tsx` | `"hero_high_impact"` | only the High Impact hero fires this — Medium/Low/Simple heroes rely on `cta_click`/`navigation_click` from the surrounding link component instead |

**Known gaps** (not blockers, just things to know before trusting GA4 breakdowns):
- `machine_card_click` is emitted from two unrelated components with no `data-ga-block` to
  disambiguate which listing produced the click.
- Several events (`machine_card_click`, `insight_card_click`, `card_cta_click`, `claim_submit`,
  `generate_lead`) have no `data-ga-section`/`data-ga-block`, so `section` reports as `undefined`
  in GA4 for those.
- `faq_expand` on the standalone FAQ page isn't wrapped by the same block element as the
  `faq_filter` events, so they won't share a `block` param even though they're on the same page.

## The `tags` field

`tags` is a repeated Payload field (`array` of `{ label: text, required: true }`) — **plain
free-text labels, not a `select` or `relationship`**. It's redefined independently in each
collection/global below rather than being one shared field, so there's no cross-collection
taxonomy: a "brand" tag on a Machine and a "brand" tag on a Project are unrelated strings that
happen to match.

| Collection / global | Field location | Frontend usage |
|---|---|---|
| Machines | `src/collections/Machines/index.ts` | `blocks/MachinesListing` builds the filter-chip list from all machines' tags (`Server.tsx`) and filters client-side on the selected tag (`Component.tsx`). |
| FAQ Items | `src/collections/FAQItems/index.ts` | Same filter-chip pattern, in `[locale]/faq/page.tsx` (chip list) and `FaqClient.tsx` (client-side filtering). |
| Projects | `src/collections/Projects/index.ts` | Field exists in the schema (admin: "used to filter projects in blocks") but no frontend component currently reads `.tags` on projects — filtering isn't wired up yet. |
| Hero (`Page.hero`) | `src/heros/config.ts` | Only shown in `/admin` when hero type is `mediumImpact`, `lowImpact`, or `simple` (`admin.condition`). Rendered as pill badges: `LowImpactHero` (`ak-hero-page__tag`) and `SimpleHero` (`ak-hero-simple__tag`). **`MediumImpactHero` no longer renders tags** — the field still shows in `/admin` for that hero type (schema unchanged) but any value entered there is silently unused on the frontend. |

Insights has no `tags` field.

### If you need cross-collection tag filtering

The current pattern (free-text array, one filter UI per collection) works for the two places
that filter today (Machines, FAQ) because typos or inconsistent casing only break that one
collection's chips. If a future requirement needs tags shared/filterable across collections
(e.g. "show all Machines and Projects tagged 'brand'"), that's a schema change — a shared
`select` field with fixed options, or a `taxonomy` collection with a relationship — not a
frontend-only fix.
