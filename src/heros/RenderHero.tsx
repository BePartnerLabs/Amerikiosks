import type React from 'react'
import { HighImpactHero } from '@/heros/HighImpact'
import { LowImpactHero } from '@/heros/LowImpact'
import { MediumImpactHero } from '@/heros/MediumImpact'
import { SimpleHero } from '@/heros/Simple'
import type { Page } from '@/payload-types'

const heroes = {
  highImpact: HighImpactHero,
  lowImpact: LowImpactHero,
  mediumImpact: MediumImpactHero,
  simple: SimpleHero,
}

type Props = Page['hero'] & { breadcrumbs?: Page['breadcrumbs'] }

export const RenderHero: React.FC<Props> = ({ breadcrumbs, ...props }) => {
  const { type } = props || {}

  if (!type || type === 'none') return null

  const HeroToRender = heroes[type]

  if (!HeroToRender) return null

  return (
    <HeroToRender
      {...props}
      breadcrumbs={breadcrumbs}
    />
  )
}
