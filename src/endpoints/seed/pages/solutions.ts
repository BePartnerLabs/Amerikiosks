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
  'Most automated retail companies sell a machine. We sell a decision.',
  "The decision to put your brand somewhere specific. To turn a venue's unused square footage into a revenue line. To give an emerging brand access to the same physical infrastructure that used to require a seven-figure retail budget.",
  "That decision looks different depending on who you are — which is why we don't start with product specs. We start with you.",
  "Some of our partners come to us with a brand that needs presence in the right places. Others come with a space that's generating zero revenue on square footage they already own. Others are building for clients and need a reliable infrastructure partner who won't make them look bad. And some are founders who've been told physical retail isn't accessible yet — and are about to find out otherwise.",
  "We've built a model flexible enough to serve all of them. But the first step is always the same: figuring out which one you are.",
]

const storyEs = [
  'La mayoría de las empresas de retail automatizado venden una máquina. Nosotros vendemos una decisión.',
  'La decisión de poner tu marca en un lugar específico. De convertir los metros cuadrados sin uso de un venue en una línea de ingresos. De darle a una marca emergente acceso a la misma infraestructura física que antes requería un presupuesto de retail de siete cifras.',
  'Esa decisión se ve distinta dependiendo de quién eres — por eso no empezamos con especificaciones de producto. Empezamos contigo.',
  'Algunos de nuestros partners llegan con una marca que necesita presencia en los lugares correctos. Otros llegan con un espacio que genera cero ingreso en metros cuadrados que ya poseen. Otros construyen para clientes y necesitan un partner de infraestructura confiable que no los haga quedar mal. Y algunos son fundadores a quienes les dijeron que el retail físico todavía no es accesible — y están a punto de descubrir lo contrario.',
  'Hemos construido un modelo lo suficientemente flexible para servir a todos ellos. Pero el primer paso siempre es el mismo: descubrir cuál de ellos eres.',
]

const audiencesEn = [
  {
    eyebrow: 'PREMIUM BRANDS',
    title: 'Premium Brands',
    body: "You've built something worth protecting. You need distribution that matches your standards — not a machine that undercuts your positioning. We put your brand in airports, luxury hotels, arenas, and premium venues. Fully wrapped in your identity. Operating without staff. In the places your customer already is.",
    linkLabel: 'See how we work with Premium Brands',
    linkUrl: '/for-brands',
  },
  {
    eyebrow: 'VENUES',
    title: 'Venues',
    body: "You have the space. You have the traffic. You're leaving revenue on the floor. We install, operate, and maintain. You collect a monthly revenue share without adding a single line to your staffing budget.",
    linkLabel: 'See how we work with Venues',
    linkUrl: '/for-venues',
  },
  {
    eyebrow: 'AGENCIES',
    title: 'Agencies',
    body: 'Your client needs a physical retail channel. You need a partner who delivers without making your relationship complicated. We work as infrastructure — not as a vendor competing for the relationship. You stay the strategic lead. We execute.',
    linkLabel: 'See how we work with Agencies',
    linkUrl: '/for-agencies',
  },
  {
    eyebrow: 'EMERGING BRANDS',
    title: 'Emerging Brands',
    body: "You're ready for physical distribution. You're not ready for the cost of traditional retail. We give you access to premium venues — airports, hotels, campuses — at a fraction of what a lease would cost. Operational in weeks, not months.",
    linkLabel: 'See how we work with Emerging Brands',
    linkUrl: '/for-emerging-brands',
  },
]

const audiencesEs = [
  {
    eyebrow: 'MARCAS PREMIUM',
    title: 'Marcas Premium',
    body: 'Has construido algo que vale la pena proteger. Necesitas distribución que coincida con tus estándares — no una máquina que devalúe tu posicionamiento. Ponemos tu marca en aeropuertos, hoteles de lujo, arenas y venues premium. Completamente envuelta en tu identidad. Operando sin personal. En los lugares donde tu cliente ya está.',
    linkLabel: 'Ver cómo trabajamos con Marcas Premium',
    linkUrl: '/for-brands',
  },
  {
    eyebrow: 'VENUES',
    title: 'Venues',
    body: 'Tienes el espacio. Tienes el tráfico. Estás dejando ingreso sobre la mesa. Nosotros instalamos, operamos y damos mantenimiento. Tú cobras una participación mensual de ingresos sin agregar una sola línea a tu presupuesto de personal.',
    linkLabel: 'Ver cómo trabajamos con Venues',
    linkUrl: '/for-venues',
  },
  {
    eyebrow: 'AGENCIAS',
    title: 'Agencias',
    body: 'Tu cliente necesita un canal de retail físico. Tú necesitas un partner que entregue sin complicar tu relación. Trabajamos como infraestructura — no como un proveedor compitiendo por la relación. Tú te mantienes como el lead estratégico. Nosotros ejecutamos.',
    linkLabel: 'Ver cómo trabajamos con Agencias',
    linkUrl: '/for-agencies',
  },
  {
    eyebrow: 'MARCAS EMERGENTES',
    title: 'Marcas Emergentes',
    body: 'Estás listo para distribución física. No estás listo para el costo del retail tradicional. Te damos acceso a venues premium — aeropuertos, hoteles, campus — a una fracción de lo que costaría un arrendamiento. Operativo en semanas, no meses.',
    linkLabel: 'Ver cómo trabajamos con Marcas Emergentes',
    linkUrl: '/for-emerging-brands',
  },
]

