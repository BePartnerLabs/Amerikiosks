import type { Payload } from 'payload'

export async function seedSettings(
  payload: Payload,
  req: Parameters<typeof payload.updateGlobal>[0]['req'],
): Promise<void> {
  await payload.updateGlobal({
    slug: 'settings',
    data: {
      noIndex: false,
      robotsRules: [
        {
          userAgent: 'Googlebot',
          allow: [{ path: '/' }],
          disallow: [],
        },
        {
          userAgent: 'Bingbot',
          allow: [{ path: '/' }],
          disallow: [],
        },
        {
          userAgent: 'GPTBot',
          allow: [],
          disallow: [{ path: '/' }],
        },
        {
          userAgent: 'Claude-Web',
          allow: [],
          disallow: [{ path: '/' }],
        },
        {
          userAgent: '*',
          allow: [{ path: '/' }],
          disallow: [],
        },
      ],
      llmsEnabled: true,
      llmsSiteDescription:
        'Amerikiosks provides branded kiosk hardware and software solutions for retail, hospitality, and venue environments.',
      llmsIncludePages: true,
      llmsIncludeInsights: true,
      googleAnalyticsId: 'G-TEST12345',
    },
    req,
    overrideAccess: false,
  })
  payload.logger.info('Settings seeded')
}
