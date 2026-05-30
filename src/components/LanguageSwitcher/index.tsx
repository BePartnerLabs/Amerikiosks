'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import React from 'react'
import './language-switcher.css'

export const LanguageSwitcher: React.FC = () => {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const switchTo = (target: 'en' | 'es') => {
    if (target === locale) return
    router.replace(pathname, { locale: target })
  }

  return (
    <div className="ak-lang-switcher">
      <button
        type="button"
        onClick={() => switchTo('en')}
        className="ak-lang-switcher__btn"
        aria-current={locale === 'en' ? 'true' : undefined}
      >
        EN
      </button>
      <span className="ak-lang-switcher__sep">|</span>
      <button
        type="button"
        onClick={() => switchTo('es')}
        className="ak-lang-switcher__btn"
        aria-current={locale === 'es' ? 'true' : undefined}
      >
        ES
      </button>
    </div>
  )
}
