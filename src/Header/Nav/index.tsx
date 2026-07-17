'use client'

import { ChevronDown } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import { CMSLink } from '@/components/Link'
import type { Header as HeaderType } from '@/payload-types'
import { MegaMenu } from './MegaMenu'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = (data?.navItems || []).filter((item) => !item.hidden)
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <nav
      className="bp-header__nav"
      aria-label="Main"
    >
      <ul className="bp-nav">
        {navItems.map(({ link, hasMegaMenu, megaMenu, id }, i) => {
          const itemId = id ?? `nav-${i}`
          const panelId = `megamenu-${itemId}`
          const isOpen = openId === itemId

          if (hasMegaMenu && megaMenu) {
            return (
              <li
                key={itemId}
                className="bp-nav__item"
              >
                <button
                  type="button"
                  className="bp-nav__megamenu-btn"
                  popoverTarget={panelId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  data-ga-event="navigation_click"
                  data-ga-section="header"
                  data-ga-label={link.label ?? ''}
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
                  <MegaMenu
                    data={megaMenu}
                    id={panelId}
                  />
                </div>
              </li>
            )
          }

          return (
            <li
              key={itemId}
              data-ga-event="navigation_click"
              data-ga-section="header"
              data-ga-label={link.label ?? ''}
            >
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
