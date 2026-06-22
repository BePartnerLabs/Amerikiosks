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

  // /machines and /machines/[slug] have their own pathnames mapping
  // (-> /maquinas) and aren't CMS Pages, so they're handled separately
  // from the generic translate-slug flow used by `/[slug]` pages.
  const unprefixedPath =
    typeof window !== 'undefined' ? window.location.pathname.replace(/^\/(en|es)/, '') || '/' : ''
  const isMachinesListing = /^\/(machines|maquinas)\/?$/.test(unprefixedPath)
  const isMachineDetail = /^\/(machines|maquinas)\/[^/]+\/?$/.test(unprefixedPath)
  const machineSlug = isMachineDetail ? (params?.slug as string) : undefined

  const currentSlug = (params?.slug as string) ?? 'home'
  const targetLocale: Locale = active === 'en' ? 'es' : 'en'
  const isMachinesRoute = isMachinesListing || isMachineDetail

  // Prefetch the translated slug for the opposite locale so the first toggle is instant
  const { data: translatedSlug } = useQuery({
    queryKey: ['translate-slug', currentSlug, locale, targetLocale],
    queryFn: () => PagesRepository.translateSlug(currentSlug, locale, targetLocale),
    enabled: currentSlug !== 'home' && !isMachinesRoute,
    staleTime: Infinity,
  })

  const switchTo = (target: Locale) => {
    if (target === active) return

    const update = () => {
      setActive(target)
      if (isMachineDetail && machineSlug) {
        router.replace(
          { pathname: '/machines/[slug]', params: { slug: machineSlug } },
          { locale: target },
        )
      } else if (isMachinesListing) {
        router.replace({ pathname: '/machines' }, { locale: target })
      } else {
        const targetSlug = target === targetLocale ? (translatedSlug ?? currentSlug) : currentSlug
        const pathname = targetSlug === 'home' ? '/' : `/${targetSlug}`
        router.replace(pathname as Parameters<typeof router.replace>[0], { locale: target })
      }
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
