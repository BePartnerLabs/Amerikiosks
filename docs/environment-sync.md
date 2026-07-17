# Import/export: qué sirve y qué no en este proyecto

Usa el plugin `@payloadcms/plugin-import-export`, disponible por collection en
`/admin/collections/<slug>` (botones Export/Import arriba a la derecha del
listado). Habilitado hoy para: `pages`, `insights`, `media`, `categories`,
`brands`, `claims`, `forms`.

**Este plugin NO es una herramienta de sincronización entre ambientes
(prod↔staging).** Verificado leyendo el código real de import
(`batchProcessor.js` del plugin): el comportamiento por modo hace que no
sea seguro para ese caso de uso.

## Por qué no sirve para sincronizar ambientes

Cada environment tiene su propia secuencia de IDs autogenerados en
Postgres (`SERIAL`), completamente independiente entre sí.

- **Modo `create`** (default): siempre llama `payload.create()` — nunca
  busca un doc existente, así que nunca sobreescribe nada. Pero por eso
  mismo, cada import genera **documentos duplicados con IDs nuevos**, y
  cualquier campo `relationship` en los datos importados (media, forms,
  otras páginas) sigue apuntando a los IDs del ambiente de **origen** —
  que en destino no existen o, peor, pertenecen a otro documento
  completamente distinto. Relaciones rotas garantizadas.
- **Modo `update`/`upsert`** con `matchField: 'id'` (el default): acá sí
  busca un doc existente por ese campo (`payload.find({ [matchField]:
  { equals: matchValue } })`) y lo **actualiza in-place** si lo
  encuentra. Como los IDs son independientes por ambiente, un `id`
  coincidente en destino casi seguro pertenece a un documento **no
  relacionado** — el import lo sobreescribe igual. Este es el modo
  realmente peligroso: puede pisar contenido de producción sin ninguna
  relación con lo que pensás estar actualizando.

En ningún modo el plugin mueve los binarios de `media` — solo exporta los
campos del documento (filename, url, alt, mimeType, dimensiones), nunca el
archivo en sí.

## Dónde SÍ es útil

- **Edición masiva dentro del mismo ambiente**: exportar `brands` (o
  cualquier collection), editar el CSV/JSON, reimportar en modo
  `update`/`upsert` — acá los IDs SÍ coinciden porque es el mismo DB, no
  hay riesgo de colisión con contenido ajeno.
- **Carga inicial en un ambiente nuevo y vacío**: modo `create` en un DB
  recién migrado sin datos previos — no hay colisión de IDs posible
  porque no hay nada todavía. Sigue sin resolver relaciones entre
  collections por sí solo (ver abajo), pero al menos no hay riesgo de
  sobreescritura.

## Si igual se necesita mover contenido entre ambientes

No usar import/export para esto. Alternativas reales:
- Restaurar un dump/snapshot de Postgres completo (pg_dump/pg_restore) —
  preserva IDs y relaciones consistentemente porque mueve TODO el schema
  + datos de una vez, no collection por collection.
- Sincronizar el bucket S3/R2 aparte (los binarios nunca viajan con
  Payload de ningún modo).

## Orden de dependencias (si de todos modos se usa create, en un ambiente vacío)

1. `media`, `categories`, `forms`, `brands` — no dependen de nada.
2. `insights` — depende de `media` y `categories`.
3. `pages` — depende de `media`, `insights` (si hay links `reference`) y
   `forms` (si algún link es `type: modal`).
4. `claims` — depende de `brands`.

Los campos `relationship` son foreign keys reales en Postgres — importar
fuera de este orden falla con un error de integridad referencial, igual
que ya vimos con el sistema de seed.