const buildLayout = (
  story: string[],
  audiences: typeof audiencesEn,
  audiencesEyebrow: string,
  audiencesHeading: string,
  closingHeadline: string,
  closingBody: string,
  closingCtaLabel: string,
) => [
  {
    blockType: 'content' as const,
    blockName: 'The Story',
    columns: [{ size: 'full' as const, richText: richText(story) }],
  },
  {
    blockType: 'cardGrid' as const,
    blockName: 'Who We Work With',
    variant: 'pillar' as const,
    eyebrow: audiencesEyebrow,
    heading: audiencesHeading,
    items: audiences.map((a) => ({
      eyebrow: a.eyebrow,
      title: a.title,
      body: richText([a.body]),
      link: { label: a.linkLabel, url: a.linkUrl, type: 'custom' as const },
    })),
  },
  {
    blockType: 'cta' as const,
    blockName: 'Closing',
    richText: headingAndParagraphs(closingHeadline, [closingBody]),
    links: [
      {
        link: {
          label: closingCtaLabel,
          type: 'custom' as const,
          url: '/contact',
          appearance: 'default' as const,
        },
      },
    ],
  },
]

export const seedSolutions = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding solutions page...')

  const heroImage = await uploadMedia(
    payload,
    req,
    path.join(process.cwd(), 'src/endpoints/seed/assets/hero-for-brands.png'),
    'Branded kiosk in a shopping mall for brand activations',
  )

  const heroData = {
    type: 'mediumImpact' as const,
    media: heroImage.id,
    links: [
      {
        link: {
          type: 'custom' as const,
          appearance: 'default' as const,
          label: 'Talk to us',
          url: '/contact',
        },
      },
      {
        link: {
          type: 'custom' as const,
          appearance: 'outline' as const,
          label: 'See where we operate',
          url: '/where-it-works',
        },
      },
    ],
    breadcrumb: 'Home / Solutions',
    tags: [
      { label: 'Brands' },
      { label: 'Venues' },
      { label: 'Agencies' },
      { label: 'Emerging Brands' },
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
                text: "Not every brand needs the same thing from us. That's the point.",
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
                text: 'Amerikiosks works with premium brands protecting their image, venues unlocking passive revenue, agencies building for their clients, and emerging brands entering physical retail for the first time. The infrastructure is the same. The conversation is different.',
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
    breadcrumb: 'Inicio / Soluciones',
    links: [
      {
        link: {
          type: 'custom' as const,
          appearance: 'default' as const,
          label: 'Habla con nosotros',
          url: '/contact',
        },
      },
      {
        link: {
          type: 'custom' as const,
          appearance: 'outline' as const,
          label: 'Ve dónde operamos',
          url: '/where-it-works',
        },
      },
    ],
    tags: [
      { label: 'Marcas' },
      { label: 'Venues' },
      { label: 'Agencias' },
      { label: 'Marcas Emergentes' },
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
                text: 'No toda marca necesita lo mismo de nosotros. Ese es el punto.',
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
                text: 'Amerikiosks trabaja con marcas premium que protegen su imagen, venues que destraban ingresos pasivos, agencias que construyen para sus clientes y marcas emergentes que entran al retail físico por primera vez. La infraestructura es la misma. La conversación es distinta.',
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
      title: 'Solutions',
      slug: 'solutions',
      hero: heroData,
      layout: buildLayout(
        storyEn,
        audiencesEn,
        'WHO WE WORK WITH',
        'Four audiences. One infrastructure.',
        "If you're not sure where you fit — that's what the first conversation is for.",
        "We've worked with brands at every stage, venues of every size, and agencies at every scope level. The model adapts. The quality doesn't.",
        'Talk to us',
      ),
      meta: {
        title: 'Solutions — Amerikiosks',
        description:
          'Amerikiosks works with premium brands, venues, agencies, and emerging brands. The infrastructure is the same. The conversation is different.',
        image: heroImage.id,
      },
    },
    {
      title: 'Soluciones',
      slug: 'soluciones',
      hero: esHeroData,
      layout: buildLayout(
        storyEs,
        audiencesEs,
        'A QUIÉN SERVIMOS',
        'Cuatro audiencias. Una infraestructura.',
        'Si no estás seguro de dónde encajas — para eso es la primera conversación.',
        'Hemos trabajado con marcas en cada etapa, venues de cada tamaño y agencias de cada nivel de alcance. El modelo se adapta. La calidad no.',
        'Habla con nosotros',
      ),
      meta: {
        title: 'Soluciones — Amerikiosks',
        description:
          'Amerikiosks trabaja con marcas premium, venues, agencias y marcas emergentes. La infraestructura es la misma. La conversación es distinta.',
        image: heroImage.id,
      },
    },
  )
}
