import path from 'node:path'
import type { Payload, PayloadRequest } from 'payload'

import { uploadMedia } from '../uploadMedia'
import { upsertPage } from './utils'

export const seedHome = async (
  payload: Payload,
  req: PayloadRequest,
  audiencePageIds: Record<string, string> = {},
): Promise<void> => {
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
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Automated retail that turns ',
                version: 1,
              },
              {
                type: 'text',
                detail: 0,
                format: 2,
                mode: 'normal',
                style: '',
                text: 'placement into presence',
                version: 1,
              },
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: '.',
                version: 1,
              },
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
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Retail automatizado que convierte ',
                version: 1,
              },
              {
                type: 'text',
                detail: 0,
                format: 2,
                mode: 'normal',
                style: '',
                text: 'presencia en resultado',
                version: 1,
              },
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: '.',
                version: 1,
              },
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

  const valuePropsBlock = {
    blockType: 'cardGrid' as const,
    blockName: 'Card Grid — Home Value Props',
    variant: 'compact' as const,
    heading: 'The right moment\ndoes more.',
    items: [
      {
        title: 'Premium placement',
        body: richText('Show up in high-traffic places where intent already exists.'),
      },
      {
        title: 'Turnkey operations',
        body: richText('Install, service, replenishment, and support under one partner.'),
      },
      {
        title: 'Custom brand builds',
        body: richText('Custom wraps, assortments, and screens tailored to the moment.'),
      },
      {
        title: 'Smarter revenue',
        body: richText('Turn underused space into a branded moment people remember.'),
      },
    ],
  }

  const valuePropsBlockEs = {
    ...valuePropsBlock,
    heading: 'El momento correcto\nhace más.',
    items: [
      {
        title: 'Ubicación premium',
        body: richText('Presente en lugares de alto tráfico donde la intención ya existe.'),
      },
      {
        title: 'Operación llave en mano',
        body: richText('Instalación, servicio, reposición y soporte bajo un solo partner.'),
      },
      {
        title: 'Marca a medida',
        body: richText('Wraps, surtidos y pantallas personalizadas para cada momento.'),
      },
      {
        title: 'Ingresos más inteligentes',
        body: richText('Convierte espacios subutilizados en momentos de marca memorables.'),
      },
    ],
  }

  const trustStripBlock = {
    blockType: 'trustStrip' as const,
    blockName: 'Trust Strip — Home',
    eyebrow: 'WHO WE WORK WITH',
    heading: 'Trusted by leading brands',
    limit: 0,
  }

  const trustStripBlockEs = {
    ...trustStripBlock,
    eyebrow: 'CON QUIÉN TRABAJAMOS',
    heading: 'La confianza de las mejores marcas',
  }

  const audienceShowcaseBlock = {
    blockType: 'audienceShowcase' as const,
    blockName: 'Audience Showcase — Home',
    eyebrow: "WHO IT'S FOR",
    heading: 'One platform.\nFour ways to show up with purpose.',
    subheading:
      'Amerikiosks helps partners create branded retail experiences that are placed with intention and operated end to end.',
    items: [
      { page: Number(audiencePageIds['for-brands']), cta: 'Explore brand programs' },
      { page: Number(audiencePageIds['for-venues']), cta: 'Explore venue revenue' },
      { page: Number(audiencePageIds['for-agencies']), cta: 'Explore activations' },
      { page: Number(audiencePageIds['for-emerging-brands']), cta: 'Explore launch paths' },
    ],
  }

  const audienceShowcaseBlockEs = {
    ...audienceShowcaseBlock,
    eyebrow: 'PARA QUIÉN',
    heading: 'Una plataforma.\nCuatro formas de estar con propósito.',
    subheading:
      'Amerikiosks ayuda a los partners a crear experiencias de retail de marca colocadas con intención y operadas de principio a fin.',
  }

  const meta = {
    title: 'Amerikiosks — Automated Retail Solutions',
    description:
      'We help brands and venues create premium retail experiences that meet people in high-traffic moments, from branded kiosks to full-service operations.',
    image: heroImage.id,
  }

  const metaEs = {
    title: 'Amerikiosks — Retail Automatizado',
    description:
      'Ayudamos a marcas y venues a crear experiencias de retail premium en los momentos de mayor tráfico, desde kiosks de marca hasta operaciones completas.',
    image: heroImage.id,
  }

  await upsertPage(
    payload,
    req,
    {
      title: 'Home',
      slug: 'home',
      hero: heroData,
      layout: [valuePropsBlock, trustStripBlock, audienceShowcaseBlock],
      meta,
    },
    {
      title: 'Inicio',
      slug: 'home',
      hero: heroDataEs,
      layout: [valuePropsBlockEs, trustStripBlockEs, audienceShowcaseBlockEs],
      meta: metaEs,
    },
  )
}

function richText(text: string) {
  return {
    root: {
      type: 'root' as const,
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
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
  }
}
