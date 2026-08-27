import type { Block } from 'payload'

/**
 * Every family, one card each, on a track that wraps around.
 *
 * Deliberately thin. This block is the index of the page — a visitor sees the
 * five machines and their names and picks one. The substance of each family
 * lives in `machineFamilyRows` below it: characteristic, model count, link.
 * Two blocks on the same axis is only defensible while they stay at different
 * depths, so if a field ever shows up here that belongs to a family rather than
 * to the index, it belongs in the rows instead.
 *
 * Replaces `machineLineup`, the pinned scroll scene it succeeded.
 */
export const MachineFamilyCarousel: Block = {
  slug: 'machineFamilyCarousel',
  interfaceName: 'MachineFamilyCarouselBlock',
  labels: {
    singular: { en: 'Machine Family Carousel', es: 'Carrusel de Familias' },
    plural: { en: 'Machine Family Carousels', es: 'Carruseles de Familias' },
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      admin: { description: 'Small label above the heading. Optional.' },
    },
    {
      name: 'heading',
      type: 'text',
      localized: true,
      required: true,
      admin: {
        description:
          'The section title. It also names the track for screen readers, so it should read as what the track contains.',
      },
    },
    {
      name: 'intro',
      type: 'textarea',
      localized: true,
      admin: { description: 'One or two lines under the heading. Optional.' },
    },
  ],
}
