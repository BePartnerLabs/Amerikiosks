import config from '@payload-config'
import { del, list } from '@vercel/blob'
import { headers } from 'next/headers'
import { createLocalReq, getPayload } from 'payload'

import { seed } from '@/endpoints/seed'
import { seedFooter } from '@/endpoints/seed/footer'
import { seedHeader } from '@/endpoints/seed/header'
import { seedPosts } from '@/endpoints/seed/insights'
import { seedAudiencePages } from '@/endpoints/seed/pages/audience'
import { seedCaseStudies } from '@/endpoints/seed/pages/case-studies'
import { seedContact } from '@/endpoints/seed/pages/contact'
import { seedForBrands } from '@/endpoints/seed/pages/for-brands'
import { seedHome } from '@/endpoints/seed/pages/home'
import { seedSolutions } from '@/endpoints/seed/pages/solutions'
import { seedWhereItWorks } from '@/endpoints/seed/pages/where-it-works'
import { seedWhyAmerikiosks } from '@/endpoints/seed/pages/why-amerikiosks'
import { seedPartners } from '@/endpoints/seed/partners'

export const maxDuration = 300

const parts: Record<
  string,
  (
    payload: Parameters<typeof seed>[0]['payload'],
    req: Parameters<typeof seed>[0]['req'],
  ) => Promise<void>
> = {
  audience: async (payload, req) => {
    await seedAudiencePages(payload, req)
  },
  contact: seedContact,
  home: async (payload, req) => {
    const { pageIds, mediaIds } = await seedAudiencePages(payload, req)
    const postIds = await seedPosts(payload, req)
    await seedHome(payload, req, pageIds, postIds, mediaIds)
  },
  posts: async (payload, req) => {
    await seedPosts(payload, req)
  },
  solutions: seedSolutions,
  'where-it-works': seedWhereItWorks,
  'case-studies': seedCaseStudies,
  'why-amerikiosks': seedWhyAmerikiosks,
  header: seedHeader,
  footer: seedFooter,
  partners: seedPartners,
  'for-brands': seedForBrands,
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
    // 2. Delete any orphaned blobs (DB was reset but blobs remain)
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    if (blobToken) {
      const { blobs } = await list({ token: blobToken, limit: 1000 })
      const toDelete = blobs
        .filter((b) => seedStems.some((stem) => b.pathname.includes(stem)))
        .map((b) => b.url)
      if (toDelete.length > 0) await del(toDelete, { token: blobToken })
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
