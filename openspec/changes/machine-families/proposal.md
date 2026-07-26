## Why

Amerikiosks agrupa sus quioscos en series identificadas por letras griegas (ALPHA, GAMMA, DELTA, ZETA, KAPPA...). Hoy no existe ninguna vista que comunique esas series como líneas de producto: `machines` solo tiene modelos individuales sin relación estructurada entre sí, y no hay forma de navegar "quiero ver todos los Gamma" desde el home ni desde una página dedicada. El cliente proveyó mockups de UX (tipo apple.com/iphone) pidiendo una vista representativa de cada familia, clickeable, con contenido narrativo propio y listado de modelos reales por serie.

## What Changes

- Nueva collection `machine-families`: contenido de marketing por serie (tagline, descripción, thumbnail, highlights de 4 tarjetas, CTA).
- Nueva collection `machine-installations`: fotos de instalaciones reales de clientes, relacionadas a una `machine` (y transitivamente a su familia) y a un `partner` existente — sin caso de estudio elaborado.
- `machines`: se agrega un campo `family` (relationship, required) hacia `machine-families`. **BREAKING** para los ~10 documentos `machines` existentes, que deben migrarse manualmente asignando su familia antes de que el build/validación de contenido pase.
- Nuevo bloque de home `ModelLines`: fila de tarjetas de familia (thumbnail + nombre), linkeando a `/machines/[family]`.
- Nueva página fija `/machines` (landing narrativo, no editable por bloques): nav sticky por familia + sección por familia (tagline/highlights/CTA "Know more").
- Nueva página fija `/machines/[family]` (tipo línea de producto de Apple): fila de todas las familias, narrativa de la familia actual, grid de modelos reales de esa familia, sección de instalaciones reales (oculta si no hay ninguna cargada).
- `RelatedMachines.tsx` (sección "Find the right kiosk for your space" en el detalle de modelo) cambia de mostrar 3 machines aleatorios a mostrar otras familias (excluyendo la actual).
- `Pages`: hook `beforeValidate` que bloquea slugs reservados (`machines`, `insights`, `faq`, `customer-service`, `projects`, `search`) para que un editor no pueda crear una Page que colisione con estas rutas fijas de código.
- Revisión y limpieza del uso actual del bloque `MachinesListing` en el admin, reemplazándolo por enlaces a las nuevas páginas donde compita con la nueva experiencia (el bloque no se elimina del código).

## Capabilities

### New Capabilities
- `machine-families`: collection y páginas (`/machines`, `/machines/[family]`) que agrupan modelos por serie, con contenido narrativo editable y navegación tipo Apple entre líneas de producto.
- `machine-installations`: registro de fotos de instalaciones reales de clientes, relacionadas a un modelo (`machines`) y a un `partner`, mostradas como prueba social en la página de familia.

### Modified Capabilities
- (ninguna spec existente en `openspec/specs/` cubre `machines` o páginas de catálogo hoy — no hay deltas sobre specs previos)

## Impact

- **Collections nuevas**: `src/collections/MachineFamilies/index.ts`, `src/collections/MachineInstallations/index.ts`.
- **Collection modificada**: `src/collections/Machines/index.ts` (campo `family`), `src/collections/Pages/index.ts` (hook de slugs reservados).
- **Migraciones**: `pnpm payload migrate:create` + `pnpm generate:types` + `pnpm generate:importmap`; poblar `family` en las máquinas existentes y crear los 6 `machine-families` desde el admin antes de considerar el cambio desplegable.
- **Bloque nuevo**: `src/blocks/ModelLines/` + registro en `src/blocks/RenderBlocks.tsx` y `src/collections/Pages/index.ts` (`layout.blocks`).
- **Rutas nuevas**: `src/app/(frontend)/[locale]/machines/page.tsx`, `src/app/(frontend)/[locale]/machines/[family]/page.tsx`.
- **Archivo modificado**: `src/app/(frontend)/[locale]/machines/[slug]/RelatedMachines.tsx`.
- **Docs**: `docs/CLIENT-MANUAL.md` (cómo crear familias, asignar `family` a una máquina, cargar installations).
- Sin impacto en integraciones externas ni en API pública; todo el contenido nuevo se consume vía Payload Local API.
