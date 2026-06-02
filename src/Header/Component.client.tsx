'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Logo } from '@/components/Logo/Logo'
import type { Header } from '@/payload-types'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { HeaderNav } from './Nav'
import './header.css'

const MobileMenu = dynamic(() => import('./MobileMenu').then((m) => ({ default: m.MobileMenu })), {
  ssr: false,
  loading: () => null,
})

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const _pathname = usePathname()
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setHeaderTheme])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme, theme])

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
        style={{ height: '1px' }}
      />
      <header
        ref={headerRef}
        className="bp-header"
        {...(theme ? { 'data-theme': theme } : {})}
      >
        <div className="bp-content-grid">
          <div className="breakout bp-header__inner">
            <Link
              href="/"
              className="bp-header__logo"
              aria-label="Go to homepage"
            >
              <Logo
                loading="eager"
                priority="high"
              />
            </Link>

            <HeaderNav data={data} />

            <div className="bp-header__actions">
              <LanguageSwitcher />
              {data.cta?.url && (
                <Link
                  href={data.cta.url}
                  className="bp-btn bp-btn--primary bp-header__cta--desktop"
                  data-ga-event="cta_click"
                  data-ga-section="header"
                  data-ga-label={data.cta.label ?? ''}
                >
                  {data.cta.label}
                </Link>
              )}
              <MobileMenu data={data} />
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
