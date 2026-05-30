---
name: feedback_layout_required
description: El campo layout en Pages se quitó el required para permitir páginas vacías en seed — pendiente revisar si debe volver a requerirse
metadata:
  type: feedback
---

El campo `layout` en `src/collections/Pages/index.ts` tenía `required: true` y se quitó para permitir páginas vacías en el seed. Actualmente también acepta `null/undefined`.

**Why:** Se necesitaban páginas placeholder sin contenido para que los links del nav funcionen desde el inicio.

**How to apply:** Cuando el sitio tenga contenido real en todas las páginas, considerar si vuelve a ponerse `required: true` y eliminar el `null` check en `RenderBlocks` y `[slug]/page.tsx`. Discutirlo con el usuario antes de hacerlo.
