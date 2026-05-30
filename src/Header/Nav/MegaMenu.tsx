'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import type { Header } from '@/payload-types'

type MegaMenuData = NonNullable<
  NonNullable<Header['navItems']>[number]['megaMenu']
>

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
    if (ref.relationTo === 'posts' && typeof ref.value === 'object') {
      return { href: `/posts/${ref.value.slug ?? ''}`, newTab }
    }
  }
  return { href: '#', newTab }
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ data, id }) => {
  const {
    panelLabel,
    panelHeadline,
    panelDescription,
    rightTitle,
    rightSubtitle,
    items,
  } = data

  return (
    <div
      id={id}
      role="region"
      className=""
      style={{ backgroundColor: 'var(--ak-header-bg)' }}
    >
      <div className="">
        {/* Left dark panel */}
        <div
          className=""
          style={{ backgroundColor: 'var(--ak-mega-left-bg)' }}
        >
          <span
            className=""
            style={{ backgroundColor: 'var(--ak-accent)' }}
            aria-hidden="true"
          />
          <p
            className=""
            style={{ color: 'var(--ak-accent)' }}
          >
            {panelLabel}
          </p>
          <h2 className="">
            {panelHeadline}
          </h2>
          {panelDescription && (
            <p className="">
              {panelDescription}
            </p>
          )}
        </div>

        {/* Right white panel */}
        <div className="">
          {rightTitle && (
            <h3 className="">{rightTitle}</h3>
          )}
          {rightSubtitle && (
            <p className="">{rightSubtitle}</p>
          )}

          <div className="">
            {(items ?? []).map((item, i) => {
              const { href, newTab } = resolveItemLink(item.link)

              return (
                <Link
                  key={item.id ?? i}
                  href={href}
                  {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className=""
                >
                  {item.icon && (
                    <span className="">
                      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                        {item.icon}
                      </span>
                    </span>
                  )}
                  <div className="">
                    <p className="">
                      {item.title}
                      <ChevronRight
                        className=""
                        style={{ color: 'var(--ak-accent)' }}
                      />
                    </p>
                    {item.description && (
                      <p className="">
                        {item.description}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
