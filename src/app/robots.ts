import config from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'settings' })

  if (settings?.noIndex !== false) {
    // Block all crawlers including AI bots
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    }
  }

  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${getServerSideURL()}/sitemap.xml`,
  }
}
