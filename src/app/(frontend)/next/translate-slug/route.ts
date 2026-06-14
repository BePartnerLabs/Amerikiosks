import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  const fromLocale = searchParams.get('from') as 'en' | 'es' | null
  const toLocale = searchParams.get('to') as 'en' | 'es' | null

  if (!slug || !fromLocale || !toLocale) {
    return Response.json({ error: 'Missing params' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  // Find the page by its slug in the source locale
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    locale: fromLocale,
    limit: 1,
    depth: 0,
    select: { slug: true },
  })

  const page = result.docs[0]
  if (!page) {
    return Response.json({ slug }, { status: 200 })
  }

  // Fetch the slug in the target locale
  const translated = await payload.findByID({
    collection: 'pages',
    id: page.id,
    locale: toLocale,
    depth: 0,
    select: { slug: true },
  })

  return Response.json({ slug: translated?.slug ?? slug }, { status: 200 })
}
