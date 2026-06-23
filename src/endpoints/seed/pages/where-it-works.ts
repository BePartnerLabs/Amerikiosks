import path from 'node:path'
import type { Payload, PayloadRequest } from 'payload'
import { uploadMedia } from '../uploadMedia'
import { upsertPage } from './utils'

const richText = (paragraphs: string[]) => ({
  root: {
    type: 'root' as const,
    version: 1,
    direction: null,
    format: '' as const,
    indent: 0,
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      version: 1,
      children: [{ type: 'text', version: 1, text }],
    })),
  },
})

const headingAndParagraphs = (heading: string, paragraphs: string[]) => ({
  root: {
    type: 'root' as const,
    version: 1,
    direction: null,
    format: '' as const,
    indent: 0,
    children: [
      {
        type: 'heading',
        tag: 'h2' as const,
        version: 1,
        children: [{ type: 'text', version: 1, text: heading }],
      },
      ...paragraphs.map((text) => ({
        type: 'paragraph',
        version: 1,
        children: [{ type: 'text', version: 1, text }],
      })),
    ],
  },
})

const storyEn = [
  'Location used to be the advantage only big brands could afford. The flagship on Fifth Avenue. The kiosk in the international terminal. The branded experience in the resort lobby. Those placements existed because someone wrote a very large check, negotiated a very long lease, and hired staff to run it.',
  "That math doesn't work for most brands — and it never worked for venues trying to monetize space without building out a retail operation from scratch. Amerikiosks changed the equation.",
  'We operate in travel environments, entertainment venues, hospitality properties, and retail and campus locations across the Americas. Not because we needed to fill a catalog — because those are the four environments where the conditions for a great brand moment actually exist: high traffic, high dwell time, high spend intent, and an audience that is already leaning in.',
  "Every placement we make goes through the same filter: does this location put the right brand in front of the right person at the right moment? If the answer isn't yes, we don't place there.",
  'The result is a network of locations that works for the brands inside them, the venues that host them, and the people who encounter them.',
]

const storyEs = [
  'La ubicación solía ser la ventaja que solo las grandes marcas podían costear. La tienda insignia en la Quinta Avenida. El kiosko en la terminal internacional. La experiencia de marca en el lobby del resort. Esos placements existían porque alguien firmó un cheque muy grande, negoció un arrendamiento muy largo y contrató personal para operarlo.',
  'Esos números no funcionan para la mayoría de las marcas — y nunca funcionaron para venues que intentaban monetizar su espacio sin construir una operación de retail desde cero. Amerikiosks cambió la ecuación.',
  'Operamos en entornos de viaje, venues de entretenimiento, propiedades de hospitalidad y ubicaciones de retail y campus en toda América. No porque necesitáramos llenar un catálogo — sino porque esos son los cuatro entornos donde existen las condiciones para un gran momento de marca: alto tráfico, alto tiempo de permanencia, alta intención de gasto y una audiencia que ya está inclinada a comprar.',
  'Cada ubicación que hacemos pasa por el mismo filtro: ¿esta ubicación pone a la marca correcta frente a la persona correcta en el momento correcto? Si la respuesta no es sí, no nos ubicamos ahí.',
  'El resultado es una red de ubicaciones que funciona para las marcas dentro de ellas, los venues que las albergan y las personas que las encuentran.',
]

const venuesEn = [
  {
    icon: 'flight_takeoff',
    title: 'Travel',
    body: 'Airports, cruise terminals, transit hubs. Captive audiences with time, money, and a gap in their day that your brand can fill. Dwell time: high. Spend intent: active. Audience: pre-qualified by the environment itself.',
    linkLabel: 'See Travel venues',
    linkUrl: '/travel-and-transit',
  },
  {
    icon: 'theaters',
    title: 'Entertainment',
    body: "Arenas, stadiums, theme parks, concert venues. Tens of thousands of people in a single location, emotionally activated, spending freely. This isn't foot traffic. It's an audience already at peak engagement.",
    linkLabel: 'See Entertainment venues',
    linkUrl: '/entertainment-venues',
  },
  {
    icon: 'hotel',
    title: 'Hospitality',
    body: 'Luxury hotels, resorts, extended-stay properties. Guests who are relaxed, receptive, and spending on experience — for days at a time, not minutes. The longest dwell time in our network. The highest average transaction value.',
    linkLabel: 'See Hospitality venues',
    linkUrl: '/hospitality-and-destinations',
  },
  {
    icon: 'local_mall',
    title: 'Retail + Campus',
    body: 'Shopping centers, corporate campuses, universities. The same audience, every day, building the kind of familiarity that turns a first purchase into a habit. Not a moment. A relationship.',
    linkLabel: 'See Retail + Campus venues',
    linkUrl: '/retail-and-campuses',
  },
]

