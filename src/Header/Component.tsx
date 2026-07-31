import Script from 'next/script'
import { getLocale } from 'next-intl/server'
import { isGatedPath } from '@/utilities/gatedPaths'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { HeaderClient } from './Component.client'

export async function Header() {
  const locale = await getLocale()
  const [headerData, settings] = await Promise.all([
    getCachedGlobal('header', 1, locale)(),
    getCachedGlobal('settings', 0, locale)(),
  ])

  // Offering a language nobody can reach is worse than not offering it: with
  // /es gated, the switcher would send every anonymous visitor into a redirect
  // back to where they started.
  const spanishIsGated = isGatedPath('/es')
  const data = {
    ...headerData,
    showLanguageSwitcher: headerData.showLanguageSwitcher && !spanishIsGated,
  }

  return (
    <>
      <Script
        id="schema-header"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: is a json-ld script tag, not user-generated content
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SiteNavigationElement',
            name: 'Main Navigation',
          }),
        }}
      />
      <HeaderClient
        data={data}
        socialLinks={settings?.socialLinks}
      />
    </>
  )
}
