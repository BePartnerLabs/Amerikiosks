import type React from 'react'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { Page } from '@/payload-types'
import './high-impact.css'

export const HighImpactHero: React.FC<Page['hero']> = ({
  links,
  media,
  backgroundVideo,
  richText,
}) => {
  const videoUrl =
    backgroundVideo && typeof backgroundVideo === 'object' && 'url' in backgroundVideo
      ? (backgroundVideo.url as string)
      : null

  // Declaring the wrong MIME type (e.g. always "video/mp4" regardless of the
  // actual uploaded file) makes browsers silently refuse to play it — a
  // WebM upload would fail even though most browsers support it natively.
  const videoMimeType =
    backgroundVideo && typeof backgroundVideo === 'object' && 'mimeType' in backgroundVideo
      ? ((backgroundVideo.mimeType as string) ?? 'video/mp4')
      : 'video/mp4'

  const _posterUrl =
    media && typeof media === 'object' && 'url' in media ? (media.url as string) : undefined

  return (
    <section
      className="ak-hero-home"
      aria-label="Hero"
      itemScope
      itemType="https://schema.org/WebPageElement"
    >
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: is a static JSON-LD script tag
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPageElement',
            cssSelector: '.ak-hero-home',
          }),
        }}
      />
      <div className="ak-hero-home__media">
        {media && typeof media === 'object' && (
          <Media
            fill
            imgClassName=""
            priority
            resource={media}
          />
        )}
        {videoUrl && (
          <video
            autoPlay
            muted
            loop
            playsInline
            tabIndex={-1}
            aria-hidden="true"
            className="ak-hero-home__video ak-hero-home__video--overlay"
          >
            <source
              src={videoUrl}
              type={videoMimeType}
            />
          </video>
        )}
      </div>

      <div className="bp-content-grid">
        <div className="breakout">
          <div className="ak-hero-home__content">
            {richText && (
              <RichText
                data={richText}
                enableGutter={false}
              />
            )}

            {Array.isArray(links) && links.length > 0 && (
              <ul className="ak-hero-home__actions">
                {links.map(({ link }) => (
                  <li
                    key={[
                      link?.type,
                      link?.label,
                      link?.url,
                      typeof link?.reference?.value === 'object' &&
                      link.reference.value !== null &&
                      'id' in link.reference.value
                        ? link.reference.value.id
                        : undefined,
                    ]
                      .filter(Boolean)
                      .join('-')}
                    data-ga-event="hero_cta_click"
                    data-ga-section="hero_high_impact"
                  >
                    <CMSLink
                      {...link}
                      className={
                        link?.appearance === 'outline' ? 'bp-btn--outline-solid' : undefined
                      }
                    />
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
