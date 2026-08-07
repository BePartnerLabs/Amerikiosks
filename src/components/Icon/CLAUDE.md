# Icon

Custom curated SVG icon system. **CMS-driven icons go through `<Icon>`, never `lucide-react`** — an editor types an icon key into a text field, and only `iconPaths` can resolve one. `lucide-react` is used, but only for fixed UI chrome the editor cannot reach (`src/Header/Nav/index.tsx`, `Nav/MegaMenu.tsx`, `src/blocks/TrustStrip/PauseToggle.tsx`).

- `icons.ts` — hand-maintained `iconPaths` map of Material Symbols (outlined, weight 400) path data, sourced from Google Fonts. Exports `IconName`.
- `index.tsx` — `Icon` component, renders `iconPaths[name]` as inline `<svg>`. Accepts free-text `name` (not restricted to `IconName`) so unknown CMS values render nothing instead of crashing.
- `src/components/MaterialIconPicker/` — Payload admin field component that adds a searchable icon-browser UI on top of a plain `text` field (not a `select`). Stores the icon's string key (e.g. `"local_hospital"`). Wired into `src/Header/config.ts` and available for reuse on any text field (e.g. CardGrid's `icon` field in `src/blocks/CardGrid/config.ts`).

## Adding a new icon

1. Find it at https://fonts.google.com/icons.
2. Copy its `<path d="...">` from `node_modules/@material-symbols/svg-400/outlined/<name>.svg` (requires `@material-symbols/svg-400`, already a devDependency).
3. Add `<name>: '<path d>'` to `iconPaths` in `icons.ts`.
