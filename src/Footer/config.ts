import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  admin: {
    description: 'Site-wide footer: nav columns, contact info, and CTA.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'brandDescription',
      type: 'textarea',
      label: 'Brand description',
      localized: true,
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
          localized: true,
        },
        {
          name: 'hidden',
          type: 'checkbox',
          defaultValue: false,
          label: 'Hidden',
          admin: {
            description:
              'Temporarily remove this whole column from the footer without deleting it.',
          },
        },
        {
          name: 'links',
          type: 'array',
          fields: [
            link({ appearances: false }),
            {
              name: 'hidden',
              type: 'checkbox',
              defaultValue: false,
              label: 'Hidden',
              admin: {
                description: 'Temporarily remove this link from the footer without deleting it.',
              },
            },
          ],
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
      localized: true,
      admin: { description: 'e.g. "Start a partnership"' },
    },
    {
      // Localized too: per-locale slugs differ (see i18n/routing.ts), so the
      // Spanish CTA often needs to point at a different path than English.
      name: 'contactCtaUrl',
      type: 'text',
      label: 'Contact CTA URL',
      localized: true,
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
