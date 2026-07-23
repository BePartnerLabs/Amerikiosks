import type { FieldAccess, GlobalConfig } from 'payload'
import { revalidateSettings } from './hooks/revalidateSettings'

// Settings' own global-level access is public (read: () => true) — this field
// carries a secret, so it needs its own stricter read gate, independent of
// that. No role system exists in this project yet (Users has no `role`
// field), so "authenticated" is the closest equivalent to "admin" today —
// every /admin user is effectively an admin.
const authenticatedFieldAccess: FieldAccess = ({ req: { user } }) => Boolean(user)

export const Settings: GlobalConfig = {
  slug: 'settings',
  admin: {
    group: 'Config',
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
        {
          label: 'Integrations',
          fields: [
            {
              name: 'jotformApiKey',
              type: 'text',
              label: 'JotForm API Key',
              access: {
                // The global's own access.read is public (see above) — this
                // field overrides that with its own stricter gate, since it's
                // a secret. Local API calls from server-side code (e.g.
                // JotFormRepository reading this to build a request) default
                // to overrideAccess: true and bypass this entirely, same as
                // any other Payload access control — only external
                // REST/GraphQL requests are actually gated by this.
                read: authenticatedFieldAccess,
              },
              admin: {
                description:
                  'API key for the JotForm submissions API (used by the Claims refund flow). Only visible to logged-in admin users — never exposed in the public Settings API response.',
              },
            },
            {
              name: 'jotformFormId',
              type: 'text',
              label: 'JotForm Form ID',
              admin: {
                description:
                  'Target JotForm form ID for the Claims refund flow. Leave empty to use the production "Amerikiosks - Refund Request" form (230405763622148) — override here to point at a clone/test form in local or staging.',
                placeholder: '230405763622148',
              },
            },
          ],
        },
      ],
    },
  ],
}
