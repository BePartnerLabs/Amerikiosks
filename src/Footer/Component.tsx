import { getCachedGlobal } from '@/utilities/getGlobals'
import { FooterContent } from './FooterContent'
import './footer.css'

export async function Footer() {
  const { getLocale } = await import('next-intl/server')
  const locale = await getLocale()
  const [footer, settings] = await Promise.all([
    getCachedGlobal('footer', 1, locale)(),
    getCachedGlobal('settings', 0, locale)(),
  ])

  return (
    <FooterContent
      footer={footer ?? {}}
      socialLinks={settings?.socialLinks}
    />
  )
}
