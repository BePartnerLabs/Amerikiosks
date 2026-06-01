import { createLocalReq, getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

import { seed } from '@/endpoints/seed'
import { seedFooter } from '@/endpoints/seed/footer'
import { seedHeader } from '@/endpoints/seed/header'
import { seedHome } from '@/endpoints/seed/pages/home'
import { seedSolutions } from '@/endpoints/seed/pages/solutions'
import { seedWhereItWorks } from '@/endpoints/seed/pages/where-it-works'
import { seedCaseStudies } from '@/endpoints/seed/pages/case-studies'
import { seedWhyAmerikiosks } from '@/endpoints/seed/pages/why-amerikiosks'

export const maxDuration = 120

const parts: Record<string, (payload: any, req: any) => Promise<void>> = {
  home: seedHome,
  solutions: seedSolutions,
  'where-it-works': seedWhereItWorks,
  'case-studies': seedCaseStudies,
  'why-amerikiosks': seedWhyAmerikiosks,
  header: seedHeader,
  footer: seedFooter,
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
