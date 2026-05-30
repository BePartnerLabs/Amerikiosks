---
name: reference_bpl_ds_tokens
description: BPL Design System CSS custom properties — always use these instead of hardcoded values
metadata:
  type: reference
---

DS site: http://ds.bepartnerlabs.com/

## Pattern
- Public tokens: `--bp-*` on `:root`
- Private component vars: `--_*` (internal only, not for use in app code)
- Component public API: `--btn-bg`, `--nav-gap`, `--header-bg`, etc.

## Color
```
--bp-primary: #5fcb9f
--bp-color-bg: #f8f6f2 / dark: #16140f
--bp-color-bg-subtle: #f2efe9 / dark: #1e1c17
--bp-color-bg-elevated: #ffffff / dark: #242118
--bp-color-text: #181715 / dark: #f2eee6
--bp-color-text-muted: #6b6760 / dark: #9e9a93
--bp-color-text-inverse: #f2eee6 / dark: #181715
--bp-color-border: #e5e0d8 / dark: #2d3b30
--bp-color-success: #2e9e72
--bp-color-warning: #c97a3d
--bp-color-error: #b14a3a
--bp-color-info: #3b82f6
```

## Spacing (4px base)
```
--bp-space-1: 0.25rem   --bp-space-2: 0.5rem
--bp-space-3: 0.75rem   --bp-space-4: 1rem
--bp-space-6: 1.5rem    --bp-space-8: 2rem
--bp-space-10: 2.5rem   --bp-space-12: 3rem
--bp-space-16: 4rem     --bp-space-24: 6rem
```

## Typography
```
--bp-font-sans: system-ui, -apple-system, "Segoe UI", ...
--bp-font-mono: "JetBrains Mono", ...
--bp-text-xs through --bp-text-5xl (fluid scale)
```

## Radius
```
--bp-radius: 0.625rem
--bp-radius-sm  --bp-radius-md  --bp-radius-lg  --bp-radius-xl  --bp-radius-full
```

## Motion
```
--bp-duration-fast: 120ms   --bp-duration-normal: 220ms   --bp-duration-slow: 380ms
--bp-ease: cubic-bezier(0.4, 0, 0.2, 1)
--bp-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)
--bp-focus-ring: 0 0 0 3px <focus color>
```

## Shadows
```
--bp-shadow-sm  --bp-shadow-md  --bp-shadow-lg  --bp-shadow-xl
```

## Component public APIs (examples)
- Button: `--btn-bg`, `--btn-color`, `--btn-border`, `--btn-radius`, `--btn-padding-x`, `--btn-padding-y`, `--btn-font-size`, `--btn-bg-hover`
- Nav: `--nav-gap`, `--nav-link-color`
- Header: `--header-bg`, `--header-height`, `--header-z`

## Rule
Always use `--bp-*` tokens for any color, spacing, radius, shadow, or motion value. Never hardcode hex colors, pixel/rem values, or timing values that have a token equivalent.
