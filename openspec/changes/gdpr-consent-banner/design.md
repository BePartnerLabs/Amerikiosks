# GDPR Consent Banner — Design

> Banner de consentimiento de cookies que gatea la carga de GA4 hasta que el usuario decide. Primera pieza de la iniciativa GDPR compliance (ver `docs/ROADMAP.md` → "GDPR / Privacy Compliance"). Privacy/Cookie Policy pages y checkbox de opt-in en forms quedan fuera de este change, como specs separados.

---

## Contexto

El sitio no tiene ningún mecanismo de consentimiento hoy. GA4 (`gtag.js`) carga incondicional en `src/app/(frontend)/[locale]/layout.tsx` en cuanto existe `settings.googleAnalyticsId` — sin gate de ningún tipo. Esto viola GDPR Art. 6/7 (no hay base legal de consentimiento para analytics no esenciales).

Decisión ya tomada (fuera de este change): no hace falta una colección server-side de Payload logueando cada consentimiento — el registro client-side (cookie con timestamp + categorías) alcanza como evidencia demostrable bajo GDPR Art. 7.1, dado que no se procesan datos de categoría especial.

## Categorías de cookies

Dos categorías, sin over-engineering para categorías que no existen hoy:

- **Necesarias** — siempre activas, sin toggle. Cubre cookies de funcionamiento del sitio (idioma, sesión de admin, preview/draft mode). Se describen de forma genérica en el copy, sin listar nombres técnicos uno por uno (evita desincronización si cambian internamente).
- **Analytics** — GA4. Toggle on/off, default off hasta que el usuario decide.

No hay categoría de marketing/ads — no existen esos trackers en el sitio hoy. Se agrega si algún día se necesita.

## Arquitectura y flujo de datos

```
src/
├── utilities/
│   └── consent.ts                 # Nombre de cookie, tipos, parseo/serialización, defaults
├── components/
│   └── ConsentBanner/
│       ├── ConsentBanner.tsx      # Client component — barra fija inferior + panel de preferencias
│       ├── ConsentPreferencesButton.tsx  # Client component — botón flotante para reabrir
│       └── styles.css             # Level 2 overrides sobre primitivos del DS
└── app/(frontend)/[locale]/layout.tsx   # Server Component — lee cookie, gatea <Script> de GA4
```

**Cookie:** `ak_consent`, JSON `{ analytics: boolean, timestamp: string }`. Ausente = sin decidir todavía.

**Flujo:**

1. `layout.tsx` (ya es `async`) lee la cookie con `cookies()` de `next/headers`.
2. Si la cookie no existe → `hasConsentDecision = false` → se renderiza `ConsentBanner` (visible) y NO se renderiza `ConsentPreferencesButton`.
3. Si la cookie existe → `hasConsentDecision = true` → `ConsentBanner` no se muestra, `ConsentPreferencesButton` sí (para poder reabrir y cambiar de opinión).
4. Los `<Script>` de GA4 en el `<head>` solo se renderizan si `gaId` existe **y** `consent.analytics === true`. Sin flash: la decisión se toma server-side antes de enviar el HTML.
5. Al hacer clic en Aceptar todo / Rechazar / Guardar preferencias: el cliente escribe `ak_consent` vía `document.cookie` y llama `router.refresh()` (App Router) — el Server Component se vuelve a ejecutar con la cookie nueva, inyectando o removiendo el script de GA4 sin full page reload.

**Botón flotante (`ConsentPreferencesButton`):** posición fija (ej. esquina inferior), reabre `ConsentBanner` en modo "preferencias" (panel expandido con el toggle de Analytics visible directamente, no colapsado).

## UI

Validado con un mockup interactivo (bottom-right card + bottom-left reopen button, ambos estados, tooltips) antes de implementar. Diseño final:

- **Card flotante, no barra full-width.** Fixed, esquina inferior derecha (`bottom`/`right`), ancho acotado (~23rem, `max-width: calc(100vw - 2rem)` en mobile). No bloqueante — no impide navegar ni interactuar con el resto del sitio mientras está visible.
- **Botón "reabrir preferencias":** esquina inferior izquierda (opuesta al card, para que nunca se superpongan). Al clickearlo, el panel de preferencias reaparece siempre en la misma posición de siempre (abajo-derecha) — el botón es solo el disparador, no indica dónde aparece el contenido.
- **Estado colapsado**, orden de acciones: **Rechazar** (texto plano, sin fill ni flecha de acento — bajo peso visual intencional, no debe "invitar" al click igual que el CTA principal) → **Preferencias** (botón ícono — tools/settings — con `aria-label`, no texto) → **Aceptar todo** (`.bp-btn` sólido, la única acción con peso visual fuerte).
- **Estado expandido** (click en el ícono de preferencias, o al reabrir desde el botón flotante): fila **Necesarias** (toggle siempre on, disabled) + ícono de info con tooltip explicando la categoría; fila **Analytics** (toggle on/off) + ícono de info con tooltip; botón **Guardar preferencias** (`.bp-btn`, persiste el valor real del toggle en ese momento — no fuerza "aceptar todo").
- **Tooltips de categoría** (tools/info icon, uno por fila):
  - Disparo por hover **con delay de 300ms** (evita que un roce accidental del cursor lo dispare) y por foco/tap **sin delay** (un usuario de teclado o touch ya se comprometió con el trigger).
  - Auto-posicionamiento: si el placement default (centrado, arriba del trigger) se saldría del viewport, se recalcula a la izquierda, derecha, o abajo del trigger — medido en runtime contra `window.innerWidth`/viewport, no fijo.
  - Flecha apuntando al trigger, reposicionada según el placement activo.
  - Cierre explícito en todos los casos: mouse-leave, foco perdido, tecla Escape, y tap afuera en touch (no alcanza con `:hover`/`:focus-within` solos para el caso Escape/tap-afuera).
  - Copy de una sola oración, ancho tope ~300px — no es lugar para un párrafo.
