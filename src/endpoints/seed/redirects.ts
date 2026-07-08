import type { Payload, PayloadRequest } from 'payload'

// 301 redirects from the WordPress→Payload migration audit — see
// docs/analytics-migration-report.md. None of these 13 URLs got more than
// 3 views/month in the source-site analytics, so they're resolved as plain
// redirects rather than migrated content.
const REDIRECTS: { from: string; to: string }[] = [
  { from: '/our-history', to: '/our-story' },
  { from: '/our-history/', to: '/our-story' },
  { from: '/contact-minimal/', to: '/contact' },
  { from: '/contact-page-builder/', to: '/contact' },
  { from: '/contact-old/london-office/', to: '/contact' },
  { from: '/contact-old/reykjavik-office/', to: '/contact' },
  { from: '/cart/', to: '/' },
  { from: '/my-account/', to: '/' },
  { from: '/shop/', to: '/services-we-offer' },
  { from: '/collections', to: '/automated-system-models' },
  { from: '/2022/05/post-9/', to: '/news' },
  { from: '/2023/02/hello-world/', to: '/news' },
  { from: '/2023/02/the-fan-stand/', to: '/news' },
]

export const seedRedirects = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding migration redirects...')

  for (const redirect of REDIRECTS) {
    const existing = await payload.find({
      collection: 'redirects',
      where: { from: { equals: redirect.from } },
      limit: 1,
      req,
    })

    const data = { from: redirect.from, to: { type: 'custom' as const, url: redirect.to } }

    if (existing.docs.length > 0) {
      await payload.update({
        collection: 'redirects',
        id: existing.docs[0]?.id,
        data,
        req,
      })
    } else {
      await payload.create({
        collection: 'redirects',
        data,
        req,
      })
    }
  }

  payload.logger.info(`Seeded ${REDIRECTS.length} redirects.`)
}
