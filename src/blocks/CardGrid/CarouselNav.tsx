'use client'

import type { ReactNode } from 'react'
import { Carousel } from '@/components/Carousel'

export const CardGridCarousel: React.FC<{ children: ReactNode; label?: string }> = ({
  children,
  label,
}) => (
  <Carousel
    trackLabel={label}
    panelSelector=".ak-card-grid__card"
    className="ak-card-grid__carousel"
    trackClassName="ak-card-grid__cards"
    navClassName="ak-card-grid__carousel-nav"
    buttonClassName="ak-card-grid__carousel-btn"
  >
    {children}
  </Carousel>
)
