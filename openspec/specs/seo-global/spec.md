# SEO Global — Spec

> Controla robots.txt, llms.txt y configuración de analytics desde el admin de Payload.

---

## Contexto

El Global `settings` ya existe con dos campos: `noIndex` (checkbox) y `googleAnalyticsId` (text). El `robots.ts` de Next.js lee `noIndex` y genera una respuesta binaria: bloquea todo o permite todo. No hay soporte para reglas granulares por agente ni para `llms.txt`.

Esta spec extiende `settings` en tres secciones (tabs de Payload) y añade la ruta `/llms.txt`.

---

## Arquitectura

```
src/
├── Settings/
│   └── config.ts              # Global config — extiende con tabs + nuevos fields
├── app/
│   ├── robots.ts              # Lee settings.robotsRules para generar robots.txt
│   └── llms.txt/
│       └── route.ts           # Route Handler — genera llms.txt desde Payload Local API
└── endpoints/seed/
    └── settings.ts            # Seed actualizado con valores por defecto SEO
```

---

## Settings Global — Tabs

### Tab: Indexing

| Campo | Tipo | Default | Descripción |
|---|---|---|---|
| `noIndex` | checkbox | `true` | Bloquea todos los crawlers. Tiene precedencia sobre `robotsRules`. |
| `robotsRules` | array | `[]` | Reglas por agente. Solo se aplican cuando `noIndex` es `false`. |

**`robotsRules` — campos del array:**

| Campo | Tipo | Default | Descripción |
|---|---|---|---|
| `userAgent` | text | `*` | User-agent del bot (ej: `Googlebot`, `GPTBot`) |
| `allow` | array de text | `[]` | Rutas permitidas (ej: `/`) |
| `disallow` | array de text | `[]` | Rutas bloqueadas (ej: `/admin`, `/preview`) |

**Comportamiento de `robots.ts`:**

```
si noIndex === true
  → { rules: [{ userAgent: '*', disallow: '/' }] }
si noIndex === false y robotsRules.length === 0
  → { rules: [{ userAgent: '*', allow: '/' }], sitemap: <url>/sitemap.xml }
si noIndex === false y robotsRules.length > 0
  → mapear robotsRules a MetadataRoute.Robots, agregar sitemap
```

**Bots AI a bloquear por defecto en seed** (cuando `noIndex` pasa a `false`):

```
GPTBot, Claude-Web, CCBot, anthropic-ai, Bytespider, FacebookBot, Omgilibot
```

Estos se pre-cargan en `robotsRules` vía seed con `disallow: ['/']`.

### Tab: Analytics

| Campo | Tipo | Default | Descripción |
|---|---|---|---|
| `googleAnalyticsId` | text | `''` | GA4 Measurement ID (ej: `G-XXXXXXXXXX`) |

Sin cambios funcionales — solo se mueve a esta tab.

### Tab: LLMs

| Campo | Tipo | Default | Descripción |
|---|---|---|---|
| `llmsEnabled` | checkbox | `false` | Habilita la ruta `/llms.txt` |
| `llmsSiteDescription` | textarea | `''` | Descripción del sitio para agentes IA |
| `llmsIncludePages` | checkbox | `true` | Incluir páginas publicadas |
| `llmsIncludeInsights` | checkbox | `true` | Incluir posts/insights publicados |

---

## Ruta `/llms.txt`

**Archivo:** `src/app/llms.txt/route.ts`

**Formato estándar llms.txt:**

```
# <site name>

> <llmsSiteDescription>

## Pages

- [<title>](<url>): <meta description si existe>

## Insights

- [<title>](<url>): <meta description si existe>
```

**Comportamiento:**

- Si `llmsEnabled === false` → responde `404`
- Datos desde Payload Local API (`overrideAccess: false`, solo publicados)
- `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`
- On-demand revalidation vía `revalidateTag('llms-txt')` en `revalidateSettings`

---

## Revalidación

El hook `revalidateSettings` existente en `src/Settings/hooks/revalidateSettings.ts` ya llama `revalidatePath('/')`. Se extiende para invalidar también:

- `revalidatePath('/robots.txt')`
- `revalidateTag('llms-txt')`

---

## Seed

El seed de `settings` se actualiza para incluir:

```ts
robotsRules: [
  { userAgent: 'Googlebot', allow: ['/'], disallow: [] },
  { userAgent: 'Bingbot',   allow: ['/'], disallow: [] },
  { userAgent: 'GPTBot',    allow: [],    disallow: ['/'] },
  { userAgent: 'Claude-Web',allow: [],    disallow: ['/'] },
  { userAgent: 'CCBot',     allow: [],    disallow: ['/'] },
],
llmsEnabled: true,
llmsSiteDescription: 'Amerikiosks deploys branded vending experiences in premium venues...',
llmsIncludePages: true,
llmsIncludeInsights: true,
```

---

## Migraciones

Se requiere `pnpm payload migrate:create` después de los cambios en `Settings/config.ts` para generar la migración del array `robotsRules` y los campos llms.

---

## Qué NO incluye esta spec

- Control de sitemap desde el admin (queda en código)
- `llms-full.txt` (versión extendida con contenido completo) — posible iteración futura
- Configuración de Search Console o Bing Webmaster Tools
