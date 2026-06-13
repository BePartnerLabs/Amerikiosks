import type { GlobalConfig } from 'payload'
import { revalidateSettings } from './hooks/revalidateSettings'

export const Settings: GlobalConfig = {
  slug: 'settings',
  admin: {
    group: 'Site',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateSettings],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Indexing',
          fields: [
            {
              name: 'noIndex',
              type: 'checkbox',
              label: 'Block all crawlers',
              defaultValue: true,
              admin: {
                description:
                  'When enabled, robots.txt disallows all crawlers. Takes precedence over the rules below. Turn off when the site is ready to go public.',
              },
            },
            {
              name: 'robotsRules',
              type: 'array',
              label: 'Robots rules',
              admin: {
                description:
                  'Per-agent rules applied when "Block all crawlers" is off. Each entry maps one User-agent to allow/disallow paths.',
                condition: (data) => data?.noIndex === false,
              },
              fields: [
                {
                  name: 'userAgent',
                  type: 'text',
                  required: true,
                  defaultValue: '*',
                  label: 'User-agent',
                  admin: { placeholder: 'e.g. Googlebot, GPTBot, *' },
                },
                {
                  name: 'allow',
                  type: 'array',
                  label: 'Allow',
                  fields: [
                    {
                      name: 'path',
                      type: 'text',
                      required: true,
                      admin: { placeholder: '/' },
                    },
                  ],
                },
                {
                  name: 'disallow',
                  type: 'array',
                  label: 'Disallow',
                  fields: [
                    {
                      name: 'path',
                      type: 'text',
                      required: true,
                      admin: { placeholder: '/admin' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Analytics',
          fields: [
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
        },
        {
          label: 'LLMs',
          fields: [
            {
              name: 'llmsEnabled',
              type: 'checkbox',
              label: 'Enable /llms.txt',
              defaultValue: false,
              admin: {
                description:
                  'When enabled, /llms.txt is publicly accessible and lists site content for AI agents.',
              },
            },
            {
              name: 'llmsSiteDescription',
              type: 'textarea',
              label: 'Site description for AI agents',
              admin: {
                description: 'Short description of the site shown at the top of llms.txt.',
                condition: (data) => data?.llmsEnabled === true,
              },
            },
            {
              name: 'llmsIncludePages',
              type: 'checkbox',
              label: 'Include pages',
              defaultValue: true,
              admin: {
                description: 'Include published pages in llms.txt.',
                condition: (data) => data?.llmsEnabled === true,
              },
            },
            {
              name: 'llmsIncludeInsights',
              type: 'checkbox',
              label: 'Include insights',
              defaultValue: true,
              admin: {
                description: 'Include published insights (posts) in llms.txt.',
                condition: (data) => data?.llmsEnabled === true,
              },
            },
          ],
        },
      ],
    },
  ],
}
