'use client'

import { ChevronDown } from 'lucide-react'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { CMSLink } from '@/components/Link'
import type { Header as HeaderType } from '@/payload-types'
import { MegaMenu } from './MegaMenu'

type PopoverEl = HTMLElement & { showPopover?: () => void; hidePopover?: () => void }

// Keep in sync with the megamenu fade duration (--bp-duration-normal in megamenu.css)
// so switching panels reads as a clean fade-out-then-fade-in.
const MEGAMENU_SWITCH_DELAY = 220

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = (data?.navItems || []).filter((item) => !item.hidden)
  const [openId, setOpenId] = useState<string | null>(null)
  const panelRefs = useRef<Map<string, PopoverEl>>(new Map())
  const navRef = useRef<HTMLElement>(null)

  // popover="manual" opts out of native light-dismiss, so re-implement
  // outside-click and Escape-to-close ourselves.
  useEffect(() => {
    if (!openId) return

    const close = () => panelRefs.current.get(openId)?.hidePopover?.()

    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) close()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openId])

  return (
    <nav
      ref={navRef}
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
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  data-ga-event="navigation_click"
                  data-ga-section="header"
                  data-ga-label={link.label ?? ''}
                  onClick={() => {
                    const target = panelRefs.current.get(itemId)
                    if (!target) return

                    if (isOpen) {
                      target.hidePopover?.()
                      return
                    }

                    // Close whatever panel is currently open first so its exit
                    // transition can run, then open the new one on the next
                    // frame — switching popovers in the same tick skips both
                    // transitions.
                    const currentlyOpen = openId ? panelRefs.current.get(openId) : null
                    if (currentlyOpen) {
                      currentlyOpen.hidePopover?.()
                      setTimeout(() => target.showPopover?.(), MEGAMENU_SWITCH_DELAY)
                    } else {
                      target.showPopover?.()
                    }
                  }}
                >
                  {link.label}
                  <ChevronDown
                    className="bp-nav__chevron"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    aria-hidden="true"
                  />
                </button>
                <div
                  ref={(el) => {
                    if (el) panelRefs.current.set(itemId, el)
                    else panelRefs.current.delete(itemId)
                  }}
                  id={panelId}
                  className="bp-nav__megamenu"
                  popover="manual"
                  onToggle={(e) => {
                    const open = (e.currentTarget as HTMLElement).matches(':popover-open')
                    setOpenId(open ? itemId : null)
                  }}
                  onClickCapture={(e) => {
                    if ((e.target as HTMLElement).closest('a, button')) {
                      ;(e.currentTarget as PopoverEl).hidePopover?.()
                    }
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
