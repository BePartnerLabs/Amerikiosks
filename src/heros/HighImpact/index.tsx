'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import './high-impact.css'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  return (
    <section className="ak-hero-home" data-theme="dark">
      {media && typeof media === 'object' && (
        <div className="ak-hero-home__media">
          <Media fill imgClassName="" priority resource={media} />
        </div>
      )}

      <div className="bp-content-grid">
        <div className="breakout">
          <div className="ak-hero-home__content">
            {richText && <RichText data={richText} enableGutter={false} />}

            {Array.isArray(links) && links.length > 0 && (
              <ul className="ak-hero-home__actions">
                {links.map(({ link }, i) => (
                  <li key={i}>
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
