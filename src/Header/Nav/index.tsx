'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { MegaMenu } from './MegaMenu'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const [openId, setOpenId] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

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
      ref={navRef}
      className=""
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
              onMouseEnter={() => open(itemId)}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                className=""
                onClick={() => toggle(itemId)}
              >
                {link.label}
                <ChevronDown
                  className=""
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
            className=""
          />
        )
      })}
    </nav>
  )
}
