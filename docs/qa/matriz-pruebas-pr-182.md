# Matriz de pruebas — PR #182 (audit hardening)

Validación caso a caso sobre el deploy de `preview/audit-hardening`.
Producción corre aún el código viejo — sirve como "antes" para comparar.

> ⚠️ El caso 4 en preview crea un item **REAL** en Monday (el mock solo aplica en dev local). Borrarlo a mano después.

Marca cada caso y anota el resultado observado.

---

## 🔒 Seguridad

### ✅ 1. Bypass de draft mode — VALIDADO
- **Cómo:** anónimo/incógnito → `<PREVIEW_URL>/next/preview?path=/&collection=pages&slug=home`
- **Esperado:** `403` sin cookie de draft. (Prod viejo: `307` + cookie incluso en incógnito = el bug.)
- **Resultado:** ✅ preview 403, prod 307 (confirma bug viejo y fix nuevo). Validado 2026-07-30.

### ✅ 2. Preview legítimo de editores sigue vivo — VALIDADO
- **Cómo:** logueado en `/admin` → Live Preview de una página o máquina.
- **Esperado:** funciona igual que antes (307 y ves el draft).
- **Resultado:** ✅ con sesión el preview se ve normal. Validado 2026-07-30.

### ✅ 3. Claims REST cerrado — VALIDADO (local)
- **Cómo:** `curl -X POST <URL>/api/claims -H 'content-type: application/json' -d '{}'`
- **Esperado:** `403` (antes: creaba doc y disparaba sync a Monday).
- **Resultado:** ✅ local → 403. Validado 2026-07-30.

### ✅ 4. Claim legítimo sigue funcionando — VALIDADO (local, mock)
- **Cómo:** POST multipart a `/next/claims-submit` con datos completos.
- **Esperado:** `201`, claim creado, pipeline de sync corre.
- **Resultado:** ✅ local → 201 (claim id 30), `[monday:mock] create_item (claim) — not sent` con todo el mapeo de columnas correcto. Nada salió a Monday real (mock activo en dev). Validado 2026-07-30.

### ✅ 5. Drafts de máquinas/proyectos ocultos — VALIDADO (local)
- **Cómo:** anónimo → `/api/machines?draft=true` y `/api/projects?draft=true`.
- **Esperado:** solo documentos publicados.
- **Resultado:** ✅ local → machines 9/9 published, projects 8/8 published; ningún draft expuesto. Validado 2026-07-30.

### ✅ 6. Contenido publicado intacto — VALIDADO (local)
- **Cómo:** `totalDocs` de machines/families/projects vs contenido esperado.
- **Esperado:** mismo contenido y mismo conteo.
- **Resultado:** ✅ local → machines 9, families 5, projects 8 — consistente. Validado 2026-07-30.

---

## 🖼️ Media / R2

### ✅ 7. Imágenes desde el CDN — VALIDADO (local)
- **Cómo:** navegar home, machines, insights; buscar errores `image-unconfigured-host`.
- **Esperado:** imágenes cargan desde `cdn.amerikiosks.com` sin errores de `next/image`.
- **Resultado:** ✅ 0 errores en todas. ⚠️ Ojo: al principio daba `hostname not configured` — era el **dev server viejo** (arrancó 08:04, `.env.local` cambió 10:36). Tras reiniciarlo, limpio. Lección: si tocas `S3_PUBLIC_URL`, reinicia `pnpm dev`. Validado 2026-07-30.

### ✅ 8. Videos — VALIDADO (con aclaración importante)
- **Cómo:** video del hero en el home + revisión del código de render.
- **Resultado:** ✅ el video del home carga bien (confirmado en navegador).
- **Aclaración:** el hero HighImpact **no pasa por `VideoMedia`** — lee
  `backgroundVideo.url` directamente (`src/heros/HighImpact/index.tsx:14-17`), que ya
  era la URL absoluta del CDN, así que **nunca estuvo afectado por el bug**.
  `VideoMedia` solo se usa vía `<Media resource={...}/>` cuando el `mimeType` del
  recurso es video (`src/components/Media/index.tsx:10`), y hoy ninguna página
  publicada hace eso. O sea: el fix es correcto pero aún sin uso en contenido real;
  se ejercitará cuando se publique un MediaBlock apuntando a un video.
  Validado 2026-07-30.

