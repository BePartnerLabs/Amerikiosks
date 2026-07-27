# Icon

Custom curated SVG icon system — **not** `lucide-react` (that package is in `package.json` but unused for CMS-driven content).

- `icons.ts` — hand-maintained `iconPaths` map of Material Symbols (outlined, weight 400) path data, sourced from Google Fonts. Exports `IconName`.
- `index.tsx` — `Icon` component, renders `iconPaths[name]` as inline `<svg>`. Accepts free-text `name` (not restricted to `IconName`) so unknown CMS values render nothing instead of crashing.
- `src/components/MaterialIconPicker/` — Payload admin field component that adds a searchable icon-browser UI on top of a plain `text` field (not a `select`). Stores the icon's string key (e.g. `"local_hospital"`). Wired into `src/Header/config.ts` and available for reuse on any text field (e.g. CardGrid's `icon` field in `src/blocks/CardGrid/config.ts`).

## Adding a new icon

1. Find it at https://fonts.google.com/icons.
2. Copy its `<path d="...">` from `node_modules/@material-symbols/svg-400/outlined/<name>.svg` (requires `@material-symbols/svg-400`, already a devDependency).
3. Add `<name>: '<path d>'` to `iconPaths` in `icons.ts`.

## Topic icons (verticals)

Added for the "Health & Wellness / Food & Beverage / Retail & Lifestyle / Custom Experiences" vertical set:

| Vertical | Icon key |
|---|---|
| Health & Wellness | `spa` |
| Food & Beverage | `restaurant` |
| Retail & Lifestyle | `storefront` (pre-existing) |
| Custom Experiences | `design_services` |
