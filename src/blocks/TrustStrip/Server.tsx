import config from '@payload-config'
import { getPayload } from 'payload'
import type React from 'react'
import type { TrustStripBlock as TrustStripBlockProps } from '@/payload-types'
import { TrustStripBlock, type TrustStripPartner } from './Component'

export const TrustStripServer: React.FC<TrustStripBlockProps> = async (props) => {
  const { limit } = props
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'partners',
    sort: 'order',
    limit: limit && limit > 0 ? limit : 0,
    depth: 1,
    overrideAccess: false,
  })

  return (
    <TrustStripBlock
      {...props}
      partners={result.docs as TrustStripPartner[]}
    />
  )
}
