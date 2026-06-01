'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { MegaMenu } from './MegaMenu'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const [openId, setOpenId] = useState<string | null>(null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!openId) return
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openId])

  const toggle = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id))
  }, [])

  const closeOnEscape = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpenId(null)
  }, [])

  return (
    <nav
      ref={navRef}
      className="ak-header-nav"
      onKeyDown={closeOnEscape}
      aria-label="Main navigation"
    >
      {navItems.map(({ link, hasMegaMenu, megaMenu, id }, i) => {
        const itemId = id ?? `nav-${i}`
        const panelId = `megamenu-${itemId}`
        const isOpen = openId === itemId

        if (hasMegaMenu && megaMenu) {
          return (
            <div key={itemId} className="ak-header-nav__item">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="ak-header-nav__btn"
                onClick={() => toggle(itemId)}
              >
                {link.label}
                <ChevronDown
                  className="ak-header-nav__chevron"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  aria-hidden="true"
                />
              </button>

              {isOpen && (
                <div className="ak-header-nav__megamenu-wrap">
                  <MegaMenu data={megaMenu} id={panelId} />
                </div>
              )}
            </div>
          )
        }

        return (
          <CMSLink
            key={itemId}
            {...link}
            appearance="link"
            className="ak-header-nav__link"
          />
        )
      })}
    </nav>
  )
}
