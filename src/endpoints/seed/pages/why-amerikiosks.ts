import type { Payload, PayloadRequest } from 'payload'
import { upsertPage } from './utils'

const heroData = {
  type: 'lowImpact' as const,
  links: [],
  breadcrumb: 'Home / Why Amerikiosks',
  tags: [{ label: 'Turnkey' }, { label: 'Data-driven' }, { label: 'Scalable' }],
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
              text: "There are other automated retail companies. Here's why that's not the conversation.",
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
              text: "We're not competing on machine specs or price per unit. We're competing on what happens after the installation — and that's a different category entirely.",
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
  breadcrumb: 'Inicio / Por Qué Amerikiosks',
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
              text: 'Existen otras empresas de retail automatizado. Por eso esa no es la conversación.',
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
              text: 'No competimos en especificaciones de máquina ni precio por unidad. Competimos en lo que pasa después de la instalación — y eso es una categoría completamente distinta.',
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

const headingAndParagraphs = (heading: string, tag: 'h2' | 'h3', paragraphs: string[]) => ({
  root: {
    type: 'root' as const,
    version: 1,
    direction: null,
    format: '' as const,
    indent: 0,
    children: [
      { type: 'heading', tag, version: 1, children: [{ type: 'text', version: 1, text: heading }] },
      ...paragraphs.map((text) => ({
        type: 'paragraph',
        version: 1,
        children: [{ type: 'text', version: 1, text }],
      })),
    ],
  },
})

const storyEn = [
  "Automated retail is not a new industry. There are companies that have been placing vending machines in hallways since before most of our clients' brands existed. They have large catalogs, national footprints, and decades of operational history.",
  'And yet, the brands and venues that come to us keep saying the same thing: working with the others felt transactional. Like renting equipment, not building infrastructure.',
  'We built Amerikiosks around a different premise — that the machine is the least interesting part of what we do.',
  'What we actually do is match the right brand to the right environment at the right moment, then operate that placement with the kind of care that makes a brand look better for being in it. Not just present. Better.',
  "That's a harder thing to build. It takes more than hardware and a service contract. It takes judgment — about which locations qualify, which brands fit which venues, which model works for which partner at which stage.",
  "We've made those judgment calls across 15 machine models, three business models, multiple countries, and partners ranging from founders on their first physical placement to VP-level decisions at established consumer brands.",
  "The result isn't a catalog. It's a track record.",
]

const storyEs = [
  'El retail automatizado no es una industria nueva. Hay empresas colocando máquinas expendedoras en pasillos desde antes de que existieran las marcas de la mayoría de nuestros clientes. Tienen catálogos grandes, presencia nacional y décadas de historia operativa.',
  'Y aun así, las marcas y venues que llegan a nosotros dicen lo mismo: trabajar con las demás se sintió transaccional. Como rentar equipo, no como construir infraestructura.',
  'Construimos Amerikiosks alrededor de una premisa distinta — que la máquina es la parte menos interesante de lo que hacemos.',
  'Lo que realmente hacemos es emparejar la marca correcta con el entorno correcto en el momento correcto, y luego operar esa ubicación con el tipo de cuidado que hace que una marca se vea mejor por estar ahí. No solo presente. Mejor.',
  'Eso es más difícil de construir. Se necesita más que hardware y un contrato de servicio. Se necesita criterio — sobre qué ubicaciones califican, qué marcas se ajustan a qué venues, qué modelo funciona para qué partner en qué etapa.',
  'Hemos tomado esas decisiones de criterio a través de 15 modelos de máquina, tres modelos de negocio, múltiples países y partners que van desde fundadores en su primera ubicación física hasta decisiones a nivel VP en marcas de consumo establecidas.',
  'El resultado no es un catálogo. Es un historial comprobado.',
]

const differentiatorsEn = [
  {
    eyebrow: 'SELECTIVITY',
    title: "We don't place anywhere. We place right.",
    body: "Every location in our network passes a three-part filter: traffic volume, demographic fit, and brand compatibility. If a location doesn't clear all three, it's not in our network — regardless of the revenue opportunity. A unit in the wrong location doesn't just underperform. It actively hurts the brand associated with it.",
  },
  {
    eyebrow: 'FLEXIBILITY',
    title: 'Three models because one size never fits.',
    body: "Full-service. Consignment. Services. We built three distinct business models because the right structure depends on who you are, what you're optimizing for, and where you are in your growth — and we're clear about what each one costs and delivers before anything is signed.",
  },
  {
    eyebrow: 'HARDWARE',
    title: '15 machine models because context is everything.',
    body: 'A luxury hotel lobby and a university student union are not the same environment. We grew from 5 machine models to 15 because our partners kept operating in environments that demanded something different — and we built it.',
  },
  {
    eyebrow: 'EXPANSION',
    title: "We've done this in markets where it's harder.",
    body: 'USA. El Salvador. Curazao next. Expanding automated retail across multiple countries — different regulatory environments, different consumer behaviors — is not something you figure out in theory. We have the process, and it lives in our installation methodology, restocking protocols, and maintenance response standards.',
  },
  {
    eyebrow: 'OPERATIONS',
    title: "Our partners don't manage us. They collect.",
    body: 'The operational model is designed so that brands and venues have exactly one job after we install: review the results. We handle restocking, maintenance, performance reporting, and any operational issue that comes up.',
  },
  {
    eyebrow: 'POSITIONING',
    title: "We're infrastructure, not a vendor.",
    body: "A vendor sells you something and moves on. Infrastructure is what you build on top of — and what you rely on when something needs to work without you thinking about it. That's the relationship we're building. Not dependency. Reliability.",
  },
]

const differentiatorsEs = [
  {
    eyebrow: 'SELECTIVIDAD',
    title: 'No colocamos en cualquier lugar. Colocamos bien.',
    body: 'Cada ubicación en nuestra red pasa un filtro de tres partes: volumen de tráfico, ajuste demográfico y compatibilidad de marca. Si una ubicación no pasa las tres, no está en nuestra red — sin importar la oportunidad de ingreso. Una unidad en la ubicación equivocada no solo rinde menos. Daña activamente a la marca asociada con ella.',
  },
  {
    eyebrow: 'FLEXIBILIDAD',
    title: 'Tres modelos porque una sola talla nunca calza.',
    body: 'Full-Service. Consignación. Servicios. Construimos tres modelos de negocio distintos porque la estructura correcta depende de quién eres, qué estás optimizando y en qué etapa de crecimiento te encuentras — y somos claros sobre lo que cada uno cuesta y entrega antes de firmar.',
  },
  {
    eyebrow: 'HARDWARE',
    title: '15 modelos de máquina porque el contexto lo es todo.',
    body: 'Un lobby de hotel de lujo y un centro estudiantil universitario no son el mismo entorno. Crecimos de 5 a 15 modelos de máquina porque nuestros partners seguían operando en entornos que exigían algo distinto — y lo construimos.',
  },
  {
    eyebrow: 'EXPANSIÓN',
    title: 'Lo hemos hecho en mercados donde es más difícil.',
    body: 'USA. El Salvador. Curazao a continuación. Expandir retail automatizado en múltiples países — distintos entornos regulatorios, distintos comportamientos de consumo — no se resuelve en teoría. Tenemos el proceso, y vive en nuestra metodología de instalación, protocolos de reabastecimiento y estándares de respuesta de mantenimiento.',
  },
  {
    eyebrow: 'OPERACIONES',
    title: 'Nuestros partners no nos gestionan a nosotros. Ellos cobran.',
    body: 'El modelo operativo está diseñado para que marcas y venues tengan exactamente una tarea después de la instalación: revisar los resultados. Nosotros manejamos reabastecimiento, mantenimiento, reportes de performance y cualquier problema operativo.',
  },
  {
    eyebrow: 'POSICIONAMIENTO',
    title: 'Somos infraestructura, no un proveedor.',
    body: 'Un proveedor te vende algo y sigue adelante. La infraestructura es sobre lo que construyes — y en lo que confías cuando algo necesita funcionar sin que lo pienses. Esa es la relación que construimos. No dependencia. Confiabilidad.',
  },
]

const statsEn = [
  { icon: 'precision_manufacturing', label: '15 machine models across multiple categories' },
  { icon: 'storefront', label: 'Active placements growing across the Americas' },
  { icon: 'handshake', label: 'Brand partners across premium, emerging, and agency categories' },
  {
    icon: 'apartment',
    label: 'Venue partners across travel, entertainment, hospitality, and retail',
  },
  { icon: 'public', label: 'Operating in the USA and El Salvador — Curazao incoming' },
  { icon: 'autorenew', label: 'Built around venue partner renewal, not one-time placements' },
]

const statsEs = [
  { icon: 'precision_manufacturing', label: '15 modelos de máquina en múltiples categorías' },
  { icon: 'storefront', label: 'Ubicaciones activas creciendo en las Américas' },
  { icon: 'handshake', label: 'Brand partners en categorías premium, emergentes y de agencia' },
  { icon: 'apartment', label: 'Venue partners en viaje, entretenimiento, hospitalidad y retail' },
  { icon: 'public', label: 'Operando en USA y El Salvador — Curazao próximamente' },
  {
    icon: 'autorenew',
    label:
      'Construido alrededor de la renovación de venue partners, no ubicaciones de una sola vez',
  },
]

const buildLayout = (
  story: string[],
  differentiators: typeof differentiatorsEn,
  statsHeading: string,
  statsEyebrow: string,
  stats: typeof statsEn,
  closingHeadline: string,
  closingBody: string,
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
    blockName: 'What Makes Us Different',
    variant: 'pillar' as const,
    eyebrow: 'WHAT MAKES US DIFFERENT',
    heading: 'Built to feel premium. Operated to stay that way.',
    items: differentiators.map((d) => ({
      eyebrow: d.eyebrow,
      title: d.title,
      body: richText([d.body]),
    })),
  },
  {
    blockType: 'cardGrid' as const,
    blockName: 'By The Numbers',
    variant: 'icon' as const,
    eyebrow: statsEyebrow,
    heading: statsHeading,
    items: stats.map((s) => ({ icon: s.icon, title: s.label, body: richText(['']) })),
  },
  {
    blockType: 'cta' as const,
    blockName: 'Closing',
    richText: headingAndParagraphs(closingHeadline, 'h2' as const, [closingBody]),
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
          url: '/where-it-works',
          appearance: 'outline' as const,
        },
      },
    ],
  },
]