### ✅ 9. og:image sin doble prefijo — VALIDADO (local)
- **Cómo:** view-source de varias páginas → meta `og:image`.
- **Esperado:** una sola URL bien formada.
- **Resultado:** ✅ `http://cdn.amerikiosks.com/amerikiosks/hero-home-1200x630.png` etc. **0 ocurrencias** de concatenación `localhost:3000http` en todo el HTML. Validado 2026-07-30.

### ✅ 10. JSON-LD de producto (máquinas) — VALIDADO (local)
- **Cómo:** view-source de `/machines/zeta/zeta-2` → `"@type":"Product"` → campo `image`.
- **Esperado:** URL única y válida.
- **Resultado:** ✅ `"image":"http://cdn.amerikiosks.com/amerikiosks/vista Frente Zeta 2 no BG.png"` — sin doble prefijo. Validado 2026-07-30.

---

## ✅ Correctitud

### ✅ 11. Regeneración sin 500 (gotcha DYNAMIC_SERVER_USAGE) — VALIDADO (preview)
- **Cómo:** en el preview deploy (build de producción), se editó el SEO title del insight
  `end-to-end-operation` y se publicó; luego se pidió la URL pública.
- **Esperado:** el cambio se refleja sin 500.
- **Resultado:** ✅ publicó correctamente, la página pública devolvió **200** y el
  `<title>` se actualizó al instante a "What end-to-end operation includes | Amerikiosks".
  El gotcha no se reproduce. Validado 2026-07-30.
- **Nota de contenido:** ese SEO title quedó rellenado en la base de **preview** (antes estaba
  vacío). Es una mejora, pero si prefieres revertirlo se hace desde el admin.

### ✅ 12. Búsqueda por locale — VALIDADO (local)
- **Cómo:** `/es/search?q=premium` vs `/search?q=premium`.
- **Esperado:** resultados en el idioma correcto (antes ES devolvía títulos EN).
- **Resultado:** ✅ local → EN devuelve "Can automated retail feel premium?", ES devuelve "¿Puede el retail automatizado sentirse premium?" (y ningún título EN). Validado 2026-07-30.

### ✅ 13. FAQ — VALIDADO (local)
- **Cómo:** `/faq` y `/es/faq` — heading + view-source del JSON-LD.
- **Esperado:** heading localizado; `acceptedAnswer.text` con la respuesta real.
- **Resultado:** ✅ local → h1 "Frequently Asked Questions" / "Preguntas frecuentes"; JSON-LD con respuestas reales. Pendiente: revisar el copy ES draft en `src/messages/es.json` con el cliente. Validado 2026-07-30.

### ✅ 14bis. Turnstile — VALIDADO en lo que importa para el release (2026-07-30)

- **Widget:** monta correctamente, pero **solo al primer foco** en el formulario
  (`onFocusCapture` en `Component.tsx:325`). Es deliberado: el home monta 14 drawers y
  montarlo siempre significaba 14 challenges compitiendo. **No es un bug** — si parece
  que "no está", es porque nadie tocó el formulario todavía.
- **Enforcement del servidor: ✅** sin token → `403 Bot verification failed`;
  con token inválido → `403`. Confirma que el secret key está bien configurado, que la
  verificación se exige, y que el timeout de 5s que agregamos no rompió el camino.
- **Camino feliz (token válido → 201): no verificable en local.** Cloudflare responde
  `TurnstileError 110200` = dominio no permitido; el widget no tiene `localhost` entre
  sus hostnames autorizados. Se destraba agregándolo en Hostname Management, o usando
  las claves de prueba de Cloudflare (`1x00000000000000000000AA` /
  `1x0000000000000000000000000000000AA`), que además permiten probar el rechazo.
