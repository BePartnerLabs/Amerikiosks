/**
 * Serialisable view model for the lineup scene. The block is a Server Component
 * that reads Payload through the Local API, but the scene itself is scroll-driven
 * and therefore a client component — the families have to cross the boundary as
 * plain data, never as Payload docs with their relations still attached.
 */
export type LineupFamily = {
  id: string
  name: string
  slug: string
  /** `thumbnail` — front view of one representative machine. */
  frontUrl: string | null
  /** `hoverThumbnail` — three-quarter view; the scroll crossfades into it. */
  turnUrl: string | null
  /** The `featured` highlight, or the first one when none is flagged. */
  featured: { title: string; description: string | null } | null
}
