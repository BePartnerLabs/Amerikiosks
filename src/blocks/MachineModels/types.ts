import type { MachineFamily } from '@/payload-types'

/**
 * Serialisable view model for one model card. `familySlug` travels with each
 * card because the block shows every family at once: the URL is built per card,
 * not from an ambient selection.
 */
export type ModelCard = {
  id: string
  name: string
  slug: string
  familyName: string | null
  familySlug: string | null
  /** La clase de venta de la familia — de acá sale el color de la tarjeta. */
  salesClass: MachineFamily['salesClass'] | null
  colorStep: number | null
  imageUrl: string | null
  specs: { label: string; value: string }[]
}
