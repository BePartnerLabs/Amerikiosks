'use client'
import { type RowLabelProps, useRowLabel } from '@payloadcms/ui'
import type { Setting } from '@/payload-types'

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  x: 'X (Twitter)',
  whatsapp: 'WhatsApp',
}

export const SocialRowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<NonNullable<Setting['socialLinks']>[number]>()
  const platform = data?.data?.platform

  return <div>{(platform && PLATFORM_LABELS[platform]) ?? 'Social profile'}</div>
}
