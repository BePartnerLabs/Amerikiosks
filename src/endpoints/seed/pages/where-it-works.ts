import type { Payload, PayloadRequest } from 'payload'
import { upsertPage } from './utils'

const heroData = {
  type: 'lowImpact' as const,
  links: [],
  breadcrumb: 'Home / Where It Works',
  tags: [{ label: 'Malls' }, { label: 'Airports' }, { label: 'Stadiums' }],
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
              text: 'Where It Works',
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
              text: 'Amerikiosks operates in premium venues where foot traffic meets purchasing intent.',
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

const esHeroData = {
  ...heroData,
  breadcrumb: 'Inicio / Dónde Funciona',
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
              text: 'Dónde Funciona',
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
              text: 'Amerikiosks opera en venues premium donde el tráfico peatonal se encuentra con la intención de compra.',
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

const cardGridBlock = {
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

const cardGridBlockEs = {
  ...cardGridBlock,
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

export const seedWhereItWorks = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding where-it-works page...')
  await upsertPage(
    payload,
    req,
    { title: 'Where It Works', slug: 'where-it-works', hero: heroData, layout: [cardGridBlock] },
    {
      title: 'Dónde Funciona',
      slug: 'donde-funciona',
      hero: esHeroData,
      layout: [cardGridBlockEs],
    },
  )
}
