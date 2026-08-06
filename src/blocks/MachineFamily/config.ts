import type { Block } from 'payload'

export const MachineFamily: Block = {
  slug: 'machineFamily',
  interfaceName: 'MachineFamilyBlock',
  imageURL: '/block-previews/machine-family.png',
  imageAltText: 'Machine Family block — one family with its characteristics',
  labels: {
    singular: { en: 'Machine Family', es: 'Familia de Máquinas' },
    plural: { en: 'Machine Families', es: 'Familias de Máquinas' },
  },
  fields: [
    {
      name: 'family',
      type: 'relationship',
      relationTo: 'machine-families',
      required: true,
      admin: {
        description:
          'Which family this section shows. Name, description, characteristics and the link all come from that document — add one block per family.',
      },
    },
    {
      name: 'tileEyebrow',
      type: 'text',
      localized: true,
      defaultValue: 'Feature',
      admin: { description: 'Small label above each characteristic tile.' },
    },
    {
      name: 'leadEyebrow',
      type: 'text',
      localized: true,
      defaultValue: 'Main highlight',
      admin: { description: 'Label for the large first tile.' },
    },
    {
      name: 'showModelCount',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description:
          'Shows how many models the line has. The number is counted from the machines collection, never typed, so it cannot fall out of sync.',
      },
    },
    {
      name: 'countEyebrow',
      type: 'text',
      localized: true,
      defaultValue: 'Models in line',
      admin: { condition: (_, siblingData) => Boolean(siblingData?.showModelCount) },
    },
  ],
}
