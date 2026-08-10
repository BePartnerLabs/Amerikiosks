'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import type React from 'react'
import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { PagesRepository } from '@/repositories'
import './language-switcher.css'

type Locale = 'en' | 'es'

export const LanguageSwitcher: React.FC = () => {
  const locale = useLocale() as Locale
  const params = useParams()
  const router = useRouter()
  const [active, setActive] = useState<Locale>(locale)

  // /machines/[family] and /machines/[family]/[slug] have their own pathnames
  // mapping (-> /maquinas/...) and aren't CMS Pages, so they're handled
  // separately from the generic translate-slug flow used by `/[slug]` pages.
  //
  // The listing itself used to be here too. It is a CMS Page now — slug
  // `machines` in EN, `maquinas` in ES — so it goes through the generic flow
  // like any other page: `params.slug` is already `machines`, and
  // `translateSlug` resolves the sibling locale. Keeping a special case would
  // hardcode a slug the editor is free to rename in /admin.
  const unprefixedPath =
    typeof window !== 'undefined' ? window.location.pathname.replace(/^\/(en|es)/, '') || '/' : ''
  const isFamilyDetail = /^\/(machines|maquinas)\/[^/]+\/?$/.test(unprefixedPath)
  const isMachineDetail = /^\/(machines|maquinas)\/[^/]+\/[^/]+\/?$/.test(unprefixedPath)
  const familySlug = isFamilyDetail || isMachineDetail ? (params?.family as string) : undefined
  const machineSlug = isMachineDetail ? (params?.slug as string) : undefined

  const currentSlug = (params?.slug as string) ?? 'home'
  const targetLocale: Locale = active === 'en' ? 'es' : 'en'
  const isMachinesRoute = isFamilyDetail || isMachineDetail

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
      if (isMachineDetail && familySlug && machineSlug) {
        router.replace(
          {
            pathname: '/machines/[family]/[slug]',
            params: { family: familySlug, slug: machineSlug },
          },
          { locale: target },
        )
      } else if (isFamilyDetail && familySlug) {
        router.replace(
          { pathname: '/machines/[family]', params: { family: familySlug } },
          { locale: target },
        )
      } else {
        const targetSlug = target === targetLocale ? (translatedSlug ?? currentSlug) : currentSlug
        const pathname = targetSlug === 'home' ? '/' : `/${targetSlug}`
        // El slug de una página de CMS no puede estar en `pathnames` — se
        // inventa en /admin, no en el código — así que el router tipado no lo
        // conoce. next-intl deja pasar tal cual cualquier ruta no declarada, que
        // es exactamente lo que hace falta aquí.
        //
        // El doble cast es necesario desde que `/machines` salió de `pathnames`:
        // mientras estaba, la unión incluía un literal string y `as` bastaba.
        // Ahora solo quedan las dos rutas dinámicas de objeto y no hay
        // solapamiento con string.
        router.replace(pathname as unknown as Parameters<typeof router.replace>[0], {
          locale: target,
        })
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
