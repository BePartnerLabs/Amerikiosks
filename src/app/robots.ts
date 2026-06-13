import config from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import type { Setting } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

type RobotsRule = NonNullable<Setting['robotsRules']>[number]
type MetadataRobotsRule = { userAgent: string; allow?: string[]; disallow?: string[] }

function mapRule(rule: RobotsRule): MetadataRobotsRule {
  return {
    userAgent: rule.userAgent ?? '*',
    allow: (rule.allow ?? []).map((a) => a.path).filter(Boolean) as string[],
    disallow: (rule.disallow ?? []).map((d) => d.path).filter(Boolean) as string[],
  }
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'settings' })

  if (settings?.noIndex !== false) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    }
  }

  const rules = settings.robotsRules ?? []

  if (rules.length === 0) {
    return {
      rules: [{ userAgent: '*', allow: '/' }],
      sitemap: `${getServerSideURL()}/sitemap.xml`,
    }
  }

  return {
    rules: rules.map(mapRule),
    sitemap: `${getServerSideURL()}/sitemap.xml`,
  }
}
