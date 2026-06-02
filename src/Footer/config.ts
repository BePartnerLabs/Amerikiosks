import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'brandDescription',
      type: 'textarea',
      label: 'Brand description',
      admin: { description: 'Short tagline shown below the logo.' },
    },
    {
      name: 'columns',
      type: 'array',
      label: 'Nav columns',
      maxRows: 4,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Column heading',
        },
        {
          name: 'links',
          type: 'array',
          fields: [link({ appearances: false })],
          maxRows: 8,
          admin: {
            components: {
              RowLabel: '@/Footer/RowLabel#RowLabel',
            },
          },
        },
      ],
    },
    {
      name: 'contactEmail',
      type: 'email',
      label: 'Contact email',
    },
    {
      name: 'contactCta',
      type: 'text',
      label: 'Contact CTA text',
      admin: { description: 'e.g. "Start a partnership"' },
    },
    {
      name: 'contactCtaUrl',
      type: 'text',
      label: 'Contact CTA URL',
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