const venuesEs = [
  {
    icon: 'flight_takeoff',
    title: 'Viajes',
    body: 'Aeropuertos, terminales de cruceros, hubs de tránsito. Audiencias cautivas con tiempo, dinero y un espacio en su día que tu marca puede llenar. Tiempo de permanencia: alto. Intención de gasto: activa. Audiencia: precalificada por el entorno mismo.',
    linkLabel: 'Ver venues de Viaje',
    linkUrl: '/travel-and-transit',
  },
  {
    icon: 'theaters',
    title: 'Entretenimiento',
    body: 'Arenas, estadios, parques temáticos, venues de conciertos. Decenas de miles de personas en una sola ubicación, emocionalmente activadas, gastando libremente. Esto no es tráfico peatonal. Es una audiencia ya en su pico de engagement.',
    linkLabel: 'Ver venues de Entretenimiento',
    linkUrl: '/entertainment-venues',
  },
  {
    icon: 'hotel',
    title: 'Hospitalidad',
    body: 'Hoteles de lujo, resorts, propiedades de estadía extendida. Huéspedes relajados, receptivos y gastando en la experiencia — por días, no minutos. El tiempo de permanencia más largo de nuestra red. El ticket promedio más alto.',
    linkLabel: 'Ver venues de Hospitalidad',
    linkUrl: '/hospitality-and-destinations',
  },
  {
    icon: 'local_mall',
    title: 'Retail + Campus',
    body: 'Centros comerciales, campus corporativos, universidades. La misma audiencia, todos los días, construyendo el tipo de familiaridad que convierte una primera compra en un hábito. No un momento. Una relación.',
    linkLabel: 'Ver venues de Retail + Campus',
    linkUrl: '/retail-and-campuses',
  },
]

const logicEn = [
  "We don't fill empty square footage. We engineer presence. Every location in our network is evaluated on three criteria before a unit goes in:",
  'Traffic volume — enough people to justify the placement and generate returns for the venue partner.',
  'Demographic fit — the audience profile matches the brand or brands operating in that unit.',
  'Brand compatibility — the environment elevates the brand, not the other way around.',
  "If a location doesn't pass all three, it's not in our network. That's not a limitation — it's the reason our partners trust us with their brand.",
]

const logicEs = [
  'No llenamos metros cuadrados vacíos. Diseñamos presencia. Cada ubicación en nuestra red se evalúa con tres criterios antes de instalar una unidad:',
  'Volumen de tráfico — suficientes personas para justificar la ubicación y generar retorno para el venue partner.',
  'Ajuste demográfico — el perfil de la audiencia coincide con la marca o marcas que operan en esa unidad.',
  'Compatibilidad de marca — el entorno eleva a la marca, no al revés.',
  'Si una ubicación no pasa las tres, no está en nuestra red. Eso no es una limitación — es la razón por la que nuestros partners nos confían su marca.',
]

const buildLayout = (
  story: string[],
  venues: typeof venuesEn,
  venuesEyebrow: string,
  venuesHeading: string,
  logicHeading: string,
  logic: string[],
  closingHeadline: string,
  closingPrimaryLabel: string,
  closingSecondaryLabel: string,
) => [
  {
    blockType: 'content' as const,
    blockName: 'The Story',
    columns: [{ size: 'full' as const, richText: richText(story) }],
  },
  {
    blockType: 'cardGrid' as const,
    blockName: 'Where We Operate',
    variant: 'icon' as const,
    eyebrow: venuesEyebrow,
    heading: venuesHeading,
    items: venues.map((v) => ({
      icon: v.icon,
      title: v.title,
      body: richText([v.body]),
      link: { label: v.linkLabel, url: v.linkUrl, type: 'custom' as const },
    })),
  },
  {
    blockType: 'content' as const,
    blockName: 'The Logic Behind Every Placement',
    columns: [{ size: 'full' as const, richText: headingAndParagraphs(logicHeading, logic) }],
  },
  {
    blockType: 'cta' as const,
    blockName: 'Closing',
    richText: headingAndParagraphs(closingHeadline, []),
    links: [
      {
        link: {
          label: closingPrimaryLabel,
          type: 'custom' as const,
          url: '/contact',
          appearance: 'default' as const,
        },
      },
      {
        link: {
          label: closingSecondaryLabel,
          type: 'custom' as const,
          url: '/solutions',
          appearance: 'outline' as const,
        },
      },
    ],
  },
]

