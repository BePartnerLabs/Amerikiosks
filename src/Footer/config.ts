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
      // The contact column's heading used to be the string "Contact" hardcoded
      // in FooterContent, so it stayed English in /es while the three nav
      // columns beside it translated — and no editor could reach it. Editable
      // like the others, but optional: left empty it falls back to the
      // translated `footer.contact`, which is already correct per locale.
      name: 'contactHeading',
      type: 'text',
      label: 'Contact column heading',
      localized: true,
      admin: { description: 'Leave empty to use the default ("Contact" / "Contacto").' },
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
      name: 'contactCtaType',
      type: 'select',
      label: 'Contact CTA behaviour',
      defaultValue: 'link',
      options: [
        { label: 'Go to a URL', value: 'link' },
        { label: 'Open a modal form', value: 'modal' },
      ],
      admin: { condition: (_, siblingData) => Boolean(siblingData?.contactCta) },
    },
    {
      // Localized too: per-locale slugs differ (see i18n/routing.ts), so the
      // Spanish CTA often needs to point at a different path than English.
      name: 'contactCtaUrl',
      type: 'text',
      label: 'Contact CTA URL',
      localized: true,
      admin: { condition: (_, siblingData) => siblingData?.contactCtaType !== 'modal' },
    },
    {
      name: 'contactCtaForm',
      type: 'relationship',
      relationTo: 'forms',
      label: 'Contact CTA form',
      admin: {
        condition: (_, siblingData) => siblingData?.contactCtaType === 'modal',
        description: 'Opens this form in a modal drawer instead of navigating.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
