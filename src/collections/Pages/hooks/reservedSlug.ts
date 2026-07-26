import type { CollectionBeforeValidateHook } from 'payload'

// Top-level segments under src/app/(frontend)/[locale]/ that are fixed
// Next.js routes, not editable Pages — a Page with one of these slugs
// would silently collide with the fixed route.
const RESERVED_SLUGS = ['machines', 'insights', 'faq', 'customer-service', 'projects', 'search']

export const reservedSlug: CollectionBeforeValidateHook = ({ data }) => {
  const slug = data?.slug

  if (typeof slug === 'string' && RESERVED_SLUGS.includes(slug)) {
    throw new Error(
      `The slug "${slug}" is reserved for a fixed site route and can't be used for a Page. Choose a different slug.`,
    )
  }

  return data
}
