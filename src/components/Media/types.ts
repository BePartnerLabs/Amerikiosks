import type { StaticImageData } from 'next/image'
import type { ElementType, Ref } from 'react'

import type { Media as MediaType } from '@/payload-types'

export interface Props {
  alt?: string
  className?: string
  fill?: boolean // for NextImage only
  htmlElement?: ElementType | null
  pictureClassName?: string
  imgClassName?: string
  onClick?: () => void
  onLoad?: () => void
  loading?: 'lazy' | 'eager' // for NextImage only
  priority?: boolean // for NextImage only
  ref?: Ref<HTMLImageElement | HTMLVideoElement | null>
  resource?: MediaType | string | number | null // for Payload media
  size?: string // for NextImage only
  // Largest CSS width (px) this image ever renders at — used to pick the
  // smallest Payload-generated size variant that's still big enough,
  // instead of always feeding next/image the full original. Defaults to a
  // conservative 1600 (covers everything up to just under `xlarge`) when a
  // caller doesn't know/care to be more specific. See getBestMediaUrl.
  targetWidth?: number
  src?: StaticImageData // for static media
  videoClassName?: string
}
