import type React from 'react'
import RichText from '@/components/RichText'
import type { Page } from '@/payload-types'
import './simple.css'

type SimpleHeroType = Omit<Page['hero'], 'richText'> & {
  richText?: Page['hero']['richText']
  breadcrumbs?: Page['breadcrumbs']
}

export const SimpleHero: React.FC<SimpleHeroType> = ({ richText, tags }) => {
  return (
    <section
      className="ak-hero-simple"
      aria-label="Page hero"
    >
      <div className="bp-content-grid">
        <div className="breakout ak-hero-simple__inner">
          {richText && (
            <div className="ak-hero-simple__heading">
              <RichText
                data={richText}
                enableGutter={false}
              />
            </div>
          )}

          {Array.isArray(tags) && tags.length > 0 && (
            <ul className="ak-hero-simple__tags">
              {tags.map(({ label, id }, i) => (
                <li key={id ?? i}>
                  <span className="ak-hero-simple__tag">{label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
