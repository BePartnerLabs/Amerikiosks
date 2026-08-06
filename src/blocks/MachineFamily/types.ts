/**
 * Serialisable view model for one family section. The tiles are interactive
 * (reveal on scroll, pointer glow), so the family has to cross the
 * server/client boundary as plain data rather than as a Payload doc with its
 * relations still attached.
 */
export type FamilySection = {
  name: string
  slug: string
  headline: string | null
  description: string | null
  ctaLabel: string | null
  frontUrl: string | null
  turnUrl: string | null
  highlights: { title: string; description: string | null; imageUrl: string | null }[]
  /** Machine renders, used to fill tiles whose highlight carries no image. */
  machineShots: string[]
  modelCount: number
}
