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

- Barra fija inferior, no bloqueante — no impide navegar ni interactuar con el resto del sitio mientras está visible.
- Estado colapsado: texto breve + botones **Aceptar todo** / **Rechazar** / **Preferencias**.
- Estado expandido (al click en "Preferencias" o al reabrir desde el botón flotante): toggle **Necesarias** (siempre on, disabled) + toggle **Analytics** + botón **Guardar preferencias**.
- Link a la futura página de Cookie Policy en el copy (el link puede apuntar a una ruta que aún no existe hasta que se implemente ese spec — no bloquea este change, pero dejar el string de traducción listo).
- Markup construido con primitivos del BPL DS (`Button`, `Switch`/toggle, posible `Card`) copiados verbatim de `ds.bepartnerlabs.com/components/`, con overrides Level 2 (`--consent-banner-*`) solo donde el default no alcance. Revisar el DS antes de armar el markup a mano — no reinventar un toggle si el DS ya tiene uno.

## Copy / i18n

Textos en `messages/en.json` / `messages/es.json` (next-intl), no hardcodeados: título, descripción, labels de categorías, botones (Aceptar todo, Rechazar, Preferencias, Guardar preferencias), tooltip del botón flotante.

## Testing

- **Vitest (`test:int`):** `src/utilities/consent.ts` — parseo/serialización de la cookie, manejo de valores corruptos o inesperados (tratar como "sin decisión" → mostrar banner), defaults.
- **Playwright (`test:e2e`):**
  - Sin cookie → banner visible, botón flotante ausente.
  - Aceptar todo → cookie escrita con `analytics: true`, GA4 `<script>` presente en el DOM tras el refresh, banner oculto, botón flotante visible.
  - Rechazar → cookie con `analytics: false`, GA4 ausente del DOM.
  - Reabrir desde botón flotante → cambiar de Analytics off a on → GA4 aparece tras guardar.

## Qué NO incluye este change

- Privacy Policy y Cookie Policy pages en Payload (spec separado).
- Checkbox de opt-in en formularios de lead-gen (spec separado).
- Colección server-side de logs de consentimiento (decisión ya tomada: no aplica para este caso).
- Categorías de marketing/ads (no existen trackers de ese tipo hoy).
- Listado explícito de cookies necesarias por nombre (descripción genérica alcanza).