export const seedWhyAmerikiosks = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding why-amerikiosks page...')
  await upsertPage(
    payload,
    req,
    {
      title: 'Why Amerikiosks',
      slug: 'why-amerikiosks',
      hero: heroData,
      layout: buildLayout(
        storyEn,
        differentiatorsEn,
        'By the numbers.',
        'BY THE NUMBERS',
        statsEn,
        "We're not the biggest automated retail company. We're the one your brand actually wants to be associated with.",
        "Scale for its own sake has never been our goal. The goal is a network of placements that work — for the brands inside them, the venues that host them, and the people who encounter them. Every decision we make is in service of that. If that's the kind of partner you're looking for, the first conversation is straightforward.",
        'Talk to us',
        'See where we operate',
      ),
      meta: {
        title: 'Why Amerikiosks — Amerikiosks',
        description:
          "We're not competing on machine specs or price per unit. We're competing on what happens after the installation.",
      },
    },
    {
      title: 'Por Qué Amerikiosks',
      slug: 'por-que-amerikiosks',
      hero: esHeroData,
      layout: buildLayout(
        storyEs,
        differentiatorsEs,
        'En números.',
        'EN NÚMEROS',
        statsEs,
        'No somos la empresa de retail automatizado más grande. Somos con la que tu marca realmente quiere estar asociada.',
        'La escala por sí misma nunca ha sido nuestra meta. La meta es una red de ubicaciones que funcionan — para las marcas dentro de ellas, los venues que las albergan y las personas que las encuentran. Cada decisión que tomamos está al servicio de eso. Si ese es el tipo de partner que buscas, la primera conversación es sencilla.',
        'Habla con nosotros',
        'Ve dónde operamos',
      ),
      meta: {
        title: 'Por Qué Amerikiosks — Amerikiosks',
        description:
          'No competimos en especificaciones de máquina ni precio por unidad. Competimos en lo que pasa después de la instalación.',
      },
    },
  )
}