- **⚠️ Para el release:** en **producción Turnstile está APAGADO**
  (`turnstileEnabled: null`, sin meta tag). El bloque de verificación se saltea entero,
  así que el cambio del timeout es **inerte en prod** y este release no puede romper
  ningún formulario por Turnstile.
- **⚠️ Para cuando lo enciendan en prod:** hay que verificar primero que el dominio de
  producción esté en los hostnames autorizados del widget. Si no, **todos** los
  formularios del sitio dejan de aceptar envíos (mismo 110200, mismo 403).

### ✅ 14. Formularios — VALIDADO (local, sin Turnstile)
- **Cómo:** POST a `/next/form-submissions` (form Contact) con honeypot vacío y `renderedAt` válido.
- **Esperado:** `201` y sync a Monday.
- **Resultado:** ✅ local → 201 (submission id 33), `[monday:mock] create_item — not sent` con columnas mapeadas. En local Turnstile no está habilitado en Settings, así que el camino del widget queda para validar en **preview** (enviar un formulario real desde el navegador). Validado 2026-07-30.

### ✅ 15. Autores de insights — VALIDADO (local, via script)
- **Cómo:** se asignó un autor temporalmente vía Local API y se leyó el doc.
- **Esperado:** `populatedAuthors` poblado con el hook nuevo (batch + `req`).
- **Resultado:** ✅ local → `populatedAuthors: [{"id":4,"name":"Edgar Yanez"}]`; luego revertido (la DB quedó como estaba). Validado 2026-07-30.

### ✅ 16. Paginación de insights — VALIDADO (local, con nota)
- **Cómo:** `/insights/page/2` y `/insights/page/99`.
- **Esperado:** página 2 renderiza; fuera de rango…
- **Resultado:** ✅ page/2 → 200. ⚠️ page/99 → 200 con "Showing 0 of 4 Posts": **no es regresión** — el código nunca tuvo `notFound()` para fuera-de-rango (solo para no-enteros) y antes también renderizaba on-demand. Está en el backlog del audit. Validado 2026-07-30.

---

## ⚙️ CI (verificación pasiva)

### ☐ 17. Gate de `@claude` (opcional)
- **Cómo:** comentario `@claude` desde una cuenta externa no colaboradora.
- **Esperado:** el workflow no se dispara.
- **Resultado:**

### 18. Unlock de maintenance — se valida solo en el próximo release, sin prueba ahora.

---

**Prioridad si hay poco tiempo:** 1 ✅, 3 ✅, 5 ✅, 9 ✅ (los hallazgos críticos) + 4 ✅ y 7 ✅.

---

# Anexo — Investigación: crash "Maximum update depth exceeded" en el admin

Apareció al automatizar el caso 11 y se investigó a fondo. **Conclusión: NO es un bug
que afecte a editores reales, y NO es una regresión nuestra.** Se documenta para no
volver a investigarlo desde cero.

## Síntoma
Al escribir en un campo del plugin SEO, el admin muestra la pantalla "Oops — Something
went wrong". React error #185 ("Maximum update depth exceeded" = bucle infinito de
`setState`). Es un crash de **cliente**, no un 500 del servidor, y la edición no guardada
se pierde.

## Experimentos (todos en local salvo el primero)

| # | Condición | Resultado |
|---|-----------|-----------|
| 1 | Tipeo automático rápido en SEO Title (preview) | 💥 crash |
| 2 | Igual, en `d94ef70` (commit **anterior** a todo nuestro trabajo) | 💥 crash → **pre-existente** |
| 3 | 2 caracteres ("AB") en SEO Title | ✅ ok |
| 4 | Tipeo en tandas de 7-8 chars con pausas de 2s (velocidad humana) | ✅ ok |
| 5 | **Pegar** 134 caracteres de golpe | ✅ ok |
| 6 | Tipeo rápido en el campo Title principal (sin contador SEO) | ✅ ok |
| 7 | Tipeo rápido con `autosave` a 300ms | 💥 crash |
| 8 | Tipeo rápido con **autosave desactivado** | 💥 crash → **el autosave NO es la causa** |
| 9 | Tipeo rápido en SEO **Description** | 💥 crash → afecta a ambos campos SEO |

