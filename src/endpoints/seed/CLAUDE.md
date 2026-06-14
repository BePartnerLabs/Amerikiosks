# Seed System — Context for Claude

## Estructura

| Archivo | Propósito |
|---|---|
| `src/app/(frontend)/next/seed/run/route.ts` | Endpoint POST — despacha por `?part=` |
| `src/endpoints/seed/pages/utils.ts` | `upsertPage()` — crea/actualiza EN, luego ES |
| `src/endpoints/seed/uploadMedia.ts` | Sube imagen de `public/seed-assets/`, idempotente |
| `src/components/SeedPanel/index.tsx` | Botones en el dashboard — agregar entrada aquí |
| `public/seed-assets/` | Todas las imágenes del seed viven aquí |

## Agregar un nuevo seed

1. Crear `src/endpoints/seed/pages/<name>.ts`
2. Exportar `async function seed<Name>(payload, req)`
3. Registrar en `route.ts` → objeto `parts`: `'my-part': seedMyPart`
4. Agregar en `SeedPanel/index.tsx` → array `PARTS`: `{ key: 'my-part', label: 'My Part' }`

## uploadMedia — idempotente por filename

```ts
const image = await uploadMedia(
  payload, req,
  path.join(process.cwd(), 'public', 'seed-assets', 'my-image.jpg'),
  'Alt text',
)
// image.id → usar en hero.media, items[].image, etc.
```

Idempotente: si ya existe el archivo en DB, lo reutiliza. En producción (Vercel Blob), `route.ts` borra blobs por stem antes de correr — registrar nuevos stems en `seedStems[]` en `route.ts` para evitar error "blob already exists" al re-seedear tras reset de DB.

## upsertPage — patrón base

```ts
await upsertPage(payload, req,
  { title: 'My Page', slug: 'my-page', hero: { ... }, layout: [...], _status: 'published', meta: { ... } },
  { title: 'Mi Página', slug: 'mi-pagina', hero: { ... }, layout: [...], meta: { ... } },
)
```

Internamente:
1. Busca página existente por slug EN
2. Crea o actualiza en locale `en`
3. Re-fetch con `depth:0` para obtener IDs de rows de arrays (layout blocks, hero links)
4. Actualiza locale `es` inyectando los IDs de EN automáticamente

## layout NO está localizado — nunca pasar `layout: []` en ES

`layout` es compartido entre locales. Pasar `layout: []` en el update ES borra el layout EN para todos los locales.

`upsertPage` lo maneja: extrae `layout` del objeto ES y solo lo pasa cuando los bloques ES tienen valores de campos localizados. Nunca sobreescribir esto.

```ts
// ❌ borra el layout de TODOS los locales
{ title: 'Para Marcas', slug: 'para-marcas', layout: [], meta: { ... } }

// ✅ omitir layout en ES si no hay traducciones de bloque
{ title: 'Para Marcas', slug: 'para-marcas', hero: { ... }, meta: { ... } }
```

## Stub pages y el patrón delete-before-upsert

`seedAudiencePages` pre-crea las audience pages como stubs con hero `lowImpact` y `links: []`. Si el seed específico quiere un `hero.type` diferente (e.g. `mediumImpact`), hay que borrar el stub primero — de lo contrario `upsertPage` hace UPDATE y Payload falla validación de link fields.

```ts
const existing = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'for-brands' } },
  limit: 1,
  req,
})
if (existing.totalDocs > 0) {
  await payload.delete({ collection: 'pages', id: existing.docs[0]!.id, overrideAccess: true, req })
  payload.logger.info('  Deleted existing for-brands page stub')
}
// ahora upsertPage crea desde cero con el hero correcto
```

**Regla:** si la página existe con diferente `hero.type` o con `links: []` cuando el seed pone links → borrarla antes.

## Hero links en ES — siempre pasarlos

`upsertPage` inyecta automáticamente los IDs de row EN en los links del hero ES. Pero hay que pasar el hero ES con los links traducidos:

```ts
hero: {
  type: 'mediumImpact',
  media: heroImage.id,
  richText: { /* ES richText */ },
  links: [
    { link: { label: 'Iniciar un programa de marca', type: 'custom', url: '/contact', appearance: 'default' } },
    { link: { label: 'Ver casos de éxito', type: 'custom', url: '/insights', appearance: 'outline' } },
  ],
},
```

**Nunca omitir `links` en ES cuando el hero EN tiene links** — Payload valida `url`+`label` requeridos en cada locale al hacer update.

## Items con campos localizados dentro — ES explícito

Si el bloque tiene array `items` con campos `localized: true` (e.g. `cta`, `label`, `description`), definir los items ES explícitamente:

```ts
// ✅ items ES explícitos cuando cta es localized
items: [
  { page: Number(pageIds['for-brands']), image: mediaIds['for-brands'], cta: 'Explorar programas de marca' },
  { page: Number(pageIds['for-venues']), image: mediaIds['for-venues'], cta: 'Explorar ingresos por venue' },
]
```

`upsertPage` inyecta los IDs de row EN automáticamente — no rastrear IDs manualmente.

