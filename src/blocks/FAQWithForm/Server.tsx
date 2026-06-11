import config from '@payload-config'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type React from 'react'
import type { FAQWithFormBlock as FAQWithFormBlockProps, FaqItem } from '@/payload-types'
import { FAQWithFormBlock } from './Component'

export const FAQWithFormServer: React.FC<FAQWithFormBlockProps> = async (props) => {
  const { filterTags, ...rest } = props
  const payload = await getPayload({ config })
  const locale = await getLocale()

  const tags = (filterTags ?? []).map((t) => t.tag).filter(Boolean) as string[]

  const result = await payload.find({
    collection: 'faqItems',
    ...(tags.length > 0 ? { where: { 'tags.label': { in: tags } } } : {}),
    sort: '-weight',
    depth: 0,
    overrideAccess: false,
    locale: locale as 'en' | 'es',
  })

  return (
    <FAQWithFormBlock
      {...rest}
      filterTags={filterTags}
      resolvedFaqs={result.docs as FaqItem[]}
    />
  )
}
