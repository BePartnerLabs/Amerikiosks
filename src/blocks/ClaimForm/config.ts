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
    plural: 'Claim Form Blocks',
    singular: 'Claim Form Block',
  },
}
