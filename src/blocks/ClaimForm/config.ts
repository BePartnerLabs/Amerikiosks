import type { Block } from 'payload'

export const ClaimForm: Block = {
  slug: 'claimForm',
  interfaceName: 'ClaimFormBlock',
  fields: [
    {
      name: 'submitButtonLabel',
      type: 'text',
      defaultValue: 'Submit claim',
    },
  ],
  graphQL: {
    singularName: 'ClaimFormBlock',
  },
  labels: {
    plural: { en: 'Claim Form Blocks', es: 'Bloques de Formulario de Reclamo' },
    singular: { en: 'Claim Form Block', es: 'Bloque de Formulario de Reclamo' },
  },
}
