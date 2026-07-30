import type { StaticImageData } from 'next/image'
import type React from 'react'
import RichText from '@/components/RichText'
import type { MediaBlock as MediaBlockProps } from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'
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

export const MediaBlock: React.FC<Props> = ({ media, staticImage, blockName, blockType }) => {
  let caption: React.ComponentProps<typeof RichText>['data'] | null | undefined
  if (media && typeof media === 'object') caption = media.caption

  return (
    // blockType is only set when RenderBlocks spreads a page block; rendered
    // inline inside RichText it is undefined and React drops the attribute,
    // which is what keeps prose images out of GA4 block reporting.
    <div
      className="ak-media-block"
      data-ga-block={blockType ? toSnakeCase(blockType) : undefined}
      data-ga-section={blockName ?? undefined}
    >
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