export const seedWhereItWorks = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding where-it-works page...')

  // Delete any existing page so upsertPage creates fresh (avoids validation errors
  // when the existing page was previously seeded with a different hero type).
  const existingPage = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'where-it-works' } },
    limit: 1,
    req,
  })
  if (existingPage.totalDocs > 0) {
    await payload.delete({
      collection: 'pages',
      id: existingPage.docs[0]?.id as number,
      overrideAccess: true,
      req,
    })
    payload.logger.info('  Deleted existing where-it-works page')
  }

  const heroImage = await uploadMedia(
    payload,
    req,
    path.join(process.cwd(), 'public', 'seed-assets', 'project-airport-retail.png'),
    'Branded kiosk in a high-traffic venue concourse',
  )

  const heroData = {
    type: 'mediumImpact' as const,
    media: heroImage.id,
    breadcrumb: 'Home / Where It Works',
    tags: [{ label: 'Malls' }, { label: 'Airports' }, { label: 'Stadiums' }],
    links: [
      {
        link: {
          type: 'custom' as const,
          appearance: 'default' as const,
          label: 'Talk to us about placement',
          url: '/contact',
        },
      },
      {
        link: {
          type: 'custom' as const,
          appearance: 'outline' as const,
          label: 'See who we work with',
          url: '/solutions',
        },
      },
    ],
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
                text: "Your brand doesn't need more channels. It needs the right rooms.",
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
                text: "Amerikiosks operates in the environments where attention is already high, spend intent is already active, and your customer is already there. We don't find audiences. We position you inside the ones that matter.",
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
    tags: [{ label: 'Malls' }, { label: 'Aeropuertos' }, { label: 'Estadios' }],
    links: [
      {
        link: {
          type: 'custom' as const,
          appearance: 'default' as const,
          label: 'Hablemos de tu ubicación',
          url: '/contact',
        },
      },
      {
        link: {
          type: 'custom' as const,
          appearance: 'outline' as const,
          label: 'Ve con quién trabajamos',
          url: '/solutions',
        },
      },
    ],
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
                text: 'Tu marca no necesita más canales. Necesita las salas correctas.',
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
                text: 'Amerikiosks opera en los entornos donde la atención ya es alta, la intención de gasto ya está activa y tu cliente ya está ahí. No buscamos audiencias. Te posicionamos dentro de las que importan.',
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
    {
      title: 'Where It Works',
      slug: 'where-it-works',
      hero: heroData,
      layout: buildLayout(
        storyEn,
        venuesEn,
        'WHERE WE OPERATE',
        'Four environments. One filter.',
        'The Logic Behind Every Placement',
        logicEn,
        "We're in the right places. The question is whether your brand is.",
        'Talk to us about placement',
        'See who we work with',
      ),
      meta: {
        title: 'Where It Works — Amerikiosks',
        description:
          'Amerikiosks operates in travel, entertainment, hospitality, and retail and campus environments across the Americas.',
        image: heroImage.id,
      },
    },
    {
      title: 'Dónde Funciona',
      slug: 'donde-funciona',
      hero: esHeroData,
      layout: buildLayout(
        storyEs,
        venuesEs,
        'DÓNDE OPERAMOS',
        'Cuatro entornos. Un solo filtro.',
        'La Lógica Detrás de Cada Ubicación',
        logicEs,
        'Estamos en los lugares correctos. La pregunta es si tu marca también.',
        'Hablemos de tu ubicación',
        'Ve con quién trabajamos',
      ),
      meta: {
        title: 'Dónde Funciona — Amerikiosks',
        description:
          'Amerikiosks opera en entornos de viaje, entretenimiento, hospitalidad y retail y campus en toda América.',
        image: heroImage.id,
      },
    },
  )
}
