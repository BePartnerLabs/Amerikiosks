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
      name: 'noIndex',
      type: 'checkbox',
      label: 'Block search engine indexing',
      defaultValue: true,
      admin: {
        description:
          'When enabled, robots.txt disallows all crawlers and a <meta name="robots" content="noindex"> tag is added site-wide. Turn off when the site is ready to go public.',
      },
    },
    {
      name: 'googleAnalyticsId',
      type: 'text',
      label: 'Google Analytics Measurement ID',
      admin: {
        description:
          'Your GA4 Measurement ID (e.g. G-XXXXXXXXXX). Leave empty to disable analytics.',
        placeholder: 'G-XXXXXXXXXX',
      },
    },
  ],
}
