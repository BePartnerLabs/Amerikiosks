'use client'

import { useLocale } from 'next-intl'
import type React from 'react'
import { useState } from 'react'
import { usePathname, useRouter } from '@/i18n/routing'
import './language-switcher.css'

export const LanguageSwitcher: React.FC = () => {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  // Optimistic local state so the indicator moves instantly on click
  const [active, setActive] = useState<'en' | 'es'>(locale as 'en' | 'es')

  const switchTo = (target: 'en' | 'es') => {
    if (target === active) return

    const update = () => {
      setActive(target)
      router.replace(pathname, { locale: target })
    }

    if ('startViewTransition' in document) {
      document.startViewTransition(update)
    } else {
      update()
    }
  }

  return (
    <fieldset
      className="ak-lang-switcher"
      data-locale={active}
    >
      <legend className="ak-lang-switcher__legend">Language</legend>
      <span
        className="ak-lang-switcher__indicator"
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={() => switchTo('en')}
        className="ak-lang-switcher__btn"
        aria-pressed={active === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => switchTo('es')}
        className="ak-lang-switcher__btn"
        aria-pressed={active === 'es'}
      >
        ES
      </button>
    </fieldset>
  )
}
