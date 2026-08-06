import config from '@payload-config'
import { getLocale, getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import type React from 'react'
import type {
  Machine,
  MachineFamily,
  MachineModelsBlock as MachineModelsBlockProps,
  Media,
} from '@/payload-types'
import { getBestMediaUrl } from '@/utilities/getMediaSizeUrl'
import { MachineModelsBlock } from './Component'
import type { ModelCard } from './types'

const mediaUrl = (value: unknown, width: number): string | null => {
  if (!value || typeof value !== 'object') return null
  const media = value as Media
  if (!media.url) return null
  return getBestMediaUrl(media, width) ?? media.url
}

export const MachineModelsServer: React.FC<MachineModelsBlockProps> = async (props) => {
  const { family: familyRef, ...rest } = props
  const payload = await getPayload({ config })
  const locale = await getLocale()
  const t = await getTranslations('machines')

  const result = await payload.find({
    collection: 'machines',
    depth: 1,
    limit: 0,
    sort: 'name',
    overrideAccess: false,
    locale: locale as 'en' | 'es',
  })

  const onlySlug =
    familyRef && typeof familyRef === 'object'
      ? ((familyRef as MachineFamily).slug ?? null)
      : familyRef
        ? String(familyRef)
        : null

  const models: ModelCard[] = (result.docs as Machine[])
    .map((machine) => {
      // `family` is required on the collection and populated at depth 1, so the
      // model URL is built per card from the machine's own family rather than
      // from an ambient "active" one. A machine whose family somehow failed to
      // populate has no valid URL and is dropped below.
      const family =
        machine.family && typeof machine.family === 'object'
          ? (machine.family as MachineFamily)
          : null

      return {
        id: String(machine.id),
        name: machine.name,
        slug: machine.slug ?? '',
        familyName: family?.name ?? null,
        familySlug: family?.slug ?? null,
        imageUrl: mediaUrl(machine.image, 520),
        specs: (machine.specs ?? [])
          .filter((spec) => spec.label && spec.value)
          .slice(0, 3)
          .map((spec) => ({ label: spec.label as string, value: spec.value as string })),
      }
    })
    .filter((model) => model.slug && model.familySlug)
    .filter((model) => (onlySlug ? model.familySlug === onlySlug : true))

  if (!models.length) return null

  return (
    <MachineModelsBlock
      {...rest}
      models={models}
      labels={{
        previous: t('carouselPrevious'),
        next: t('carouselNext'),
        go: t('seeMachine'),
      }}
    />
  )
}
