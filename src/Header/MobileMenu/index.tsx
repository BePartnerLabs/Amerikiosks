'use client'

import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'
import { Icon } from '@/components/Icon'
import type { Header } from '@/payload-types'
import '../Nav/megamenu.css'
import './mobile-menu.css'

type NavItem = NonNullable<Header['navItems']>[number]
type MegaItem = NonNullable<NonNullable<NavItem['megaMenu']>['items']>[number]

interface MobileMenuProps {
  data: Header
}

// ── Module-scope helpers (no component state needed) ───────────────────────

const resolveHref = (item: NavItem): string => {
  const { link } = item
  if (link.type === 'custom' && link.url) return link.url
  if (link.type === 'reference' && link.reference && typeof link.reference.value === 'object') {
    const slug = (link.reference.value as { slug?: string }).slug ?? ''
    return link.reference.relationTo === 'pages'
      ? `/${slug}`
      : `/${link.reference.relationTo}/${slug}`
  }
  return '#'
}

const resolveMegaItemHref = (item: MegaItem): string => {
  const link = item.link
  if (!link) return '#'
  if (link.type === 'custom' && link.url) return link.url
  if (link.type === 'reference' && link.reference && typeof link.reference.value === 'object') {
    const slug = (link.reference.value as { slug?: string }).slug ?? ''
    return link.reference.relationTo === 'pages'
      ? `/${slug}`
      : `/${link.reference.relationTo}/${slug}`
  }
  return '#'
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ data }) => {
  const [open, setOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<NavItem | null>(null)
  const navItems = data?.navItems || []

  const hamburgerRef = React.useRef<HTMLButtonElement>(null)
  const closeButtonRef = React.useRef<HTMLButtonElement>(null)

  const openMenu = useCallback(() => setOpen(true), [])
  const closeMenu = useCallback(() => {
    setOpen(false)
    setActivePanel(null)
  }, [])
  const goBack = useCallback(() => setActivePanel(null), [])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Focus management
  useEffect(() => {
    if (open) {
      // small delay to let transition start
      const t = setTimeout(() => closeButtonRef.current?.focus(), 50)
      return () => clearTimeout(t)
    } else {
      hamburgerRef.current?.focus()
    }
  }, [open])

  return (
    <>
      {/* Hamburger button */}
      <button
        ref={hamburgerRef}
        type="button"
        className="ak-mobile-hamburger"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="ak-mobile-sheet"
        data-ga-event="mobile_menu_open"
        data-ga-section="header"
        onClick={openMenu}
      >
        <span
          className="ak-mobile-hamburger__bar"
          aria-hidden="true"
        />
        <span
          className="ak-mobile-hamburger__bar"
          aria-hidden="true"
        />
        <span
          className="ak-mobile-hamburger__bar ak-mobile-hamburger__bar--short"
          aria-hidden="true"
        />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="ak-mobile-backdrop"
          aria-hidden="true"
          onClick={closeMenu}
        />
      )}

      {/* Bottom sheet — inert removes focus from closed sheet (fixes aria-hidden-focus) */}
      <div
        id="ak-mobile-sheet"
        className={`ak-mobile-sheet${open ? ' ak-mobile-sheet--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!open}
        inert={!open || undefined}
      >
        {/* Sheet handle */}
        <div
          className="ak-mobile-sheet__handle"
          aria-hidden="true"
        />

        {/* Sheet header */}
        <div className="ak-mobile-sheet__header">
          {activePanel ? (
            <button
              type="button"
              className="ak-mobile-sheet__back"
              onClick={goBack}
              aria-label="Back to main menu"
            >
              ‹
            </button>
          ) : (
            <div aria-hidden="true" />
          )}
          {activePanel?.megaMenu?.panelLabel && (
            <span className="ak-mobile-sheet__panel-label">{activePanel.megaMenu.panelLabel}</span>
          )}
          <button
            ref={closeButtonRef}
            type="button"
            className="ak-mobile-sheet__close"
            onClick={closeMenu}
            aria-label="Close navigation menu"
          >
            ✕
          </button>
        </div>

        {/* Panels container — slides left when sub-panel active */}
        <div
          className={`ak-mobile-sheet__panels${activePanel ? ' ak-mobile-sheet__panels--sub' : ''}`}
        >
          {/* Main panel */}
          <div
            className="ak-mobile-sheet__panel ak-mobile-sheet__panel--main"
            aria-hidden={!!activePanel}
          >
            <div className="ak-mobile-main-nav">
              {navItems.map((item, i) => {
                const hasMega = item.hasMegaMenu && item.megaMenu
                return hasMega ? (
                  <button
                    key={item.id ?? i}
                    type="button"
                    className="ak-mobile-nav-card ak-mobile-nav-card--mega"
                    onClick={() => setActivePanel(item)}
                    aria-haspopup="dialog"
                  >
                    <span className="ak-mobile-nav-card__eyebrow">{item.megaMenu?.panelLabel}</span>
                    <span className="ak-mobile-nav-card__label">
                      {item.megaMenu?.panelHeadline ?? item.link.label}
                    </span>
                    <span
                      className="ak-mobile-nav-card__arrow"
                      aria-hidden="true"
                    >
                      ›
                    </span>
                  </button>
                ) : (
                  <Link
                    key={item.id ?? i}
                    href={resolveHref(item)}
                    className="ak-mobile-nav-card"
                    onClick={closeMenu}
                  >
                    <span className="ak-mobile-nav-card__label">{item.link.label}</span>
                  </Link>
                )
              })}
            </div>

            {data.cta?.url && (
              <Link
                href={data.cta.url}
                className="ak-mobile-sheet__cta bp-btn bp-btn--primary"
                data-ga-event="cta_click"
                data-ga-section="header"
                data-ga-label={data.cta.label ?? ''}
                onClick={closeMenu}
              >
                {data.cta.label}
              </Link>
            )}
          </div>

          {/* Sub panel */}
          <div
            className="ak-mobile-sheet__panel ak-mobile-sheet__panel--sub"
            aria-hidden={!activePanel}
          >
            {activePanel?.megaMenu && (
              <>
                {activePanel.megaMenu.panelDescription && (
                  <p className="ak-mega__description">{activePanel.megaMenu.panelDescription}</p>
                )}
                <div className="ak-mega__items">
                  {(activePanel.megaMenu.items ?? []).map((item, i) => (
                    <Link
                      key={item.id ?? i}
                      href={resolveMegaItemHref(item)}
                      className="ak-mega__item"
                      onClick={closeMenu}
                    >
                      {item.icon && (
                        <span className="ak-mega__item-icon">
                          <Icon name={item.icon} />
                        </span>
                      )}
                      <div className="ak-mega__item-body">
                        <p className="ak-mega__item-title">{item.title}</p>
                        {item.description && (
                          <p className="ak-mega__item-desc">{item.description}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
