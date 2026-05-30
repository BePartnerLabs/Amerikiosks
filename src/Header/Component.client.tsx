'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'
import { Logo } from '@/components/Logo/Logo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { HeaderNav } from './Nav'
import './header.css'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header
      className="bp-header"
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="bp-header__inner">
        <Link href="/" className="bp-header__logo">
          <Logo loading="eager" priority="high" />
        </Link>

        <HeaderNav data={data} />

        <div className="bp-header__actions">
          <LanguageSwitcher />
          {data.cta?.url && (
            <Link href={data.cta.url} className="bp-btn bp-btn--primary">
              {data.cta.label}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
