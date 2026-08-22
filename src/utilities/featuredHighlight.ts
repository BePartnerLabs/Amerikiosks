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
 * One consumer today: the family rows. The pinned lineup used to make the same
 * choice and now leads with the family's own tagline instead, so that the two
 * blocks stacked on `/machines` stopped showing the same two strings. Kept as a
 * utility rather than folded back inline because the fallback is the part worth
 * naming: without it a family nobody flagged drops out of whatever is showing
 * one characteristic each.
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
