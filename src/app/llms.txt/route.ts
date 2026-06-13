import config from '@payload-config'
import { getPayload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'settings' })

  if (!settings?.llmsEnabled) {
    return new Response(null, { status: 404 })
  }

  const baseUrl = getServerSideURL()
  const lines: string[] = []

  lines.push('# Amerikiosks')
  lines.push('')

  if (settings.llmsSiteDescription) {
    lines.push(`> ${settings.llmsSiteDescription}`)
    lines.push('')
  }

  if (settings.llmsIncludePages !== false) {
    const pages = await payload.find({
      collection: 'pages',
      where: { _status: { equals: 'published' } },
      depth: 1,
      limit: 200,
      overrideAccess: false,
    })

    if (pages.docs.length > 0) {
      lines.push('## Pages')
      lines.push('')
      for (const page of pages.docs) {
        const breadcrumbs = page.breadcrumbs as { url?: string }[] | undefined
        const slug = breadcrumbs?.at(-1)?.url ?? `/${page.slug}`
        const url = `${baseUrl}${slug}`
        const description = (page.meta as { description?: string } | undefined)?.description
        lines.push(
          description ? `- [${page.title}](${url}): ${description}` : `- [${page.title}](${url})`,
        )
      }
      lines.push('')
    }
  }

  if (settings.llmsIncludeInsights !== false) {
    const insights = await payload.find({
      collection: 'insights',
      where: { _status: { equals: 'published' } },
      depth: 0,
      limit: 200,
      overrideAccess: false,
    })

    if (insights.docs.length > 0) {
      lines.push('## Insights')
      lines.push('')
      for (const insight of insights.docs) {
        const url = `${baseUrl}/insights/${insight.slug}`
        const description = (insight.meta as { description?: string } | undefined)?.description
        lines.push(
          description
            ? `- [${insight.title}](${url}): ${description}`
            : `- [${insight.title}](${url})`,
        )
      }
      lines.push('')
    }
  }

  return new Response(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
