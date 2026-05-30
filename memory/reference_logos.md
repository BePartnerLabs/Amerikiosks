---
name: reference_logos
description: Which logo files to use for each context in the Amerikiosks site
metadata:
  type: reference
---

All logos are in `public/logos/logo-N.svg`.

| File | Use |
|---|---|
| `logo-9.svg` | Favicon / clean isotype (also at `public/favicon.svg`) |
| `logo-1.svg` | Mobile header / compact rectangular version |
| `logo-4.svg` | Desktop header / full horizontal version |

Logo component at `src/components/Logo/Logo.tsx` — shows `logo-4` on `md+` and `logo-1` on mobile.
