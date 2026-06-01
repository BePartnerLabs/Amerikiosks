import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import { FooterContent } from './FooterContent'
import './footer.css'

export async function Footer() {
  const { getLocale } = await import('next-intl/server')
  const locale = await getLocale()
  const footer = await getCachedGlobal('footer', 1, locale)()

  return <FooterContent footer={footer ?? {}} />
}