Verificar en `config.ts` del bloque si los fields dentro de items tienen `localized: true`.

## Seeding colecciones (Machines, FAQItems, etc.)

Siempre: buscar por campo único estable → update si existe, create si no. Para bilingüe: EN primero, luego ES por separado.

```ts
const existing = await payload.find({ collection: 'machines', where: { slug: { equals: m.slug } }, limit: 1, req })

let id: number
if (existing.totalDocs > 0) {
  const updated = await payload.update({
    collection: 'machines', id: existing.docs[0]!.id, locale: 'en',
    data: { name: m.name, tagline: m.tagline, image: image.id, tags: [{ label: m.tag }] },
    req: { ...req, locale: 'en' } as PayloadRequest,
  })
  id = updated.id as number
} else {
  const created = await payload.create({
    collection: 'machines', locale: 'en',
    data: { name: m.name, slug: m.slug, tagline: m.tagline, image: image.id, tags: [{ label: m.tag }], layout: [], _status: 'published' },
    req: { ...req, locale: 'en' } as PayloadRequest,
  })
  id = created.id as number
}

await payload.update({
  collection: 'machines', id, locale: 'es',
  data: { name: m.nameEs, tagline: m.taglineEs },
  req: { ...req, locale: 'es' } as PayloadRequest,
})
```

## seedAudiencePages — patrón skip-if-exists

`seedAudiencePages` retorna `{ pageIds, mediaIds }` que usa `seedHome`. Al re-seedear, las audience pages ya existen con heroes más ricos. El patrón correcto:

```ts
// Siempre subir media (idempotente) — así mediaIds siempre se llena
const heroImage = await uploadMedia(payload, req, path.join(...), alt)
mediaIds[page.slug] = heroImage.id as number

const existing = await payload.find({ collection: 'pages', where: { slug: { equals: page.slug } }, limit: 1, depth: 0, req })

if (existing.totalDocs > 0) {
  pageIds[page.slug] = String(existing.docs[0]!.id)
  payload.logger.info(`  Audience page exists, skipping stub: ${page.slug}`)
  continue
}

const result = await upsertPage(payload, req, enData, esData)
pageIds[page.slug] = String(result.id)
```

**No extraer `mediaIds` de `doc.hero.media`** — el hero type es union discriminado y `media` solo existe en algunas variantes. Re-subir siempre.

## Orden de ejecución en `seedPages`

```ts
const { pageIds, mediaIds } = await seedAudiencePages(payload, req)
await seedForBrands(payload, req)          // borra stub, crea página completa
await seedForVenues(payload, req)
await seedForAgencies(payload, req)
await seedForEmergingBrands(payload, req)
await seedHome(payload, req, pageIds, postIds, mediaIds)  // usa pageIds/mediaIds actualizados
```

## richText helper

```ts
const richText = (text: string) => ({
  root: {
    type: 'root',
    version: 1,
    direction: null,      // requerido
    format: '' as const,  // requerido
    indent: 0,            // requerido
    children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text }] }],
  },
})
```

`direction: null`, `format: '' as const`, `indent: 0` son requeridos — omitirlos causa TypeScript errors.

## revalidatePage — locale-aware paths

**Aprendido 2026-06-14:** El hook `revalidatePage` en `src/collections/Pages/hooks/revalidatePage.ts` debe considerar el locale para construir el path correcto.

Con `localePrefix: 'as-needed'` (configurado en `src/i18n/routing.ts`):
- EN (default): `/for-brands` — sin prefijo
- ES: `/es/para-marcas` — con prefijo `/es/`

Si el hook usa `doc.slug` directamente sin el prefijo de locale, en producción el cache ISR de Next.js no se invalida para la URL ES correcta.

El fix es leer `req.locale` en el hook y anteponer `/${locale}` para locales no-default.

## IDs — siempre Number(), nunca String()

Las FKs en Postgres son integers. Pasar strings causa errores de validación silenciosos.

```ts
// ❌
{ page: String(pageIds['for-brands']) }

// ✅
{ page: Number(pageIds['for-brands']) }
```

## Errores comunes

| Error | Fix |
|---|---|
| Falta `direction`/`format`/`indent` en richText root | Los tres son requeridos |
| Página existente con diferente `hero.type` | Borrar stub primero, luego `upsertPage` crea desde cero |
| Omitir `hero` en ES cuando EN hero tiene `links` | Payload valida `url`+`label` en todos los locales — siempre pasar ES hero con `links` |
| Pasar `layout: []` en datos ES | Layout no está localizado — omitirlo; `upsertPage` lo strip automáticamente |
| No registrar seed en `seedPages` | "Seed all" crea solo el stub; la página completa nunca se seedea |
| No agregar stem al `seedStems` en `route.ts` | Error "blob already exists" al re-seedear tras reset de DB |
| No agregar botón en `SeedPanel/index.tsx` | El botón no aparece en el dashboard |
| Usar `String()` para IDs FK | Postgres rechaza strings en integer FKs |
| `revalidatePage` con slug sin prefijo de locale | En producción, el ISR no invalida la URL ES — usar `req.locale` para construir el path |
