'use client'

import React, { useCallback, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { MegaMenu } from './MegaMenu'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const [openId, setOpenId] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const open = useCallback((id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenId(id)
  }, [])

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpenId(null), 150)
  }, [])

  const toggle = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id))
  }, [])

  const closeOnEscape = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpenId(null)
  }, [])

  return (
    <nav
      className="flex gap-1 items-center"
      onKeyDown={closeOnEscape}
      aria-label="Main navigation"
    >
      {navItems.map(({ link, hasMegaMenu, megaMenu, id }, i) => {
        const itemId = id ?? `nav-${i}`
        const panelId = `megamenu-${itemId}`
        const isOpen = openId === itemId

        if (hasMegaMenu && megaMenu) {
          return (
            <div
              key={itemId}
              className="relative"
              onMouseEnter={() => open(itemId)}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors"
                onClick={() => toggle(itemId)}
              >
                {link.label}
                <ChevronDown
                  className="w-4 h-4 transition-transform duration-200"
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                  aria-hidden="true"
                />
              </button>

              {isOpen && (
                <div
                  onMouseEnter={() => open(itemId)}
                  onMouseLeave={scheduleClose}
                >
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
            className="px-3 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors"
          />
        )
      })}
    </nav>
  )
}
