import type { FeaturedHighlight } from '@/utilities/featuredHighlight'

/**
 * Serialisable view model for one family row. Kept flat so the component never
 * receives a Payload doc with its relations still attached.
 */
export type FamilyRow = {
  id: string
  name: string
  slug: string
  /** The `featured` characteristic, or the first one. Null when the family has none. */
  featured: FeaturedHighlight | null
  imageUrl: string | null
  ctaLabel: string | null
  /** Counted from the machines collection, never authored. 0 drives the soon state. */
  modelCount: number
}
