'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { MegaMenu } from './MegaMenu'

const handleNavClick = (label: string) => {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    ;(window as any).gtag('event', 'navigation_click', {
      nav_item: label,
      location: 'header',
    })
  }
}

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <nav className="bp-header__nav" aria-label="Main">
      <ul className="bp-nav" role="list">
        {navItems.map(({ link, hasMegaMenu, megaMenu, id }, i) => {
          const itemId = id ?? `nav-${i}`
          const panelId = `megamenu-${itemId}`
          const isOpen = openId === itemId

          if (hasMegaMenu && megaMenu) {
            return (
              <li key={itemId} className="bp-nav__item">
                <button
                  type="button"
                  className="bp-nav__megamenu-btn"
                  popoverTarget={panelId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => handleNavClick(link.label ?? '')}
                >
                  {link.label}
                  <ChevronDown
                    className="bp-nav__chevron"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id={panelId}
                  className="bp-nav__megamenu"
                  popover="auto"
                  onToggle={(e) => {
                    const open = (e.currentTarget as HTMLElement).matches(':popover-open')
                    setOpenId(open ? itemId : null)
                  }}
                >
                  <MegaMenu data={megaMenu} id={panelId} />
                </div>
              </li>
            )
          }

          return (
            <li key={itemId} onClick={() => handleNavClick(link.label ?? '')}>
              <CMSLink
                {...link}
                appearance="link"
                className="bp-nav__link"
              />
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
