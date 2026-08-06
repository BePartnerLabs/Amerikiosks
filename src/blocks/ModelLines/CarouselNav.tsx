'use client'

import type { ReactNode } from 'react'
import { Carousel } from '@/components/Carousel'

export const ModelLinesCarousel: React.FC<{ children: ReactNode; label?: string }> = ({
  children,
  label,
}) => (
  <Carousel
    trackLabel={label}
    panelSelector=".ak-model-lines__panel"
    className="ak-model-lines__carousel"
    trackClassName="ak-model-lines__lineup"
    navClassName="ak-model-lines__carousel-nav"
    buttonClassName="ak-model-lines__carousel-btn"
  >
    {children}
  </Carousel>
)
