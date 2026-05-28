import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
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
            },
            {
              name: 'panelHeadline',
              type: 'text',
              label: 'Left panel headline',
              required: true,
            },
            {
              name: 'panelDescription',
              type: 'textarea',
              label: 'Left panel description',
            },
            {
              name: 'rightTitle',
              type: 'text',
              label: 'Right panel title',
              required: true,
            },
            {
              name: 'rightSubtitle',
              type: 'textarea',
              label: 'Right panel subtitle',
            },
            {
              name: 'items',
              type: 'array',
              maxRows: 4,
              label: 'Menu items (max 4)',
              fields: [
                {
                  name: 'icon',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Icon',
                },
                {
                  name: 'title',
                  type: 'text',
                  label: 'Item title',
                  required: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: 'Item description',
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
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
