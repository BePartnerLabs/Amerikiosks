import type React from 'react'
import RichText from '@/components/RichText'
import type { BannerBlock as BannerBlockProps } from '@/payload-types'
import './styles.css'

type Props = {
  className?: string
} & BannerBlockProps

export const BannerBlock: React.FC<Props> = ({ content, style }) => {
  return (
    <div className={`ak-banner ak-banner--${style ?? 'info'}`}>
      <div className="ak-banner__content">
        <RichText
          data={content}
          enableGutter={false}
          enableProse={false}
        />
      </div>
    </div>
  )
}
