import type { Block } from 'payload'

/**
 * Every family, one compact row each.
 *
 * Replaces the five `machineFamily` sections this page used to stack. It takes
 * no family reference: it always shows all of them, in the same order the
 * pinned lineup above walks through. An editor choosing a subset here would be
 * navigation pretending to be content — the mistake the family selector made
 * before `machineFamily` removed it.
 *
 * Everything a row shows — name, tagline, thumbnail, model count — comes from
 * the `machine-families` collection. The only content here is the section
 * header and the labels.
 */
export const MachineFamilyRows: Block = {
  slug: 'machineFamilyRows',
  interfaceName: 'MachineFamilyRowsBlock',
  labels: {
    singular: { en: 'Machine Family Rows', es: 'Familias en Filas' },
    plural: { en: 'Machine Family Rows', es: 'Familias en Filas' },
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      admin: { description: 'Small label above the heading.' },
    },
    {
      name: 'heading',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'intro',
      type: 'textarea',
      localized: true,
      admin: { description: 'One or two lines under the heading. Optional.' },
    },
    {
      name: 'countEyebrow',
      type: 'text',
      localized: true,
      defaultValue: 'models in line',
      admin: {
        description:
          'Follows the model count on each row. The number itself is counted from the machines collection, never typed, so it cannot fall out of sync.',
      },
    },
    {
      name: 'ctaLabel',
      type: 'text',
      localized: true,
      defaultValue: 'View the line',
      admin: {
        description: "Used when the family has no label of its own. A family's own CTA label wins.",
      },
    },
    {
      name: 'soonLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Coming soon',
      admin: {
        description:
          'Shown instead of the model count when a family has no published models yet. It goes away on its own the day the first one is published.',
      },
    },
    {
      name: 'soonCtaLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Explore the line',
      admin: {
        description:
          'The link for a family with no published models. Its page still has a hero and its characteristics, so it stays a link — it just cannot promise models.',
      },
    },
  ],
}
