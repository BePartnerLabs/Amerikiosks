'use client'

import type { ReactNode } from 'react'
import { Carousel } from '@/components/Carousel'

export const CardGridCarousel: React.FC<{ children: ReactNode }> = ({ children }) => (
  <Carousel
    panelSelector=".ak-card-grid__card"
    className="ak-card-grid__carousel"
    trackClassName="ak-card-grid__cards"
    navClassName="ak-card-grid__carousel-nav"
    buttonClassName="ak-card-grid__carousel-btn"
  >
    {children}
  </Carousel>
)
