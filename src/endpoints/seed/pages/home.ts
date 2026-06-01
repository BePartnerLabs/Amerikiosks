import path from 'path'
import type { Payload, PayloadRequest } from 'payload'

import { uploadMedia } from '../uploadMedia'
import { upsertPage } from './utils'

export const seedHome = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding home page...')

  const [heroImage, heroVideo] = await Promise.all([
    uploadMedia(
      payload,
      req,
      path.join(process.cwd(), 'src/endpoints/seed/assets/hero-home.png'),
      'Amerikiosks kiosk in an airport lounge',
    ),
    uploadMedia(
      payload,
      req,
      path.join(process.cwd(), 'src/endpoints/seed/assets/hero-home.mp4'),
      'Amerikiosks hero background video',
    ),
  ])

  const heroData = {
    type: 'highImpact' as const,
    media: heroImage.id,
    backgroundVideo: heroVideo.id,
    links: [],
    richText: {
      root: {
        type: 'root' as const,
        children: [
          {
            type: 'heading',
            children: [
              { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Automated retail that turns ', version: 1 },
              { type: 'text', detail: 0, format: 2, mode: 'normal', style: '', text: 'placement into presence', version: 1 },
              { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: '.', version: 1 },
            ],
            direction: 'ltr' as const,
            format: '' as const,
            indent: 0,
            tag: 'h1',
            version: 1,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'We help brands and venues create premium retail experiences that meet people in high-traffic moments, from branded kiosks to full-service operations.',
                version: 1,
              },
            ],
            direction: 'ltr' as const,
            format: '' as const,
            indent: 0,
            textFormat: 0,
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
      },
    },
  }

  const heroDataEs = {
    ...heroData,
    richText: {
      root: {
        type: 'root' as const,
        children: [
          {
            type: 'heading',
            children: [
              { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Retail automatizado que convierte ', version: 1 },
              { type: 'text', detail: 0, format: 2, mode: 'normal', style: '', text: 'presencia en resultado', version: 1 },
              { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: '.', version: 1 },
            ],
            direction: 'ltr' as const,
            format: '' as const,
            indent: 0,
            tag: 'h1',
            version: 1,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Ayudamos a marcas y venues a crear experiencias de retail premium en los momentos de mayor tráfico, desde kiosks de marca hasta operaciones completas.',
                version: 1,
              },
            ],
            direction: 'ltr' as const,
            format: '' as const,
            indent: 0,
            textFormat: 0,
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
      },
    },
  }

  await upsertPage(
    payload,
    req,
    { title: 'Home', slug: 'home', hero: heroData },
    { title: 'Inicio', slug: 'home', hero: heroDataEs },
  )
}
