import type { MachineFamily } from '@/payload-types'

/** One card on the track. Nothing but what the index needs. */
export type CarouselFamily = {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  /* En este carrusel el color va SOLO en el chip: seis tarjetas seguidas con
     seis nombres de colores distintos se leen como ensalada. */
  salesClass: MachineFamily['salesClass']
  colorStep: number | null
}
