import config from '@payload-config'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type React from 'react'
import type { MachineFamily, ModelLinesBlock as ModelLinesBlockProps } from '@/payload-types'
import { ModelLinesBlock } from './Component'

export const ModelLinesServer: React.FC<ModelLinesBlockProps> = async (props) => {
  const payload = await getPayload({ config })
  const locale = await getLocale()

  const result = await payload.find({
    collection: 'machine-families',
    sort: 'name',
    depth: 1,
    overrideAccess: false,
    locale: locale as 'en' | 'es',
  })

  return (
    <ModelLinesBlock
      {...props}
      families={result.docs as MachineFamily[]}
      locale={locale as 'en' | 'es'}
    />
  )
}
