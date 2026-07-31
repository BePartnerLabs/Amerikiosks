/**
 * Serialisable view models for the /machines landing. The page is a Server
 * Component that reads Payload through the Local API; everything below the
 * lineup is interactive (picking a family swaps the scene, the features and
 * the models), so the documents have to cross the server/client boundary as
 * plain data — never as Payload docs with their relations still attached.
 */

export type MachineView = {
  id: string
  name: string
  slug: string
  tagline: string | null
  imageUrl: string | null
  hoverImageUrl: string | null
  /** Up to three `specs` rows, already flattened for the card. */
  specs: { label: string; value: string }[]
  /** Parsed from `dimensions.height`, in inches. Drives the to-scale lineup. */
  heightIn: number | null
}

export type FamilyView = {
  id: string
  name: string
  slug: string
  tagline: string | null
  /** `highlights.heading` — the short editorial line the page leads with. */
  headline: string | null
  description: string | null
  ctaLabel: string | null
  /** Front render — `thumbnail` on the family. */
  thumbUrl: string | null
  /** Three-quarter render — `hoverThumbnail`. Crossfades with the front one. */
  hoverUrl: string | null
  heroUrl: string | null
  highlights: { title: string; description: string | null; imageUrl: string | null }[]
  machines: MachineView[]
  /** Tallest machine in the line, in inches. Null when nothing is loaded yet. */
  heightIn: number | null
  /** Widest machine in the line, in inches. */
  widthIn: number | null
}
