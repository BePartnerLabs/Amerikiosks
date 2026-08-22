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
  /**
   * The family's positioning line. The scene leads with the family itself now —
   * name as the heading, tagline as the body — because the rows below it lead
   * with the featured characteristic, and both blocks showing the same two
   * strings one under the other said the same thing twice.
   *
   * The two registers are not interchangeable: a tagline is a ~20-word
   * positioning paragraph, a characteristic is a hard fact with a number in it.
   * A full-bleed scene wants the first; a compact row wants the second.
   */
  tagline: string | null
}
