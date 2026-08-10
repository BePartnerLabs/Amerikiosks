import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'es'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  // Bare paths (no /es prefix) must always resolve to 'en', regardless of the
  // NEXT_LOCALE cookie or Accept-Language — per-locale slugs differ (e.g.
  // travel-and-transit vs viajes-y-transito), so cookie-based locale detection
  // can redirect an EN bare path to /es/<EN-slug>, which 404s.
  localeDetection: false,
  pathnames: {
    // `/machines` NO va aquí, y quitarlo fue obligatorio, no una limpieza: el
    // listado dejó de ser una ruta de código y pasó a ser un documento de
    // `pages` con slug `machines` en EN y `maquinas` en ES. Si la entrada
    // siguiera, next-intl reescribiría `/maquinas` -> `/machines` antes de que
    // el catch-all `/[slug]` lo viera, así que una petición en español buscaría
    // el slug `machines` y el documento en español no resolvería nunca. El
    // síntoma no es un error de build: es un 404 solo en español.
    //
    // Los hijos sí siguen aquí porque siguen siendo rutas de código, y Next
    // matchea archivos antes que el catch-all. La contrapartida es que la
    // jerarquía queda gobernada por dos mecanismos: el slug del documento para
    // el padre y este mapa (más `machinesSegment` en `utilities/localeUrl.ts`)
    // para los hijos. Cambiar el segmento en español exige tocar los dos, o el
    // padre queda en `/maquinas` y los hijos en otro sitio.
    '/machines/[family]': { en: '/machines/[family]', es: '/maquinas/[family]' },
    '/machines/[family]/[slug]': {
      en: '/machines/[family]/[slug]',
      es: '/maquinas/[family]/[slug]',
    },
  },
})
