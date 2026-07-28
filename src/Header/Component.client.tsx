'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import type React from 'react'
import { useEffect, useRef } from 'react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { type SocialLink, SocialLinks } from '@/components/SocialLinks'
import type { Header } from '@/payload-types'
import { HeaderNav } from './Nav'
import './header.css'

const MobileMenu = dynamic(() => import('./MobileMenu').then((m) => ({ default: m.MobileMenu })), {
  ssr: false,
  loading: () => null,
})

interface HeaderClientProps {
  data: Header
  socialLinks?: SocialLink[] | null
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, socialLinks }) => {
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const sentinel = document.getElementById('header-sentinel')
    const header = headerRef.current
    if (!sentinel || !header) return
    const observer = new IntersectionObserver(
      ([entry]) => header.classList.toggle('is-scrolled', !entry.isIntersecting),
      { rootMargin: '-1px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div
        id="header-sentinel"
        aria-hidden="true"
      />
      <header
        ref={headerRef}
        className="bp-header"
      >
        <div className="bp-content-grid">
          <div className="breakout bp-header__inner">
            <Link
              href="/"
              className="bp-header__logo"
              aria-label="Go to homepage"
            >
              <Logo />
            </Link>

            <HeaderNav data={data} />

            <div className="bp-header__actions">
              <SocialLinks
                links={socialLinks}
                variant="header"
              />
              {data.showLanguageSwitcher && <LanguageSwitcher />}
              {data.cta && (data.cta.type === 'modal' ? data.cta.modalForm : data.cta.url) && (
                <span
                  data-ga-event="cta_click"
                  data-ga-section="header"
                  data-ga-label={data.cta.label ?? ''}
                >
                  <CMSLink
                    type={data.cta.type ?? 'custom'}
                    url={data.cta.url}
                    modalForm={data.cta.modalForm}
                    label={data.cta.label}
                    appearance="default"
                    className="bp-header__cta--desktop"
                  />
                </span>
              )}
              <MobileMenu
                data={data}
                socialLinks={socialLinks}
              />
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
