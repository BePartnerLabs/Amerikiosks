import type { MachineFamily } from '@/payload-types'

export type FeaturedHighlight = { title: string; description: string | null }

/**
 * The characteristic a family leads with.
 *
 * `featured` is the editor's explicit pick. Falling back to the first item
 * matters: without it, a family nobody remembered to flag would drop out of
 * whatever is showing one characteristic each rather than merely show a less
 * apt line.
 *
 * Shared because two blocks on `/machines` make the same choice and have to
 * make it identically — the pinned lineup and the family rows.
 */
export const featuredHighlight = (family: MachineFamily): FeaturedHighlight | null => {
  const items = (family.highlights?.items ?? []).filter((item) => item.title)
  if (!items.length) return null

  const picked = items.find((item) => 'featured' in item && item.featured) ?? items[0]

  return {
    title: picked.title as string,
    description: picked.description ?? null,
  }
}
