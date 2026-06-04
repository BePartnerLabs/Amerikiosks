import type { StaticImageData } from 'next/image'
import type React from 'react'
import RichText from '@/components/RichText'
import type { MediaBlock as MediaBlockProps } from '@/payload-types'
import { Media } from '../../components/Media'
import './styles.css'

type Props = MediaBlockProps & {
  captionClassName?: string
  className?: string
  enableGutter?: boolean
  imgClassName?: string
  staticImage?: StaticImageData
  disableInnerContainer?: boolean
  breakout?: boolean
}

export const MediaBlock: React.FC<Props> = ({ media, staticImage }) => {
  let caption: React.ComponentProps<typeof RichText>['data'] | null | undefined
  if (media && typeof media === 'object') caption = media.caption

  return (
    <div className="ak-media-block">
      {(media || staticImage) && (
        <div className="ak-media-block__media">
          <Media
            resource={media}
            src={staticImage}
          />
        </div>
      )}
      {caption && (
        <div className="ak-media-block__caption">
          <RichText
            data={caption}
            enableGutter={false}
          />
        </div>
      )}
    </div>
  )
}
