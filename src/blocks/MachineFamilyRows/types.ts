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
  /**
   * True when the image came from `rowImage` — a render cropped tight to the
   * machine. Only then does the machine lean out over the top of its card: the
   * `thumbnail` fallback is a square canvas with the machine at 29-53% of its
   * width, so it never reaches the edge and a lean-out would be invisible
   * anyway. Per family, so the block ships before the artwork does.
   */
  leansOut: boolean
  ctaLabel: string | null
  /** Counted from the machines collection, never authored. 0 drives the soon state. */
  modelCount: number
}
