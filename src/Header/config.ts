import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  admin: {
    description: 'Site-wide header: navigation, mega menus, and the CTA button.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
        {
          name: 'hidden',
          type: 'checkbox',
          defaultValue: false,
          label: 'Hidden',
          admin: {
            description: 'Temporarily remove this item from the nav without deleting it.',
          },
        },
        {
          name: 'hasMegaMenu',
          type: 'checkbox',
          defaultValue: false,
          label: 'Enable mega menu',
        },
        {
          name: 'megaMenu',
          type: 'group',
          label: 'Mega menu',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.hasMegaMenu),
          },
          fields: [
            {
              name: 'panelLabel',
              type: 'text',
              label: 'Left panel label (e.g. SOLUTIONS)',
              required: true,
              localized: true,
            },
            {
              name: 'panelHeadline',
              type: 'text',
              label: 'Left panel headline',
              required: true,
              localized: true,
            },
            {
              name: 'panelDescription',
              type: 'textarea',
              label: 'Left panel description',
              localized: true,
            },
            {
              name: 'rightTitle',
              type: 'text',
              label: 'Right panel title',
              required: true,
              localized: true,
            },
            {
              name: 'rightSubtitle',
              type: 'textarea',
              label: 'Right panel subtitle',
              localized: true,
            },
            {
              name: 'items',
              type: 'array',
              maxRows: 4,
              label: 'Menu items (max 4)',
              fields: [
                {
                  name: 'icon',
                  type: 'text',
                  label: 'Icon',
                  admin: {
                    description:
                      'Material Symbols icon name e.g. storefront, handshake, campaign, rocket_launch',
                    components: {
                      Field: '@/components/MaterialIconPicker#MaterialIconPicker',
                    },
                  },
                },
                {
                  name: 'title',
                  type: 'text',
                  label: 'Item title',
                  required: true,
                  localized: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: 'Item description',
                  localized: true,
                },
                link({
                  appearances: false,
                  disableLabel: true,
                  overrides: { label: 'Item link' },
                }),
              ],
            },
          ],
        },
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'cta',
      type: 'group',
      label: 'CTA Button',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Button label',
          required: true,
          localized: true,
          defaultValue: 'Start a Partnership',
        },
        {
          name: 'type',
          type: 'radio',
          admin: {
            layout: 'horizontal',
          },
          defaultValue: 'custom',
          options: [
            {
              label: 'URL',
              value: 'custom',
            },
            {
              label: 'Open a modal form',
              value: 'modal',
            },
          ],
        },
        {
          name: 'url',
          type: 'text',
          label: 'Button URL',
          required: true,
          defaultValue: '/start-a-partnership',
          admin: {
            condition: (_, siblingData) => (siblingData?.type ?? 'custom') === 'custom',
          },
        },
        {
          name: 'modalForm',
          type: 'relationship',
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'modal',
            description: 'Opens this form in a modal drawer instead of navigating.',
          },
          label: 'Form to open',
          relationTo: 'forms',
          required: true,
        },
      ],
    },
  ], // end global fields
  hooks: {
    afterChange: [revalidateHeader],
  },
}
