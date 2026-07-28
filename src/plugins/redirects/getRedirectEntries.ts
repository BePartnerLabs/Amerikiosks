import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { normalizePath } from './normalizePath'
import type { RedirectEntry } from './types'

const collectionPrefix = (relationTo?: string | null) =>
  relationTo && relationTo !== 'pages' ? `/${relationTo}` : ''

/**
 * Slugs of published pages, in every locale. A redirect whose `from` matches a
 * live page would make that page unreachable — and since `from` used to be
 * compared verbatim, the table accumulated rows that never fired and were
 * never noticed (e.g. `contact`, with no leading slash, pointing at `home`).
 * Normalizing them woke them up, so they're filtered here instead.
 */
const getLivePagePaths = async (): Promise<Set<string>> => {
  const payload = await getPayload({ config: configPromise })
  const paths = new Set<string>()

  for (const locale of ['en', 'es'] as const) {
    const { docs } = await payload.find({
      collection: 'pages',
      depth: 0,
      limit: 0,
      pagination: false,
      locale,
      select: { slug: true },
      where: { _status: { equals: 'published' } },
    })

    for (const doc of docs) {
      if (doc.slug) paths.add(normalizePath(`/${doc.slug}`).path)
    }
  }

  return paths
}

/**
 * Reads the `redirects` collection and flattens it into plain lookup entries:
 * `from` normalized, `to` fully resolved (reference targets turned into their
 * slug), status code attached.
 *
 * Rows that can't produce a destination are dropped rather than shipped as a
 * redirect to `/undefined`.
 */
export type RedirectDoc = {
  id: number | string
  from?: string | null
  type?: string | null
  to?: {
    url?: string | null
    reference?: { relationTo?: string | null; value?: unknown } | null
  } | null
}

/**
 * Flattens redirect documents into lookup entries: `from` normalized, `to`
 * fully resolved (a reference turned into its slug), status code attached.
 *
 * Pure so the filtering rules are testable without a database. Rows that can't
 * produce a destination, that point at themselves, or that would shadow a
 * published page are dropped — `onSkip` reports why.
 */
export const buildRedirectEntries = (
  docs: RedirectDoc[],
  livePaths: Set<string>,
  onSkip: (reason: string) => void = () => {},
): RedirectEntry[] => {
  const entries: RedirectEntry[] = []

  for (const doc of docs) {
    if (!doc.from) continue

    const reference = doc.to?.reference
    let to: string | undefined

    if (doc.to?.url) {
      to = doc.to.url
    } else if (reference && typeof reference.value === 'object' && reference.value) {
      const slug = (reference.value as { slug?: string | null }).slug
      if (slug) to = `${collectionPrefix(reference.relationTo)}/${slug}`
    }

    if (!to) {
      onSkip(`Redirect ${doc.id}: no destination — ignored.`)
      continue
    }

    const { path } = normalizePath(doc.from)

    if (livePaths.has(path)) {
      onSkip(
        `Redirect ${doc.id}: "${path}" is a published page — ignoring the redirect so the page stays reachable.`,
      )
      continue
    }

    if (path === normalizePath(to).path) {
      onSkip(`Redirect ${doc.id}: "${path}" points at itself — ignored.`)
      continue
    }

    entries.push({ from: path, to, status: doc.type === '302' ? 302 : 301 })
  }

  return entries
}

export const getRedirectEntries = async (): Promise<RedirectEntry[]> => {
  const payload = await getPayload({ config: configPromise })

  const [{ docs }, livePaths] = await Promise.all([
    payload.find({
      collection: 'redirects',
      depth: 1,
      limit: 0,
      pagination: false,
    }),
    getLivePagePaths(),
  ])

  return buildRedirectEntries(docs as RedirectDoc[], livePaths, (reason) =>
    payload.logger.warn(reason),
  )
}

/**
 * Tagged `redirects`, which the collection's afterChange hook already
 * revalidates — so an editor's change lands without a deploy.
 */
export const getCachedRedirectEntries = unstable_cache(getRedirectEntries, ['redirect-entries'], {
  tags: ['redirects'],
})
