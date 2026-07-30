import config from '@payload-config'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import type { FaqItem } from '@/payload-types'
import { jsonLdString } from '@/utilities/jsonLdString'
import { FaqClient } from './FaqClient'
import './faq.css'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('faq')
  return { title: t('title'), description: t('description') }
}

export default async function FaqPage() {
  const payload = await getPayload({ config })
  const locale = await getLocale()
  const t = await getTranslations('faq')

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
    new Set(faqs.flatMap((f) => (f.tags ?? []).map((tag) => tag.label)).filter(Boolean)),
  ) as string[]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: convertLexicalToPlaintext({ data: item.answer as unknown as SerializedEditorState }),
      },
    })),
  }

  return (
    <main className="ak-faq-page">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is escaped via jsonLdString, but CMS-entered content still passes through this tag
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <div className="bp-content-grid">
        <div className="content ak-faq-page__inner">
          <h1 className="ak-faq-page__heading">{t('heading')}</h1>
          <FaqClient
            faqs={faqs}
            allTags={allTags}
          />
        </div>
      </div>
    </main>
  )
}
