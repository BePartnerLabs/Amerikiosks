import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  const { getLocale } = await import('next-intl/server')
  const locale = await getLocale()
  const footerData = await getCachedGlobal('footer', 1, locale)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="">
      <div className="">
        <Link className="" href="/">
          <Logo />
        </Link>

        <div className="">
          <ThemeSelector />
          <nav className="">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="" key={i} {...link} />
            })}
          </nav>
        </div>
      </div>
    </footer>
  )
}
