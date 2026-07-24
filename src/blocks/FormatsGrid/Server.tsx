import config from '@payload-config'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type React from 'react'
import type { FormatsGridBlock as FormatsGridBlockProps, Machine } from '@/payload-types'
import { FormatsGridBlock } from './Component'

export const FormatsGridServer: React.FC<FormatsGridBlockProps> = async (props) => {
  const { items, filterTags, ...rest } = props
  const payload = await getPayload({ config })
  const locale = await getLocale()

  let machines: Machine[] = []

  if (items && items.length > 0) {
    const resolved = await Promise.all(
      items.map(async (item) => {
        if (!item.machine) return null
        const id = typeof item.machine === 'object' ? item.machine.id : Number(item.machine)
        return payload.findByID({
          collection: 'machines',
          id,
          depth: 1,
          overrideAccess: false,
          locale: locale as 'en' | 'es',
        })
      }),
    )
    machines = resolved.filter((m): m is Machine => m !== null)
  } else {
    const tagIds = (filterTags ?? []).map((t) => (typeof t === 'object' ? t.id : t)).filter(Boolean)
    const result = await payload.find({
      collection: 'machines',
      ...(tagIds.length > 0 ? { where: { tags: { in: tagIds } } } : {}),
      depth: 1,
      overrideAccess: false,
      locale: locale as 'en' | 'es',
    })
    machines = result.docs
  }

  return (
    <FormatsGridBlock
      {...rest}
      resolvedMachines={machines}
    />
  )
}
