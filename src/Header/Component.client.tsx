'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'
import { Logo } from '@/components/Logo/Logo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { HeaderNav } from './Nav'

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
      className="sticky top-0 z-50 w-full relative"
      style={{ backgroundColor: 'var(--ak-header-bg)' }}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="max-w-[90rem] mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex-shrink-0">
          <Logo loading="eager" priority="high" className="invert-0" />
        </Link>

        <HeaderNav data={data} />

        <div className="flex items-center gap-4 flex-shrink-0">
          <LanguageSwitcher />
          <Link
            href="/start-a-partnership"
          className="ak-btn-cta inline-flex items-center px-5 py-2.5 rounded-md text-sm font-semibold transition-colors"
          >
            Start a Partnership
          </Link>
        </div>
      </div>
    </header>
  )
}
