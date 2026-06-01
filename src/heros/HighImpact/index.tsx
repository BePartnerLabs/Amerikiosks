'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import './high-impact.css'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, backgroundVideo, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  const videoUrl =
    backgroundVideo && typeof backgroundVideo === 'object' && 'url' in backgroundVideo
      ? (backgroundVideo.url as string)
      : null

  const posterUrl =
    media && typeof media === 'object' && 'url' in media ? (media.url as string) : undefined

  return (
    <section className="ak-hero-home" data-theme="dark" aria-label="Hero" itemScope itemType="https://schema.org/WebPageElement">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPageElement', cssSelector: '.ak-hero-home' }),
        }}
      />
      <div className="ak-hero-home__media">
        {media && typeof media === 'object' && (
          <Media fill imgClassName="" priority resource={media} />
        )}
        {videoUrl && (
          <video
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            className="ak-hero-home__video ak-hero-home__video--overlay"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}
      </div>

      <div className="bp-content-grid">
        <div className="breakout">
          <div className="ak-hero-home__content">
            {richText && <RichText data={richText} enableGutter={false} />}

            {Array.isArray(links) && links.length > 0 && (
              <ul className="ak-hero-home__actions">
                {links.map(({ link }, i) => (
                  <li key={i} data-ga-event="hero_cta_click" data-ga-section="hero_high_impact">
                    <CMSLink {...link} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
