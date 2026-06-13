import path from 'node:path'
import type { Payload, PayloadRequest } from 'payload'

import { uploadMedia } from '../uploadMedia'
import { upsertPage } from './utils'

export const seedHome = async (
  payload: Payload,
  req: PayloadRequest,
  audiencePageIds: Record<string, string> = {},
  _postIds: string[] = [],
  audienceMediaIds: Record<string, number> = {},
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
                text: 'We don't make vending machines. We connect your brand with people, ',
                version: 1,
              },
              {
                type: 'text',
                detail: 0,
                format: 2,
                mode: 'normal',
                style: '',
                text: 'exactly where it matters most',
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
                text: 'Premium automated retail infrastructure for airports, hotels, and high-traffic venues — operating on its own, 24/7, without you lifting a finger.',
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
                text: 'No hacemos máquinas expendedoras. Conectamos tu marca con las personas, ',
                version: 1,
              },
              {
                type: 'text',
                detail: 0,
                format: 2,
                mode: 'normal',
                style: '',
                text: 'exactamente donde más importa',
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
                text: 'Infraestructura de retail automatizado premium para aeropuertos, hoteles y venues de alto tráfico — operando sola, 24/7, sin que tengas que hacer nada.',
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
        body: richText('Airports, hotels, stadiums: where your customer already is, and your competitor can't reach.'),
      },
      {
        title: 'Turnkey operations',
        body: richText('Install, inventory, maintenance, support. Without you lifting a finger.'),
      },
      {
        title: 'Custom brand builds',
        body: richText('360° branding of the physical unit + active screens. Not a machine — your brand in the space.'),
      },
      {
        title: 'Smarter revenue',
        body: richText('This isn't an expense. It's presence that pays for itself.'),
      },
    ],
  }

  const valuePropsBlockEs = {
    ...valuePropsBlock,
    heading: 'El momento correcto\nhace más.',
    items: [
      {
        title: 'Ubicación premium',
        body: richText('Aeropuertos, hoteles, estadios: donde tu cliente ya está, y tu competidor no puede llegar.'),
      },
      {
        title: 'Operación llave en mano',
        body: richText('Instalación, inventario, mantenimiento, soporte. Sin que muevas un dedo.'),
      },
      {
        title: 'Marca a medida',
        body: richText('Branding 360° de la unidad física + pantallas activas. No es una máquina, es tu marca en el espacio.'),
      },
      {
        title: 'Ingresos más inteligentes',
        body: richText('Esto no es gasto. Es presencia que paga por sí misma.'),
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
      {
        page: Number(audiencePageIds['for-brands']),
        image: audienceMediaIds['for-brands'],
        cta: 'Explore brand programs',
      },
      {
        page: Number(audiencePageIds['for-venues']),
        image: audienceMediaIds['for-venues'],
        cta: 'Explore venue revenue',
      },
      {
        page: Number(audiencePageIds['for-agencies']),
        image: audienceMediaIds['for-agencies'],
        cta: 'Explore activations',
      },
      {
        page: Number(audiencePageIds['for-emerging-brands']),
        image: audienceMediaIds['for-emerging-brands'],
        cta: 'Explore launch paths',
      },
    ],
  }

  const audienceShowcaseBlockEs = {
    ...audienceShowcaseBlock,
    eyebrow: 'PARA QUIÉN',
    heading: 'Una plataforma.\nCuatro formas de estar con propósito.',
    subheading:
      'Amerikiosks ayuda a los partners a crear experiencias de retail de marca colocadas con intención y operadas de principio a fin.',
    items: [
      {
        page: Number(audiencePageIds['for-brands']),
        image: audienceMediaIds['for-brands'],
        cta: 'Explorar programas de marca',
      },
      {
        page: Number(audiencePageIds['for-venues']),
        image: audienceMediaIds['for-venues'],
        cta: 'Explorar ingresos por venue',
      },
      {
        page: Number(audiencePageIds['for-agencies']),
        image: audienceMediaIds['for-agencies'],
        cta: 'Explorar activaciones',
      },
      {
        page: Number(audiencePageIds['for-emerging-brands']),
        image: audienceMediaIds['for-emerging-brands'],
        cta: 'Explorar rutas de lanzamiento',
      },
    ],
  }

  const meta = {
    title: 'Amerikiosks — Connection Infrastructure for Modern Brands',
    description:
      'Amerikiosks puts your brand exactly where your customers are, when they need you most, operating on its own, without you having to do anything.',
    image: heroImage.id,
  }

  const metaEs = {
    title: 'Amerikiosks — Infraestructura de Conexión para Marcas Modernas',
    description:
      'Amerikiosks es la empresa que pone tu marca exactamente donde tus clientes están, cuando más te necesitan, operando sola, sin que tengas que hacer nada.',
    image: heroImage.id,
  }

  const whereItWorksBlock = {
    blockType: 'cardGrid' as const,
    blockName: 'Card Grid — Where It Works',
    variant: 'icon' as const,
    eyebrow: 'WHERE IT WORKS',
    heading: 'Places where attention,\nneed, and brand presence meet.',
    items: [
      {
        icon: 'flight_takeoff',
        title: 'Travel and Transit',
        body: richText(
          'Reach travelers in high-intent moments across airports, stations, and transit hubs.',
        ),
        link: {
          type: 'custom' as const,
          label: 'Explore Transit placements',
          url: '/where-it-works',
        },
      },
      {
        icon: 'movie',
        title: 'Entertainment Venues',
        body: richText(
          'Meet fans and guests while anticipation is high and discovery feels part of the event.',
        ),
        link: { type: 'custom' as const, label: 'Explore event venues', url: '/where-it-works' },
      },
      {
        icon: 'hotel',
        title: 'Hospitality',
        body: richText(
          'Curate useful branded moments for hotels, resorts, casinos, and destination guests.',
        ),
        link: { type: 'custom' as const, label: 'Explore hospitality', url: '/where-it-works' },
      },
      {
        icon: 'shopping_bag',
        title: 'Retail and Campuses',
        body: richText(
          'Create convenient retail touchpoints in daily spaces without opening a full store.',
        ),
        link: { type: 'custom' as const, label: 'Explore campus retail', url: '/where-it-works' },
      },
    ],
  }

  const whereItWorksBlockEs = {
    ...whereItWorksBlock,
    eyebrow: 'DÓNDE FUNCIONA',
    heading: 'Lugares donde la atención,\nla necesidad y la marca se encuentran.',
    items: [
      {
        icon: 'flight_takeoff',
        title: 'Viajes y Tránsito',
        body: richText(
          'Alcanza a viajeros en momentos de alta intención en aeropuertos, estaciones y hubs de tránsito.',
        ),
        link: {
          type: 'custom' as const,
          label: 'Explorar ubicaciones en tránsito',
          url: '/where-it-works',
        },
      },
      {
        icon: 'movie',
        title: 'Venues de Entretenimiento',
        body: richText(
          'Conecta con fans y asistentes cuando la anticipación es alta y el descubrimiento es parte del evento.',
        ),
        link: {
          type: 'custom' as const,
          label: 'Explorar venues de eventos',
          url: '/where-it-works',
        },
      },
      {
        icon: 'hotel',
        title: 'Hospitalidad',
        body: richText(
          'Crea momentos de marca útiles en hoteles, resorts, casinos y destinos turísticos.',
        ),
        link: { type: 'custom' as const, label: 'Explorar hospitalidad', url: '/where-it-works' },
      },
      {
        icon: 'shopping_bag',
        title: 'Retail y Campus',
        body: richText(
          'Crea puntos de contacto de retail convenientes en espacios cotidianos sin abrir una tienda completa.',
        ),
        link: { type: 'custom' as const, label: 'Explorar campus retail', url: '/where-it-works' },
      },
    ],
  }

  const whyAmerikiosksBlock = {
    blockType: 'cardGrid' as const,
    blockName: 'Card Grid — Why Amerikiosks',
    variant: 'pillar' as const,
    eyebrow: 'WHY AMERIKIOSKS',
    heading: 'Built to feel premium.\nOperated to stay that way.',
    subheading:
      'From the first opportunity to daily operation, Amerikiosks turns a location, campaign, or brand goal into a managed retail experience.',
    link: { type: 'custom' as const, label: 'Learn More', url: '/why-amerikiosks' },
    items: [
      {
        eyebrow: 'STRATEGY',
        title: 'Define the moment',
        body: richText(
          'We identify the venue, audience, product mix, and intent behind the placement.',
        ),
      },
      {
        eyebrow: 'EXPERIENCE',
        title: 'Design the experience',
        body: richText(
          'Branding, assortment, machine wrap, screens, and campaign tie come together.',
        ),
      },
      {
        eyebrow: 'LAUNCH',
        title: 'Launch with one partner',
        body: richText('Install, coordination, rollout, and support move through one team.'),
      },
      {
        eyebrow: 'OPERATIONS',
        title: 'Operate and optimize',
        body: richText('Replenishment, maintenance, monitoring, and performance keep it ready.'),
      },
    ],
  }

  const whyAmerikiosksBlockEs = {
    ...whyAmerikiosksBlock,
    eyebrow: 'POR QUÉ AMERIKIOSKS',
    heading: 'Diseñado para sentirse premium.\nOperado para mantenerse así.',
    subheading:
      'Desde la primera oportunidad hasta la operación diaria, Amerikiosks convierte una ubicación, campaña o meta de marca en una experiencia de retail gestionada.',
    link: { type: 'custom' as const, label: 'Saber más', url: '/why-amerikiosks' },
    items: [
      {
        eyebrow: 'ESTRATEGIA',
        title: 'Define el momento',
        body: richText(
          'Identificamos el venue, la audiencia, el mix de producto y la intención detrás del placement.',
        ),
      },
      {
        eyebrow: 'EXPERIENCIA',
        title: 'Diseña la experiencia',
        body: richText('Branding, surtido, wrap de máquina, pantallas y campaña se integran.'),
      },
      {
        eyebrow: 'LANZAMIENTO',
        title: 'Lanza con un solo partner',
        body: richText('Instalación, coordinación, rollout y soporte avanzan por un solo equipo.'),
      },
      {
        eyebrow: 'OPERACIONES',
        title: 'Opera y optimiza',
        body: richText('Reposición, mantenimiento, monitoreo y performance siempre listos.'),
      },
    ],
  }

  const insightsBlock = {
    blockType: 'insightsShowcase' as const,
    blockName: 'Insights Showcase — Home',
    eyebrow: 'INSIGHTS',
    heading: 'What brands need to know before showing up in the right place.',
  }

  const insightsBlockEs = {
    blockType: 'insightsShowcase' as const,
    blockName: 'Insights Showcase — Home',
    eyebrow: 'INSIGHTS',
    heading: 'Lo que las marcas deben saber antes de aparecer en el lugar correcto.',
  }

  const ctaBlock = {
    blockType: 'cta' as const,
    blockName: 'CTA — Home',
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
                text: 'Show up where your brand matters.',
                version: 1,
              },
            ],
            direction: 'ltr' as const,
            format: '' as const,
            indent: 0,
            tag: 'h2',
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
      },
    },
    links: [
      {
        link: {
          type: 'custom' as const,
          appearance: 'default' as const,
          label: 'Start a Partnership',
          url: '/contact',
        },
      },
    ],
  }

  const ctaBlockEs = {
    ...ctaBlock,
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
                text: 'Lo genérico murió. Tu marca, donde realmente importa.',
                version: 1,
              },
            ],
            direction: 'ltr' as const,
            format: '' as const,
            indent: 0,
            tag: 'h2',
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
      },
    },
    links: [
      {
        link: {
          type: 'custom' as const,
          appearance: 'default' as const,
          label: 'Comenzar una alianza',
          url: '/contact',
        },
      },
    ],
  }

  await upsertPage(
    payload,
    req,
    {
      title: 'Home',
      slug: 'home',
      hero: heroData,
      layout: [
        valuePropsBlock,
        trustStripBlock,
        audienceShowcaseBlock,
        whereItWorksBlock,
        whyAmerikiosksBlock,
        insightsBlock,
        ctaBlock,
      ],
      meta,
    },
    {
      title: 'Inicio',
      slug: 'home',
      hero: heroDataEs,
      layout: [
        valuePropsBlockEs,
        trustStripBlockEs,
        audienceShowcaseBlockEs,
        whereItWorksBlockEs,
        whyAmerikiosksBlockEs,
        insightsBlockEs,
        ctaBlockEs,
      ],
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
