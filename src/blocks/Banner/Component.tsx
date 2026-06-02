import type React from 'react'
import type { BannerBlock as BannerBlockProps } from 'src/payload-types'
import RichText from '@/components/RichText'

type Props = {
  className?: string
} & BannerBlockProps

export const BannerBlock: React.FC<Props> = ({ className: _className, content, style: _style }) => {
  return (
    <div className="">
      <div className="">
        <RichText
          data={content}
          enableGutter={false}
          enableProse={false}
        />
      </div>
    </div>
  )
}
