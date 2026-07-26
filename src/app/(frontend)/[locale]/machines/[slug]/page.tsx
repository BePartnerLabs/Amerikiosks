import config from '@payload-config'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type { Machine } from '@/payload-types'
import { generateMeta } from '@/utilities/generateMeta'
import { FamilyDetail, generateFamilyMetadata, getFamilyBySlug } from './FamilyDetail'
import './machine-detail.css'
import { MachineDetail } from './MachineDetail'

type Props = {
  params: Promise<{ slug: string }>
}

async function getMachine(slug: string, locale: 'en' | 'es') {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'machines',
    where: { slug: { equals: slug } },
    depth: 2,
    overrideAccess: false,
    locale,
    limit: 1,
  })
  return (result.docs[0] as Machine) ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const locale = (await getLocale()) as 'en' | 'es'

  const family = await getFamilyBySlug(slug, locale)
  if (family) return generateFamilyMetadata(family)

  const machine = await getMachine(slug, locale)
  if (!machine) return {}
  return generateMeta({
    doc: {
      ...machine,
      meta: {
        title: machine.meta?.title ?? machine.name,
        description: machine.meta?.description ?? machine.tagline,
        image: machine.meta?.image ?? machine.image,
      },
    },
  })
}

export default async function MachinesSlugPage({ params }: Props) {
  const { slug } = await params
  const locale = (await getLocale()) as 'en' | 'es'

  const family = await getFamilyBySlug(slug, locale)
  if (family) {
    return (
      <FamilyDetail
        family={family}
        locale={locale}
      />
    )
  }

  const machine = await getMachine(slug, locale)
  if (!machine) notFound()

  return (
    <MachineDetail
      machine={machine}
      locale={locale}
    />
  )
}
