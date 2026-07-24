# Seed System — Context for Claude

**El sistema de seed que poblaba el contenido inicial de marketing ya cumplió su vida útil** — el sitio está en producción y el contenido real se administra vía `/admin` y el plugin de import/export de Payload, no con seeds. Los seeds que existían (`for-brands`, `for-venues`, `for-agencies`, `for-emerging-brands`, páginas legales, posts de ejemplo, etc.) se borraron el 2026-07-24.

Solo queda `home-static.ts`, que es un **fallback de producción** (no un seed) — se usa en `src/app/(frontend)/[locale]/[slug]/page.tsx` cuando no hay página `home` en la DB, para que el sitio nunca quede en blanco.

Esta guía documenta el **patrón** por si hace falta seedear algo puntual en el futuro (ej. un reset de DB de desarrollo, o poblar una collection nueva) — no hay endpoint ni infraestructura de seed activa hoy.

## Cómo armar un seed puntual si hace falta

1. Crear un endpoint temporal (Payload `endpoints` en `payload.config.ts`, o una ruta en `src/app/(frontend)/next/`) que llame a una función `seed<Nombre>(payload, req)`.
2. Usar el patrón find-then-create-or-update por campo único estable (slug, label, etc.) para que sea idempotente — nunca duplicar en un re-run.
3. Subir media con `getPayload().create({ collection: 'media', ... })`, idempotente por filename si es posible.
4. Borrar el endpoint/función una vez usado — no dejar código de seed viviendo indefinidamente en el repo si ya no se va a re-ejecutar.

## Lecciones del sistema anterior (por si se repite el patrón)

- **`layout` no está localizado** — nunca pasar `layout: []` en una actualización de un locale no-default, borra el layout para todos los locales.
- **richText root requiere `direction`, `format`, `indent`** explícitos — omitirlos causa errores de TypeScript.
- **IDs de FK siempre `Number()`**, nunca `String()` — Postgres rechaza strings en columnas integer.
- **Arrays con campos `localized: true` dentro** (ej. un item con `label` localizado) no tienen tabla `_locales` separada — inyectar el `id` de la row del locale EN al actualizar ES colisiona (`ValidationError: Value must be unique`). Solo inyectar `id` cuando el array en sí no es `localized: true`.
- **`revalidatePage`** debe considerar el locale al construir el path (`/es/...` con `localePrefix: 'as-needed'`), si no el ISR no invalida la URL correcta en producción.
