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
      path.resolve(__dirname, '../assets/hero-home.png'),
      'Amerikiosks kiosk in an airport lounge',
    ),
    uploadMedia(
      payload,
      req,
      path.resolve(__dirname, '../assets/hero-home.mp4'),
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
              { type: 'text', detail: 0, format: 16, mode: 'normal', style: 'color: #ec254e;', text: 'placement into presence', version: 1 },
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

  await upsertPage(
    payload,
    req,
    { title: 'Home', slug: 'home', hero: heroData },
    { title: 'Inicio', slug: 'inicio', hero: heroData },
  )
}
