## Context

Amerikiosks agrupa sus quioscos en series de letra griega (ALPHA, GAMMA, DELTA, ZETA, KAPPA...). Hoy `machines` (`src/collections/Machines/index.ts`) solo tiene modelos individuales (Alpha 10, Gamma 13...) sin relación estructurada entre sí; la agrupación es implícita en el nombre. No existe página `/machines` índice — solo `machines/[slug]/page.tsx` (detalle de modelo) y el bloque `MachinesListing` (filtro client-side por `machine-tags`, colocable en cualquier página).

El cliente proveyó dos mockups de UX de referencia:
- **`Lines.png`** (`/machines`): fila "Discover our model lines" (ícono por familia) + una sección narrativa por familia (eyebrow, heading, subheading, 4 tarjetas de beneficio, botón "Know more") — contenido de marketing de la serie, sin modelos individuales.
- **`Line detail.png`** (`machines/[slug]`, ya existe): hero + highlights + specs + dimensiones de un modelo puntual, con un cierre "Find the right kiosk for your space" mostrando **otras familias** (no otros modelos) + "View all models".

Decisiones ya validadas con el usuario durante el brainstorming:
- `machines` no se elimina ni se fusiona con la nueva collection de familia — son dos niveles de contenido distintos (serie vs. modelo concreto).
- `/machines/[family]` se inspira en las páginas de línea de producto de apple.com: arriba nav de familias, luego storytelling de la familia actual, abajo grid de sus modelos reales.
- El cliente/instalación real ("LOGO HERE" del mockup) se resuelve reusando `partners` (ya tiene `name` + `logo`), no duplicando esos campos en una collection nueva.
- `/machines` y `/machines/[family]` son rutas fijas en código (Next.js), no Payload Pages de layout-builder — mismo patrón que `machines/[slug]` hoy. Solo el bloque de home (`ModelLines`) es un bloque de layout-builder normal.
- Se detectó (no introducido por este change) que `Pages` no bloquea slugs que colisionan con rutas fijas de código (`machines`, `insights`, `faq`, `customer-service`, `projects`, `search`) — se cierra ese gap en el mismo change ya que el `family` reservado (`machines`) es directamente relevante acá.

## Goals / Non-Goals

**Goals:**
- Modelar `machine-families` como contenido de serie editable (marketing, sin specs de un modelo puntual).
- Modelar `machine-installations` como prueba social liviana (fotos + relación a `machine` + `partner`), con fallback: sin installations cargadas, la sección no se renderiza.
- Relacionar cada `machine` con su `machine-family` vía `relationship` (no un `select` hardcodeado, para que agregar una serie nueva no requiera tocar código).
- Construir `/machines` (landing narrativo) y `/machines/[family]` (línea de producto con modelos reales) como rutas fijas, consistentes con el patrón ya usado en `machines/[slug]`.
- Actualizar `RelatedMachines.tsx` para mostrar familias hermanas en vez de modelos aleatorios, según el mockup.
- Cerrar el gap de slugs reservados en `Pages`.

**Non-Goals:**
- No convertir `/machines` ni `/machines/[family]` en páginas de layout-builder editables por bloques — el cliente edita contenido (familia, modelo, installations), no el layout de estas rutas.
- No construir un sistema de reclasificación adicional por "categoría de uso" (comida caliente / retail / bebidas) mencionado en el brainstorming inicial — quedó fuera del alcance aprobado; se puede agregar como `machine-families.category` en un change futuro si se pide.
- No tocar `MachinesListing` en código (no se borra el bloque) — solo se audita/reemplaza su *uso* actual en el admin donde compita con las páginas nuevas.
- No se construye un flujo de traducción nuevo — se reutiliza el mecanismo existente de Payload `localization` (selector EN/ES por documento) ya usado en `Machines`.

## Decisions

**1. `machine-families` como collection nueva, no `select` en `machines`.**
Cada familia tiene contenido rico (tagline, descripción, 4 highlights, thumbnail) que un `select` hardcodeado no puede sostener sin re-deploy por cada campo nuevo. Alternativa descartada: campo `select` fijo en `machines` — más simple pero obliga a tocar código para cualquier cambio de copy o para agregar una serie nueva.

**2. `machines.family` es `relationship` (hasOne, required), no `machine-tags`.**
`machine-tags` (colección existente) es para atributos libres cruzados (`full-size`, `compact`, `premium`, `campaign`), no para una taxonomía exclusiva de un solo valor por máquina. Mezclar ambos conceptos en la misma lista de tags confunde el admin. Alternativa descartada: agregar tags "Alpha"/"Gamma"/etc. a `machine-tags` con un campo `type` para distinguirlos — más liviano pero reintroduce ambigüedad semántica y no fuerza *un solo* valor por máquina (un tag `hasMany` permitiría, por error, asignar dos familias a la vez).

**3. `machine-installations.client` es `relationship` a `partners`, no campos `clientName`/`logo` propios.**
`partners` (`src/collections/Partners.ts`) ya tiene exactamente `name` + `logo` para "Client/venue logos". Reusarlo evita duplicar datos y mantiene una sola fuente de verdad si el logo de un cliente cambia.

**4. `machine-installations` es una collection propia, no una extensión de `projects`.**
`projects` (case studies) tiene rich text `body` y está pensado para narrativa larga. El cliente pidió explícitamente algo más liviano — "solo las imágenes sin el caso de estudio específico". Alternativa descartada: agregar `machine` (relationship) + `gallery` (array) a `projects` — reusa más código pero fuerza a cargar/mantener un campo `body` que no aplica a este caso de uso, y mezcla dos audiencias de contenido (case studies editoriales vs. fotos de instalación) en una sola collection.

