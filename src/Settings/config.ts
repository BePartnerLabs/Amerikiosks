import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  admin: {
    group: 'Site',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'googleAnalyticsId',
      type: 'text',
      label: 'Google Analytics Measurement ID',
      admin: {
        description: 'Your GA4 Measurement ID (e.g. G-XXXXXXXXXX). Leave empty to disable analytics.',
        placeholder: 'G-XXXXXXXXXX',
      },
    },
  ],
}
