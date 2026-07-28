---
name: figma-tokens
description: Resolver paths de variables de Figma (ej. "md/semantic/type/text/title/title-2/font-size", "primary/main") contra docs/tokens-figma.json usando scripts/figma-token.py. Usar siempre que el usuario pegue un path o nombre de variable copiado del inspector de Figma, antes de responder con un valor.
---

# Figma Design Tokens

`docs/tokens-figma.json` es el export de variables de Figma (colecciones `01 Brand`, `02 Foundation`, componentes, `Typography`, `Effects`). Cuando el usuario pase un path de Figma (ej. `md/semantic/type/text/title/title-2/font-size`, o cualquier fragmento parecido copiado del inspector de Figma), buscarlo ahí antes de responder:

```bash
python3 scripts/figma-token.py "title-2/font-size"
python3 scripts/figma-token.py "primary/main"   # resuelve alias hasta el valor concreto
```

El match es por substring sobre `colección | modo | nombre`, así que paths parciales o con prefijos de modo que no existen en el export (ej. `md/semantic/...`) igual matchean por la parte que sí existe — o informan "no encontrado" si de verdad no está.

**Nota:** el export actual no tiene una colección "Semantic" con modos por breakpoint (`md`/`lg`/etc.) — solo `Mode 1` / `Style`. Si Figma muestra un valor distinto por breakpoint que este script no encuentra, pedir el valor exacto al usuario en vez de inventarlo.

Cuando el valor de Figma no calce con ningún `--bp-text-*` existente del DS, crear un override Level 2 (`--<component>-*`) en el bloque en vez de forzar el token más cercano — ver `src/blocks/CardGrid/styles.css` (`--card-grid-heading-size`) como ejemplo.
