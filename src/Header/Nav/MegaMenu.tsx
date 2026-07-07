'use client'

import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type React from 'react'

import { Icon } from '@/components/Icon'
import type { Header } from '@/payload-types'
import './megamenu.css'

type MegaMenuData = NonNullable<NonNullable<Header['navItems']>[number]['megaMenu']>

interface MegaMenuProps {
  data: MegaMenuData
  id: string
}

function resolveItemLink(link: NonNullable<MegaMenuData['items']>[number]['link']): {
  href: string
  newTab: boolean
} {
  if (!link) return { href: '#', newTab: false }
  const newTab = Boolean(link.newTab)
  if (link.type === 'custom' && link.url) return { href: link.url, newTab }
  if (link.type === 'reference' && link.reference) {
    const ref = link.reference
    if (ref.relationTo === 'pages' && typeof ref.value === 'object') {
      return { href: `/${ref.value.slug ?? ''}`, newTab }
    }
    if (ref.relationTo === 'insights' && typeof ref.value === 'object') {
      return { href: `/posts/${ref.value.slug ?? ''}`, newTab }
    }
  }
  return { href: '#', newTab }
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ data, id: _id }) => {
  const { panelLabel, panelHeadline, panelDescription, rightTitle, rightSubtitle, items } = data

  return (
    <section className="ak-mega">
      <div className="ak-mega__inner">
        {/* Left dark panel */}
        <div className="ak-mega__left">
          <span
            className="ak-mega__accent-bar"
            aria-hidden="true"
          />
          <p className="ak-mega__eyebrow">{panelLabel}</p>
          <h2 className="ak-mega__headline">{panelHeadline}</h2>
          {panelDescription && <p className="ak-mega__description">{panelDescription}</p>}
        </div>

        {/* Right panel */}
        <div className="ak-mega__right">
          {rightTitle && <h3 className="ak-mega__right-title">{rightTitle}</h3>}
          {rightSubtitle && <p className="ak-mega__right-subtitle">{rightSubtitle}</p>}

          <div className="ak-mega__items">
            {(items ?? []).map((item, i) => {
              const { href, newTab } = resolveItemLink(item.link)
              return (
                <Link
                  key={item.id ?? i}
                  href={href}
                  {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="ak-mega__item"
                >
                  {item.icon && (
                    <span className="ak-mega__item-icon">
                      <Icon name={item.icon} />
                    </span>
                  )}
                  <div className="ak-mega__item-body">
                    <p className="ak-mega__item-title">
                      {item.title}
                      <ChevronRight
                        className="ak-mega__item-chevron"
                        aria-hidden="true"
                      />
                    </p>
                    {item.description && <p className="ak-mega__item-desc">{item.description}</p>}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
