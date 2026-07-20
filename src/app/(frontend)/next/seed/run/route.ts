import config from '@payload-config'
import { headers } from 'next/headers'
import { createLocalReq, getPayload } from 'payload'

import { seed } from '@/endpoints/seed'
import { seedBrands } from '@/endpoints/seed/brands'
import { seedFooter } from '@/endpoints/seed/footer'
import { seedHeader } from '@/endpoints/seed/header'
import { seedPosts } from '@/endpoints/seed/insights'
import { seedAudiencePages, seedWhoItsFor } from '@/endpoints/seed/pages/audience'
import { seedCaseStudies } from '@/endpoints/seed/pages/case-studies'
import { seedContact } from '@/endpoints/seed/pages/contact'
import { seedCookiePolicy } from '@/endpoints/seed/pages/cookie-policy'
import { seedCustomerService } from '@/endpoints/seed/pages/customer-service'
import { seedCustomerServiceRequestARefund } from '@/endpoints/seed/pages/customer-service-request-a-refund'
import { seedForAgencies } from '@/endpoints/seed/pages/for-agencies'
import { seedForBrands } from '@/endpoints/seed/pages/for-brands'
import { seedForEmergingBrands } from '@/endpoints/seed/pages/for-emerging-brands'
import { seedForVenues } from '@/endpoints/seed/pages/for-venues'
import { seedHome } from '@/endpoints/seed/pages/home'
import { seedMachines } from '@/endpoints/seed/pages/machines'
import { seedPrivacyPolicy } from '@/endpoints/seed/pages/privacy-policy'
import { seedSolutions } from '@/endpoints/seed/pages/solutions'
import { seedWhereItWorks } from '@/endpoints/seed/pages/where-it-works'
import { seedWhereItWorksDetail } from '@/endpoints/seed/pages/where-it-works-detail'
import { seedWhyAmerikiosks } from '@/endpoints/seed/pages/why-amerikiosks'
import { seedPartners } from '@/endpoints/seed/partners'
import { seedRedirects } from '@/endpoints/seed/redirects'

export const maxDuration = 300

const parts: Record<
  string,
  (
    payload: Parameters<typeof seed>[0]['payload'],
    req: Parameters<typeof seed>[0]['req'],
  ) => Promise<void>
> = {
  audience: async (payload, req) => {
    const whoItsForId = await seedWhoItsFor(payload, req)
    await seedAudiencePages(payload, req, whoItsForId)
  },
  contact: seedContact,
  home: async (payload, req) => {
    const whoItsForId = await seedWhoItsFor(payload, req)
    const { pageIds, mediaIds } = await seedAudiencePages(payload, req, whoItsForId)
    const postIds = await seedPosts(payload, req)
    await seedHome(payload, req, pageIds, postIds, mediaIds)
  },
  posts: async (payload, req) => {
    await seedPosts(payload, req)
  },
  solutions: seedSolutions,
  machines: seedMachines,
  'where-it-works': seedWhereItWorks,
  'where-it-works-detail': seedWhereItWorksDetail,
  'case-studies': seedCaseStudies,
  'why-amerikiosks': seedWhyAmerikiosks,
  header: seedHeader,
  footer: seedFooter,
  partners: seedPartners,
  'for-brands': seedForBrands,
  'for-venues': seedForVenues,
  'for-agencies': seedForAgencies,
  'for-emerging-brands': seedForEmergingBrands,
  brands: seedBrands,
  redirects: seedRedirects,
  'customer-service': async (payload, req) => {
    await seedCustomerService(payload, req)
    await seedCustomerServiceRequestARefund(payload, req)
  },
  'privacy-policy': seedPrivacyPolicy,
  'cookie-policy': seedCookiePolicy,
}

export async function POST(req: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })
  if (!user) return new Response('Action forbidden.', { status: 403 })

  const payloadReq = await createLocalReq({ user }, payload)

  const { searchParams } = new URL(req.url)
  const part = searchParams.get('part')

  try {
    // Delete existing seed media records via Payload so the storage adapter
    // (Vercel Blob or local filesystem) cleans up the files too. This prevents
    // "blob already exists" errors when re-seeding after a DB reset.
    // Scoped to a full "Seed all" run only (no `part`) — running this on every
    // individual part re-run wipes media that OTHER parts just uploaded, since
    // stems aren't scoped per part. Individual parts already re-upload
    // idempotently by filename via uploadMedia(), so no cleanup is needed there.
    if (!part) {
      const seedStems = [
        'hero-for-agencies',
        'hero-for-brands',
        'hero-for-venues',
        'hero-home',
        'image-hero1',
        'image-post1',
        'image-post2',
        'image-post3',
        'image-post4',
        'partner-cvs',
        'partner-hilton',
        'partner-holiday-inn',
        'partner-kroger',
        'partner-mia',
        'partner-royal-caribbean',
        'machine-full-size',
        'machine-campaign',
        'machine-compact',
        'machine-premium',
        'project-fan-stand',
        'project-airport-retail',
        'brand-carlos-bakery',
        'brand-pharmabox',
        'brand-fan-stand',
        'brand-istore',
      ]
      // 1. Delete existing seed media records via Payload (adapter removes blobs too)
      const { docs: seedMedia } = await payload.find({
        collection: 'media',
        where: { or: seedStems.map((stem) => ({ filename: { contains: stem } })) },
        limit: 200,
      })
      for (const doc of seedMedia) {
        try {
          await payload.delete({ collection: 'media', id: doc.id, overrideAccess: true })
        } catch {
          // record may be referenced by pages; blob will be cleaned below
        }
      }
    }
    if (part) {
      const fn = parts[part]
      if (!fn) return new Response(`Unknown part: ${part}`, { status: 400 })
      await fn(payload, payloadReq)
    } else {
      await seed({ payload, req: payloadReq })
    }
    return Response.json({ success: true })
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error seeding data' })
    return new Response(`Error seeding${part ? ` ${part}` : ''}.`, { status: 500 })
  }
}
