import config from '@payload-config'
import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type React from 'react'
import type { FAQWithFormBlock as FAQWithFormBlockProps, FaqItem } from '@/payload-types'
import { FAQWithFormBlock } from './Component'

export const FAQWithFormServer: React.FC<FAQWithFormBlockProps> = async (props) => {
  const { filterTags, form, ...rest } = props
  const payload = await getPayload({ config })
  const locale = await getLocale()

  const tags = (filterTags ?? []).map((t) => t.tag).filter(Boolean) as string[]

  const [faqResult, resolvedForm] = await Promise.all([
    payload.find({
      collection: 'faqItems',
      ...(tags.length > 0 ? { where: { 'tags.label': { in: tags } } } : {}),
      sort: '-weight',
      depth: 0,
      overrideAccess: false,
      locale: locale as 'en' | 'es',
    }),
    typeof form === 'number'
      ? payload.findByID({ collection: 'forms', id: form, depth: 1, overrideAccess: false })
      : Promise.resolve(form ?? null),
  ])

  return (
    <FAQWithFormBlock
      {...rest}
      form={form}
      filterTags={filterTags}
      resolvedFaqs={faqResult.docs as FaqItem[]}
      resolvedForm={resolvedForm as unknown as FormType | null}
    />
  )
}