- **Link a Cookie Policy** dentro del texto descriptivo (ambos estados), apuntando a `/cookie-policy` (ruta que aún no existe hasta que se implemente ese spec separado — no bloquea este change). Usa `next/link` plano, mismo patrón que `Footer/FooterContent.tsx`, no el `Link` locale-aware de `@/i18n/routing` (no hay pathname especial que mapear para esta ruta).
- Markup construido con primitivos del BPL DS (`Button`, `Toggle`, `Tooltip`) copiados verbatim de `ds.bepartnerlabs.com/components/`, con overrides Level 2 (`--consent-banner-*`) solo donde el default no alcance. El DS expone `.bp-tooltip-wrap`/`.bp-tooltip` CSS-only (hover + `:focus-within`, sin JS) — se extiende con JS propio solo para el auto-placement, el delay diferenciado hover/foco, y el cierre por Escape/tap-afuera, que el componente DS no cubre out of the box.
- **Copy del banner no es editable desde `/admin`** — vive en `messages/en.json`/`es.json` (next-intl), no en un Payload global. Es texto legal/compliance, no contenido de marketing; mantenerlo en código evita que un editor lo rompa sin querer sin sumar alcance a este change (decisión confirmada explícitamente, no default por omisión).

## Copy / i18n

Textos en `messages/en.json` / `messages/es.json` (next-intl), no hardcodeados: título, descripción, labels de categorías, botones (Aceptar todo, Rechazar, Preferencias, Guardar preferencias), tooltip del botón flotante, más las claves agregadas por el rediseño: `cookiePolicyLabel` (texto del link), `necessaryDescription`/`analyticsDescription` (copy de los tooltips de categoría, una oración cada uno), `necessaryInfoLabel`/`analyticsInfoLabel` (aria-label de cada ícono de info, distinto por categoría para que un lector de pantalla sepa cuál es cuál).

## Testing

- **Vitest (`test:int`):** `src/utilities/consent.ts` — parseo/serialización de la cookie, manejo de valores corruptos o inesperados (tratar como "sin decisión" → mostrar banner), defaults.
- **Playwright (`test:e2e`):**
  - Sin cookie → banner visible, botón flotante ausente.
  - Aceptar todo → cookie escrita con `analytics: true`, GA4 `<script>` presente en el DOM tras el refresh, banner oculto, botón flotante visible.
  - Rechazar → cookie con `analytics: false`, GA4 ausente del DOM.
  - Reabrir desde botón flotante → cambiar de Analytics off a on → GA4 aparece tras guardar.

## Privacy Policy y Cookie Policy (agregado al alcance)

Decisión revertida durante la ejecución: originalmente estas páginas quedaban para un spec separado, pero se sumaron a esta misma rama. Implementación:

- Dos `Page` seedeadas (colección `pages` existente, sin colección nueva) vía `upsertPage`, con un bloque `Content` (rich text) por locale — mismo patrón que el resto de páginas del seed (ver `src/endpoints/seed/pages/solutions.ts` como referencia).
- `src/endpoints/seed/pages/privacy-policy.ts` (slug `privacy-policy` / `politica-de-privacidad`) — copy adaptado del Privacy Policy real de amerikiosks.com (WordPress), extendido con la sección de cookies/categorías que introduce este change.
- `src/endpoints/seed/pages/cookie-policy.ts` (slug `cookie-policy` en ambos locales, deliberadamente sin traducir — ver nota abajo) — el WordPress actual no tiene esta página (404), así que el copy es nuevo, escrito específicamente contra lo que este sitio hace hoy (solo GA4, gateado por el banner).
- **Ambas páginas llevan un disclaimer explícito en la intro:** son un borrador de trabajo, no reemplazan revisión por asesoría legal calificada. No tratar como contenido legal final.
- **Limitación conocida:** el link del banner a Cookie Policy usa `next/link` plano con `href="/cookie-policy"` (no locale-aware) — por diseño de `src/i18n/routing.ts`, un path sin prefijo siempre resuelve a locale `en`, así que un visitante en `/es/...` que clickea el link ve la versión en inglés. No se resuelve en este change (requeriría el `Link` locale-aware de `@/i18n/routing`, fuera de alcance de la corrección puntual).

## Qué NO incluye este change

- Checkbox de opt-in en formularios de lead-gen (spec separado).
- Colección server-side de logs de consentimiento (decisión ya tomada: no aplica para este caso).
- Categorías de marketing/ads (no existen trackers de ese tipo hoy).
- Listado explícito de cookies necesarias por nombre (descripción genérica alcanza).
