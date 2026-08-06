'use client'

import type { ReactNode } from 'react'
import { Carousel } from '@/components/Carousel'

export const ProcessStepsCarousel: React.FC<{ children: ReactNode }> = ({ children }) => (
  <Carousel
    panelSelector=".ak-process-steps__item"
    className="ak-process-steps__carousel"
    trackClassName="ak-process-steps__list"
    navClassName="ak-process-steps__carousel-nav"
    buttonClassName="ak-process-steps__carousel-btn"
    // The panels are `li`, so the track has to stay an `ol`.
    trackAs="ol"
  >
    {children}
  </Carousel>
)
