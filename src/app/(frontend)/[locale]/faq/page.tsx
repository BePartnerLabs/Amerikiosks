import config from '@payload-config'
import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type { FaqItem } from '@/payload-types'
import { FaqClient } from './FaqClient'
import './faq.css'

export const metadata: Metadata = {
  title: 'FAQ — Amerikiosks',
  description:
    'Frequently asked questions about Amerikiosks brand programs, venue partnerships, and operations.',
}

export default async function FaqPage() {
  const payload = await getPayload({ config })
  const locale = await getLocale()

  const result = await payload.find({
    collection: 'faqItems',
    sort: '-weight',
    depth: 0,
    overrideAccess: false,
    locale: locale as 'en' | 'es',
    limit: 200,
  })

  const faqs = result.docs as FaqItem[]

  const allTags = Array.from(
    new Set(faqs.flatMap((f) => (f.tags ?? []).map((t) => t.label)).filter(Boolean)),
  ) as string[]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.question,
      },
    })),
  }

  return (
    <main className="ak-faq-page">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is server-generated structured data, not user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bp-content-grid">
        <div className="content ak-faq-page__inner">
          <h1 className="ak-faq-page__heading">Frequently Asked Questions</h1>
          <FaqClient
            faqs={faqs}
            allTags={allTags}
          />
        </div>
      </div>
    </main>
  )
}
