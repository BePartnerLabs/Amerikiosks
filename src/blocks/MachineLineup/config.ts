import type { Block } from 'payload'

export const MachineLineup: Block = {
  slug: 'machineLineup',
  interfaceName: 'MachineLineupBlock',
  imageURL: '/block-previews/machine-lineup.png',
  imageAltText: 'Machine Lineup block — pinned dark scene walking every family',
  labels: {
    singular: { en: 'Machine Lineup', es: 'Recorrido de Máquinas' },
    plural: { en: 'Machine Lineup', es: 'Recorrido de Máquinas' },
  },
  fields: [
    {
      name: 'intro',
      type: 'text',
      localized: true,
      admin: {
        description:
          'Optional line shown before the first family, while the scene enters. Leave empty to start straight on the first family.',
      },
    },
  ],
}
