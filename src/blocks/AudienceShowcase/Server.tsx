import config from '@payload-config'
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

  const populatedItems = await Promise.all(
    items.map(async (item) => {
      if (!item.page || typeof item.page !== 'string') return item
      const page = await payload.findByID({
        collection: 'pages',
        id: item.page,
        depth: 1,
        overrideAccess: false,
      })
      return { ...item, page }
    }),
  )

  return (
    <AudienceShowcaseBlock
      {...rest}
      items={populatedItems}
    />
  )
}
