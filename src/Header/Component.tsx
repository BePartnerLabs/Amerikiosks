import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getLocale } from 'next-intl/server'
import React from 'react'
import Script from 'next/script'

export async function Header() {
  const locale = await getLocale()
  const headerData = await getCachedGlobal('header', 1, locale)()

  return (
    <>
      <Script
        id="schema-header"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SiteNavigationElement',
            name: 'Main Navigation',
          }),
        }}
      />
      <HeaderClient data={headerData} />
    </>
  )
}
