import type { StaticImageData } from 'next/image'
import type React from 'react'
import RichText from '@/components/RichText'
import type { MediaBlock as MediaBlockProps } from '@/payload-types'

import { Media } from '../../components/Media'

type Props = MediaBlockProps & {
  breakout?: boolean
  captionClassName?: string
  className?: string
  enableGutter?: boolean
  imgClassName?: string
  staticImage?: StaticImageData
  disableInnerContainer?: boolean
}

export const MediaBlock: React.FC<Props> = (props) => {
  const { captionClassName: _captionClassName, className: _className, media, staticImage } = props

  let caption: React.ComponentProps<typeof RichText>['data'] | null | undefined
  if (media && typeof media === 'object') caption = media.caption

  return (
    <div className="">
      {(media || staticImage) && (
        <Media
          imgClassName=""
          resource={media}
          src={staticImage}
        />
      )}
      {caption && (
        <div className="">
          <RichText
            data={caption}
            enableGutter={false}
          />
        </div>
      )}
    </div>
  )
}
