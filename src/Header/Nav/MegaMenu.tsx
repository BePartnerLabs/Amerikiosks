'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import type { Header } from '@/payload-types'
import type { Media } from '@/payload-types'

type MegaMenuData = NonNullable<
  NonNullable<Header['navItems']>[number]['megaMenu']
>

interface MegaMenuProps {
  data: MegaMenuData
  id: string
}

function isPopulatedMedia(val: unknown): val is Media {
  return typeof val === 'object' && val !== null && 'url' in val
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
      className="absolute top-full left-0 right-0 w-screen z-40 shadow-xl"
    >
      <div className="max-w-[90rem] mx-auto flex rounded-xl overflow-hidden">
        {/* Left dark panel */}
        <div
          className="w-[30%] flex-shrink-0 p-8 flex flex-col gap-4"
          style={{ backgroundColor: 'var(--ak-mega-left-bg)' }}
        >
          <span
            className="block h-0.5 w-8"
            style={{ backgroundColor: 'var(--ak-accent)' }}
            aria-hidden="true"
          />
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--ak-accent)' }}
          >
            {panelLabel}
          </p>
          <h2 className="text-2xl font-bold text-white leading-snug">
            {panelHeadline}
          </h2>
          {panelDescription && (
            <p className="text-sm text-white/60 leading-relaxed">
              {panelDescription}
            </p>
          )}
        </div>

        {/* Right white panel */}
        <div className="flex-1 bg-white p-8">
          {rightTitle && (
            <h3 className="text-lg font-bold text-gray-900 mb-1">{rightTitle}</h3>
          )}
          {rightSubtitle && (
            <p className="text-sm text-gray-500 mb-6">{rightSubtitle}</p>
          )}

          <div className="grid grid-cols-1 gap-4">
            {(items ?? []).map((item, i) => {
              const icon = isPopulatedMedia(item.icon) ? item.icon : null
              const { href, newTab } = resolveItemLink(item.link)

              return (
                <Link
                  key={item.id ?? i}
                  href={href}
                  {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  {icon && icon.url && (
                    <span className="flex-shrink-0 w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                      <Image
                        src={icon.url}
                        alt={icon.alt ?? ''}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 flex items-center gap-1">
                      {item.title}
                      <ChevronRight
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: 'var(--ak-accent)' }}
                      />
                    </p>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-0.5 leading-snug">
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
