# Sincronizar contenido entre ambientes (import/export)

Usa el plugin `@payloadcms/plugin-import-export`, disponible por collection en
`/admin/collections/<slug>` (botones Export/Import arriba a la derecha del
listado). Habilitado hoy para: `pages`, `insights`, `media`, `categories`,
`brands`, `claims`, `forms`.

## Lo que el plugin NO hace

- **No mueve binarios.** Exportar `media` solo trae los campos del
  documento (filename, url, alt, mimeType, dimensiones) — no el archivo en
  sí. Los bytes viven en el storage (S3/R2 en prod, disco local en dev).
  Si origen y destino no comparten el mismo bucket, hay que copiar los
  archivos aparte (ej. `aws s3 sync` bucket a bucket) además de importar
  los documentos.
- **No resuelve dependencias entre collections.** Los campos `relationship`
  son foreign keys reales en Postgres — importar un doc que referencia un
  ID que todavía no existe en destino falla con un error de integridad
  referencial. El orden de importación es responsabilidad tuya.

## Orden recomendado (dependencias primero)

1. **`media`** — no depende de nada.
2. **`categories`** — no depende de nada.
3. **`forms`** — no depende de nada.
4. **`brands`** — no depende de nada.
5. **`insights`** — depende de `media` (imágenes) y `categories`.
6. **`pages`** — depende de `media`, `insights` (si hay referencias
   internas tipo `reference` en algún link), y `forms` (si algún link es
   `type: modal`).
7. **`claims`** — depende de `brands`.

Si tu deploy no toca todas las collections, solo hace falta respetar el
orden entre las que sí cambiaron.

## Checklist por sincronización

- [ ] Exportar collections en el orden de arriba, desde el ambiente origen.
- [ ] Si `media` cambió: sincronizar también los archivos del bucket
      (fuera de Payload).
- [ ] Importar en destino, mismo orden.
- [ ] Correr `pnpm payload migrate` en destino si hay migraciones de schema
      pendientes (el import/export no reemplaza las migraciones — son dos
      cosas distintas: schema vs. contenido).
- [ ] Verificar visualmente 2–3 páginas clave en destino después del
      import (relaciones rotas suelen notarse ahí, no en el import mismo).

## Por qué no automatizarlo (por ahora)

Automatizar esto (un script que exporte/importe todo en el orden correcto)
es viable, pero antes de escribirlo conviene confirmar con un ciclo manual
que el plugin efectivamente remapea IDs entre ambientes con datos
distintos (no lo hemos probado todavía). Si el remapeo de IDs no es
confiable, un script automatizado fallaría silenciosamente de la misma
forma que un import manual mal ordenado.
