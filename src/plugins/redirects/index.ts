import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import type { Field } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { normalizePath } from './normalizePath'

/**
 * Wraps Payload's redirects plugin, which only models the collection — it does
 * no routing of its own. The matching half lives in `src/proxy.ts` via
 * `findRedirect`, so a redirect works on any path, not just the ones that
 * happen to resolve to a route.
 *
 * On top of the stock plugin this adds:
 * - 301/302 selectable per redirect (the stock setup always produced a 307,
 *   which tells search engines nothing moved permanently)
 * - `from` normalized on save, so trailing slashes, locale prefixes, pasted
 *   full URLs and casing stop being silent no-matches
 */
export const amerikiosksRedirectsPlugin = () =>
  redirectsPlugin({
    collections: ['pages', 'insights'],
    redirectTypes: ['301', '302'],
    redirectTypeFieldOverride: {
      defaultValue: '301',
      admin: {
        description:
          '301 for a URL that moved for good (search engines transfer its ranking). 302 only for a temporary detour.',
      },
    },
    overrides: {
      admin: {
        group: 'Config',
        description:
          'Send an old URL to a current one. Works for any path, including ones with several segments (e.g. /2023/02/hello-world). Changes take effect within a minute — no deploy needed.',
      },
      // @ts-expect-error - valid override; mapped fields don't resolve to the
      // same union member the plugin's type expects
      fields: ({ defaultFields }: { defaultFields: Field[] }) =>
        defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              hooks: {
                // Stored normalized so the admin shows exactly what will match.
                beforeValidate: [
                  ({ value }: { value?: unknown }) =>
                    typeof value === 'string' ? normalizePath(value).path : value,
                ],
              },
              admin: {
                description:
                  'The old path, e.g. /our-history. A full URL, a trailing slash or a locale prefix are cleaned up automatically on save.',
                placeholder: '/old-page',
              },
            }
          }
          return field
        }),
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  })