**5. `/machines` y `/machines/[family]` son rutas Next.js fijas, no Payload Pages.**
Confirmado explícitamente con el usuario. Mantiene el layout tipo Apple consistente (el cliente no puede desarmarlo arrastrando bloques) y evita construir 3 bloques de layout-builder nuevos para una estructura que en la práctica siempre es la misma. Alternativa descartada: páginas 100% de layout-builder — más flexible, pero mayor costo de build y riesgo de que un editor rompa el diseño.

**6. `/machines/[family]` combina narrativa + modelos reales en una sola página (patrón "línea de producto" de Apple), no solo un listado.**
Decisión tomada explícitamente tras mostrar el mockup: la página no es solo un catálogo filtrado, repite (desplegada) la sección narrativa de la familia que también aparece resumida en `/machines`, seguida del grid de modelos reales y, si existen, las instalaciones.

**7. Slugs reservados en `Pages` vía hook `beforeValidate`, no vía validación de campo aislada.**
Un hook a nivel de collection permite comparar contra una lista centralizada (`machines`, `insights`, `faq`, `customer-service`, `projects`, `search`) y crecer esa lista sin tocar el field config. Se agrega en este change porque `machines` (el slug reservado más directamente relevante) es justamente el que este change introduce como ruta fija nueva de mayor visibilidad.

**8. Localización: mismo mecanismo que `Machines` (Payload `localization`, `en`/`es`), slug no localizado.**
`machine-families.slug` y `machines.slug` quedan sin localizar (mismo slug en ambos idiomas, como ya ocurre con `machines/[slug]`), evitando rutas paralelas por idioma. El resto de campos de texto en `machine-families`/`machine-installations` van `localized: true`, editados con el selector EN/ES del admin en el propio documento — no hay una "página" central de traducciones distinta al documento de cada collection.

## Risks / Trade-offs

- **[Riesgo] `machines.family` es `required` → las ~10 máquinas existentes quedan en estado inválido hasta que se les asigna familia manualmente.** → Mitigación: la migración se documenta como paso manual explícito antes de considerar el build desplegable (ver Migration Plan); no se auto-asigna por heurística de nombre para evitar errores silenciosos (ej. "Kappa Showcase Blanco" no calza con un split simple del nombre).
- **[Riesgo] Contenido duplicado entre la sección de familia en `/machines` y la sección narrativa en `/machines/[family]`.** → Mitigación: es el mismo campo (`machine-families.highlights`) renderizado en dos vistas distintas (resumen vs. desplegado) — no hay duplicación de datos, solo de presentación, que es la intención del mockup tipo Apple.
- **[Riesgo] `machine-installations` sin instalaciones cargadas para una familia deja una página con menos contenido de lo esperado.** → Mitigación: fallback explícito (sección oculta si `payload.find` devuelve 0 docs), documentado en `docs/CLIENT-MANUAL.md`; no rompe el layout ni deja huecos vacíos.
- **[Trade-off] Rutas fijas en vez de layout-builder** → menos flexibilidad para el cliente en el largo plazo si quiere reordenar secciones de `/machines`; aceptado explícitamente a cambio de consistencia visual y menor costo de build.
- **[Riesgo] Cambiar `RelatedMachines.tsx` de "modelos aleatorios" a "familias hermanas" es un cambio de comportamiento visible.** → Mitigación: está directamente respaldado por el mockup `Line detail.png`, que muestra íconos de familia (Apha/Delta/Kappa/Zeta), no de modelos.

## Migration Plan

1. Crear `machine-families` y `machine-installations` (collections nuevas) + agregar `machines.family` (relationship, required).
2. `pnpm payload migrate:create` → revisar el SQL generado → `pnpm payload migrate` en cada entorno.
3. `pnpm generate:types` + `pnpm generate:importmap`.
4. En `/admin`: crear los 6 documentos `machine-families` (Alpha, Beta, Gamma, Delta, Zeta, Kappa) con su contenido (tagline, highlights, thumbnail) **antes** de asignar `family` a las máquinas — de lo contrario el campo required bloquea el guardado de cada `machine`.
5. Asignar `family` a las ~10 `machines` existentes.
6. (Opcional para lanzamiento, no bloqueante) Cargar 1+ `machine-installations` de prueba por familia.
7. Agregar el bloque `ModelLines` a la página Home desde `/admin`.
8. Deploy del código (rutas nuevas, bloque, hook de slugs reservados) — no hay rollback de datos necesario si se revierte el código, ya que las collections nuevas quedan simplemente sin consumir en el frontend.

**Rollback:** revertir el commit/deploy del código deja las collections y el campo `family` en la base de datos sin uso visible (no rompe el resto del sitio, ya que ninguna ruta existente depende de ellas). No se requiere migración inversa a menos que se quiera limpiar el schema.

## Open Questions

- ¿Se quiere en algún momento la reclasificación por "categoría de uso" (comida caliente / retail / bebidas) mencionada en el brainstorming inicial? Quedó fuera de este change; si se pide, sería un campo `category` adicional en `machine-families` + una sección extra en `/machines`.
- ¿El hook de slugs reservados en `Pages` debe ser configurable desde `/admin` (lista editable) o hardcodeado en código? Se asume hardcodeado por ahora, dado que las rutas fijas solo cambian con deploys de código de todos modos.
