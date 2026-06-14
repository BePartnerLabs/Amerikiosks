'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import type React from 'react'
import { useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { PagesRepository } from '@/repositories'
import './language-switcher.css'

type Locale = 'en' | 'es'

export const LanguageSwitcher: React.FC = () => {
  const locale = useLocale() as Locale
  const params = useParams()
  const router = useRouter()
  const [active, setActive] = useState<Locale>(locale)

  const currentSlug = (params?.slug as string) ?? 'home'
  const targetLocale: Locale = active === 'en' ? 'es' : 'en'

  // Prefetch the translated slug for the opposite locale so the first toggle is instant
  const { data: translatedSlug } = useQuery({
    queryKey: ['translate-slug', currentSlug, locale, targetLocale],
    queryFn: () => PagesRepository.translateSlug(currentSlug, locale, targetLocale),
    enabled: currentSlug !== 'home',
    staleTime: Infinity,
  })

  const switchTo = (target: Locale) => {
    if (target === active) return

    const targetSlug = target === targetLocale ? (translatedSlug ?? currentSlug) : currentSlug
    const pathname = targetSlug === 'home' ? '/' : `/${targetSlug}`

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