## Conclusión
El culpable son los componentes indicadores del plugin SEO (el contador
`x/50-60 chars` y las etiquetas `Missing`/`Good`/`Too short`), que re-renderizan en cada
pulsación. Con una ráfaga de pulsaciones sin ninguna pausa —algo que solo produce la
automatización— se supera el límite de actualizaciones anidadas de React.

**Un editor humano no lo dispara**: ni escribiendo normal, ni pegando texto largo. Los
campos sin ese indicador (Title principal) nunca fallan.

**Sobre el autosave a 100ms:** la hipótesis era razonable pero quedó descartada por el
experimento 8. Aun así, `interval: 100` (heredado del template de Payload, con el comentario
"for optimal live preview") escribe una fila de versión cada 100ms mientras se escribe.
Eso vale la pena revisarlo **por costo de base de datos**, no por este crash — y es un
cambio con criterio propio, no un fix de bug.

---

# Anexo — Auditoría de metadatos (og / base) en todas las páginas

Barrido local 2026-07-30 sobre EN y ES. **Ninguno de los problemas de abajo es
regresión del PR #182** — todos existen igual en `main` (verificado con
`git show main:src/utilities/generateMeta.ts`). Son candidatos a un PR aparte.

## ✅ Lo que está bien (marca Amerikiosks, no defaults de Next)

- `og:site_name` = **"Amerikiosks"** en todas las páginas.
- `twitter:card` = `summary_large_image` en todas.
- Home, detalle de máquina, detalle de insight y detalle de proyecto: `<title>`,
  `description` y `og:image` reales, con imagen propia desde el CDN.
- Sin doble prefijo en ninguna URL (el fix del PR se confirma en todo el sitio).
- ES correcto: `lang="es"`, títulos traducidos en home y FAQ,
  y `/es/machines` → 307 → `/es/maquinas` (pathname localizado funcionando).

## ⚠️ Problemas encontrados (pre-existentes)

1. **`og:url` es siempre el origen, nunca la URL de la página.**
   `src/utilities/generateMeta.ts:44` — `Array.isArray(doc?.slug) ? join('/') : '/'`,
   pero `slug` es string, así que **siempre** cae en `'/'`. Afecta home, familias,
   modelos, insights y proyectos: compartir cualquier página en redes apunta al home.
   *Impacto alto para SEO/social, fix de una línea.*

2. **`og:title` cae al genérico "Amerikiosks" en los listados**
   (`/machines`, `/insights`, `/faq`). El `<title>` sí es correcto
   ("Model Lines — Amerikiosks", "Amerikiosks Insights", "FAQ — Amerikiosks"),
   pero esas páginas no pasan por `mergeOpenGraph`, así que al compartirlas
   el preview dice solo "Amerikiosks".

3. **`og:image` cae al logo SVG** en listados y en páginas de familia
   (`/machines/zeta`). **Las redes sociales no renderizan SVG** (Facebook, X,
   LinkedIn, WhatsApp), así que esas páginas quedan efectivamente **sin imagen de
   preview**. Las familias ya tienen `heroLineupImage` disponible para usar.

4. **Sin `canonical` salvo en `/machines`**, y **sin `hreflang`/`alternates` en
   todo el sitio** pese a ser bilingüe. Ya estaba en el backlog del audit.

5. **`/insights/end-to-end-operation` tiene `<title>Amerikiosks</title>`** —
   el campo SEO `meta.title` está vacío en ese documento. *Gap de contenido, no de
   código: revisar qué insights/proyectos tienen SEO sin llenar.*

6. **`/es/maquinas` conserva el título en inglés** ("Model Lines — Amerikiosks"):
   la metadata del listado de máquinas está hardcodeada en inglés.

7. **`/projects` da 404** — solo existe `/projects/[slug]`, no hay listado.
   Puede ser intencional; confirmar si se espera una página índice de proyectos.
