import config from '@payload-config'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type React from 'react'
import type { Form, MachineFamily, ModelLinesBlock as ModelLinesBlockProps } from '@/payload-types'
import { ModelLinesBlock } from './Component'

export const ModelLinesServer: React.FC<ModelLinesBlockProps> = async (props) => {
  const { form, ...rest } = props
  const payload = await getPayload({ config })
  const locale = await getLocale()

  const [result, resolvedForm] = await Promise.all([
    payload.find({
      collection: 'machine-families',
      sort: 'name',
      depth: 1,
      overrideAccess: false,
      locale: locale as 'en' | 'es',
    }),
    typeof form === 'number'
      ? payload.findByID({ collection: 'forms', id: form, depth: 1, overrideAccess: false })
      : Promise.resolve(form ?? null),
  ])

  return (
    <ModelLinesBlock
      {...rest}
      form={resolvedForm as Form | null}
      families={result.docs as MachineFamily[]}
      locale={locale as 'en' | 'es'}
    />
  )
}
