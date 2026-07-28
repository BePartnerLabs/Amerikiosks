import type { FieldAccess, GlobalConfig } from 'payload'
import { syncBoardsEndpoint } from './endpoints/syncBoards'
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
    group: { en: 'Config', es: 'Configuración' },
  },
  access: {
    read: () => true,
  },
  endpoints: [syncBoardsEndpoint],
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
          label: 'Social',
          fields: [
            {
              // Not localized: a profile URL is the same in every locale.
              name: 'socialLinks',
              type: 'array',
              label: 'Social profiles',
              maxRows: 8,
              admin: {
                description:
                  'Shown in the footer, in the header (desktop and mobile menu) and reported to search engines as the brand’s official profiles.',
                components: { RowLabel: '@/Settings/SocialRowLabel#SocialRowLabel' },
              },
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'TikTok', value: 'tiktok' },
                    { label: 'X (Twitter)', value: 'x' },
                    { label: 'WhatsApp', value: 'whatsapp' },
                  ],
                  admin: { description: 'Decides which logo is rendered.' },
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  validate: (value: unknown) => {
                    if (typeof value !== 'string' || !value.startsWith('https://')) {
                      return 'Enter the full profile URL, starting with https://'
                    }
                    return true
                  },
                  admin: { placeholder: 'https://www.instagram.com/amerikiosks' },
                },
                {
                  name: 'label',
                  type: 'text',
                  localized: true,
                  admin: {
                    description:
                      'Optional. Overrides the screen-reader label, which defaults to "Amerikiosks on Instagram".',
                  },
                },
              ],
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
          label: 'Security',
          fields: [
            {
              name: 'turnstileEnabled',
              type: 'checkbox',
              label: 'Enable Cloudflare Turnstile on public forms',
              defaultValue: false,
              admin: {
                description:
                  'Adds an invisible bot check to every public form. Leave off until both keys below are filled in — with it on and the keys missing, submissions would be rejected. The other protections (rate limiting, honeypot, timing) run regardless of this setting.',
              },
            },
            {
              name: 'turnstileSiteKey',
              type: 'text',
              label: 'Turnstile Site Key',
              admin: {
                description:
                  'Public key from the Cloudflare dashboard (Turnstile → your widget). It is rendered into the page by design — it is not a secret.',
                condition: (data) => Boolean(data?.turnstileEnabled),
              },
            },
            {
              name: 'turnstileSecretKey',
              type: 'text',
              label: 'Turnstile Secret Key',
              access: {
                read: authenticatedFieldAccess,
              },
              admin: {
                description:
                  'Private key used server-side to verify each submission against Cloudflare. Only visible to logged-in admin users — never exposed in the public Settings API response.',
                condition: (data) => Boolean(data?.turnstileEnabled),
                components: {
                  Field: '@payloadcms/ui#PasswordField',
                },
              },
            },
          ],
        },
        {
          label: 'Integrations',
          fields: [
            {
              name: 'defaultClaimIntegrationTarget',
              type: 'select',
              label: 'Default Claim Integration Target',
              defaultValue: 'monday',
              options: [
                { label: 'Odoo', value: 'odoo' },
                { label: 'Monday.com', value: 'monday' },
              ],
              admin: {
                description:
                  "Where new refund claims sync to by default when submitted from the public ClaimForm. Changing this takes effect immediately for claims created after the change — existing claims keep whatever target they already have. Staff can still override a specific claim's target afterward in Claims → Integration target, but that only affects future re-syncs, not one already dispatched.",
              },
            },
            {
              name: 'mondayApiToken',
              type: 'text',
              label: 'Monday.com API Token',
              access: {
                read: authenticatedFieldAccess,
              },
              admin: {
                description:
                  'API token for the Monday.com GraphQL API (used by the Claims refund flow). Only visible to logged-in admin users — never exposed in the public Settings API response.',
                components: {
                  Field: '@payloadcms/ui#PasswordField',
                },
              },
            },
            {
              name: 'mondayBoardsCache',
              type: 'json',
              label: 'Monday.com Boards Cache',
              access: {
                read: authenticatedFieldAccess,
              },
              admin: {
                readOnly: true,
                // Hidden from the raw field UI — with ~90 boards this would
                // render as a huge, unreadable JSON blob. MondayBoardsSync
                // (below) shows a readable summary (synced board names)
                // instead; other components consume this value programmatically.
                hidden: true,
              },
            },
            {
              name: 'mondayBoardsSyncUi',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/Settings/components/MondayBoardsSync#MondayBoardsSync',
                },
              },
            },
            {
              name: 'mondayVisibleBoardIds',
              type: 'json',
              label: 'Monday.com Visible Board Ids',
              admin: {
                // Hidden from the raw field UI — edited exclusively through
                // MondayVisibleBoardsSelect below.
                hidden: true,
                description:
                  'Curated allowlist of Monday.com board ids shown in the Form board picker. Empty = show every synced board.',
              },
            },
            {
              name: 'mondayVisibleBoardsUi',
              type: 'ui',
              admin: {
                components: {
                  Field:
                    '@/Settings/components/MondayVisibleBoardsSelect#MondayVisibleBoardsSelect',
                },
              },
            },
            {
              name: 'mondayConnectedFormsUi',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/Settings/components/MondayConnectedForms#MondayConnectedForms',
                },
              },
            },
          ],
        },
      ],
    },
  ],
}
