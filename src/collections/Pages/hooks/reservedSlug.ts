import type { CollectionBeforeValidateHook } from 'payload'

// Top-level segments under src/app/(frontend)/[locale]/ that are fixed
// Next.js routes, not editable Pages — a Page with one of these slugs
// would silently collide with the fixed route.
//
// `machines` salió de la lista cuando el listado dejó de ser ruta de código y
// pasó a ser una Page: ya no hay con qué colisionar, y mantenerlo reservado
// impedía exactamente la migración que se buscaba. Sus hijos —
// `/machines/[family]` y `/machines/[family]/[slug]` — siguen siendo rutas de
// código, pero eso no se defiende desde aquí: son segundos segmentos y esta
// lista solo mira el slug de primer nivel.
//
// Si alguna de las otras vuelve a ser una Page, hay que sacarla de aquí en el
// mismo cambio que borra su `page.tsx`. Al revés — borrar la ruta y dejar la
// reserva — el editor se topa con un error que no explica nada.
const RESERVED_SLUGS = ['insights', 'faq', 'customer-service', 'projects', 'search']

export const reservedSlug: CollectionBeforeValidateHook = ({ data }) => {
  const slug = data?.slug

  if (typeof slug === 'string' && RESERVED_SLUGS.includes(slug)) {
    throw new Error(
      `The slug "${slug}" is reserved for a fixed site route and can't be used for a Page. Choose a different slug.`,
    )
  }

  return data
}
