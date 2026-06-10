import config from '@payload-config'
import { del, list } from '@vercel/blob'
import { headers } from 'next/headers'
import { createLocalReq, getPayload } from 'payload'

import { seed } from '@/endpoints/seed'
import { seedFooter } from '@/endpoints/seed/footer'
import { seedHeader } from '@/endpoints/seed/header'
import { seedAudiencePages } from '@/endpoints/seed/pages/audience'
import { seedCaseStudies } from '@/endpoints/seed/pages/case-studies'
import { seedContact } from '@/endpoints/seed/pages/contact'
import { seedHome } from '@/endpoints/seed/pages/home'
import { seedSolutions } from '@/endpoints/seed/pages/solutions'
import { seedWhereItWorks } from '@/endpoints/seed/pages/where-it-works'
import { seedWhyAmerikiosks } from '@/endpoints/seed/pages/why-amerikiosks'
import { seedPartners } from '@/endpoints/seed/partners'
import { seedPosts } from '@/endpoints/seed/posts'

export const maxDuration = 120

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
    // Clean up any orphaned seed blobs before seeding so re-runs on a reset DB don't conflict
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    if (blobToken) {
      const seedStems = [
        'hero-for-agencies',
        'hero-for-brands',
        'hero-for-venues',
        'hero-home',
        'image-hero1',
        'image-post1',
        'image-post2',
        'image-post3',
        'partner-cvs',
        'partner-hilton',
        'partner-holiday-inn',
        'partner-kroger',
        'partner-mia',
        'partner-royal-caribbean',
      ]
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
