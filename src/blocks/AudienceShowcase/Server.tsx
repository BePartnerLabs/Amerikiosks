import config from '@payload-config'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type React from 'react'
import type { AudienceShowcaseBlock as AudienceShowcaseBlockProps } from '@/payload-types'
import { AudienceShowcaseBlock } from './Component'

export const AudienceShowcaseServer: React.FC<AudienceShowcaseBlockProps> = async (props) => {
  const { items, ...rest } = props

  if (!items || items.length === 0) {
    return <AudienceShowcaseBlock {...props} />
  }

  const payload = await getPayload({ config })
  const locale = await getLocale()

  const populatedItems = await Promise.all(
    items.map(async (item) => {
      if (item.target === 'form') {
        if (!item.form || typeof item.form === 'object') return item
        const form = await payload.findByID({
          collection: 'forms',
          id: item.form,
          depth: 1,
          overrideAccess: false,
        })
        return { ...item, form }
      }

      if (!item.page) return item
      const pageId =
        typeof item.page === 'number'
          ? item.page
          : typeof item.page === 'string'
            ? Number(item.page)
            : item.page.id
      const page = await payload.findByID({
        collection: 'pages',
        id: pageId,
        depth: 1,
        overrideAccess: false,
        locale: locale as 'en' | 'es',
        select: { title: true, slug: true, meta: true },
      })
      return { ...item, page }
    }),
  )

  return (
    <AudienceShowcaseBlock
      {...rest}
      items={populatedItems as AudienceShowcaseBlockProps['items']}
    />
  )
}
