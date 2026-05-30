'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import React from 'react'

export const LanguageSwitcher: React.FC = () => {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const switchTo = (target: 'en' | 'es') => {
    if (target === locale) return
    router.replace(pathname, { locale: target })
  }

  return (
    <div className="">
      <button
        type="button"
        onClick={() => switchTo('en')}
        className=""
        aria-current={locale === 'en' ? 'true' : undefined}
      >
        EN
      </button>
      <span className="">|</span>
      <button
        type="button"
        onClick={() => switchTo('es')}
        className=""
        aria-current={locale === 'es' ? 'true' : undefined}
      >
        ES
      </button>
    </div>
  )
}
