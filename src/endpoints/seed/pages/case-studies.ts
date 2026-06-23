import type { Payload, PayloadRequest } from 'payload'
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

const heroData = {
  type: 'lowImpact' as const,
  links: [],
  breadcrumb: 'Home / Case Studies',
  tags: [{ label: 'Retail' }, { label: 'Venues' }, { label: 'Brands' }],
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
              text: "We don't ask you to take our word for it.",
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
              text: 'Every claim we make about brand presence, passive revenue, and turnkey deployment has a story behind it. Here are some of them.',
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
  breadcrumb: 'Inicio / Casos de Éxito',
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
              text: 'No te pedimos que nos creas por nuestra palabra.',
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
              text: 'Cada afirmación que hacemos sobre presencia de marca, ingresos pasivos y despliegue llave en mano tiene una historia detrás. Aquí están algunas de ellas.',
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

const storyEn = [
  "There's a version of this page that lists logos and calls it proof. This isn't that page.",
  'The brands and venues we work with didn\'t hire us because we had the right deck. They hired us because someone they trusted had already done it — and it worked. And when it worked, the conversation changed from "what is this?" to "where else can we put one?"',
  "That's the pattern we've seen across every category we operate in: skepticism, then a first placement, then expansion. Not because we pushed for it. Because the results made the next conversation easy.",
  'What follows are the real stories behind those conversations — the situation, what we did, and what happened after. Some numbers are placeholders while we finalize client approval. Every outcome is real.',
]

const storyEs = [
  'Existe una versión de esta página que solo enumera logos y la llama prueba. Esta no es esa página.',
  'Las marcas y venues con los que trabajamos no nos contrataron porque tuviéramos el mejor deck. Nos contrataron porque alguien en quien confiaban ya lo había hecho — y funcionó. Y cuando funcionó, la conversación cambió de "¿qué es esto?" a "¿dónde más podemos poner uno?"',
  'Ese es el patrón que hemos visto en cada categoría en la que operamos: escepticismo, luego una primera ubicación, luego expansión. No porque lo hayamos forzado. Porque los resultados hicieron fácil la siguiente conversación.',
  'Lo que sigue son las historias reales detrás de esas conversaciones — la situación, lo que hicimos y qué pasó después. Algunos números son provisionales mientras finalizamos la aprobación del cliente. Cada resultado es real.',
]

const caseStudiesEn = [
  {
    heading: "Carlo's Bakery — Premium Brand in a Travel Environment",
    sub: 'Full-Service Model · Travel Venue',
    situation:
      "Carlo's Bakery had brand equity that far exceeded their physical footprint. Their product was beloved, their identity was strong, but expanding through traditional retail meant leases, staff, and operational complexity they weren't ready to absorb at pace. They needed a distribution channel that moved as fast as their brand could.",
    whatWeDid:
      "We deployed a fully branded Amerikiosks unit at an airport terminal — wrapped in Carlo's visual identity, stocked with their signature products, operating 24/7 without a single Carlo's employee on site. Installation was complete within days, and the unit was live before their next marketing push.",
    whatHappened:
      "Results pending client confirmation: units sold, revenue, brand impressions, and repeat engagement. The result was not just sales — it was presence in an environment where Carlos's hadn't been before, and an audience that encountered the brand at exactly the right moment.",
    quote: 'Client quote pending confirmation.',
    quoteAttribution: "Name, Title, Carlo's Bakery",
    linkLabel: 'See Travel placements',
    linkUrl: '/travel-and-transit',
  },
  {
    heading: 'Venue Partner — Passive Revenue from Underutilized Space',
    sub: 'Venue Operator Model · Venue category TBD',
    situation:
      "A venue had the traffic. They had the square footage. What they didn't have was a way to monetize the intersection of the two without adding operational complexity to a team that was already stretched. A traditional retail partnership meant negotiating with tenants, managing build-out, and absorbing the liability of someone else's operation inside their property. None of that was acceptable.",
    whatWeDid:
      'We installed a unit fully managed by Amerikiosks — restocking, maintenance, reporting. The venue received a monthly revenue share with zero ongoing involvement required.',
    whatHappened:
      'Results pending client confirmation: monthly revenue, uptime, guest satisfaction data. The unit became a recurring line item on their revenue report — not a pilot, not a test. Infrastructure.',
    quote: 'Client quote pending confirmation.',
    quoteAttribution: 'Name, Title, Venue',
    linkLabel: 'See Venue partnerships',
    linkUrl: '/for-venues',
  },
  {
    heading: 'Emerging Brand — Premium Placement Without the Premium Cost',
    sub: 'Services Model · Retail + Campus Venue',
    situation:
      "A brand was ready for physical retail. Their product had proven itself online. Their audience existed in the real world — on campuses, in offices, in the kinds of environments where discovery happens in person. What they didn't have was the capital for a traditional retail footprint. A lease, a build-out, staff — the math didn't work yet.",
    whatWeDid:
      'We placed a unit in a campus / corporate environment under the Services model — the brand owned the revenue, Amerikiosks handled location, restocking, and maintenance. Operational within weeks. No lease. No staff. No build-out.',
    whatHappened:
      "Results pending client confirmation: weekly transaction volume, revenue, repeat purchase rate, brand recognition lift. The unit gave them data they'd never had before: real purchase behavior from a real physical audience. That data shaped their next product decision.",
    quote: 'Client quote pending confirmation.',
    quoteAttribution: 'Name, Title, Brand',
    linkLabel: 'See Emerging Brand options',
    linkUrl: '/for-emerging-brands',
  },
]

const caseStudiesEs = [
  {
    heading: "Carlo's Bakery — Marca Premium en un Entorno de Viaje",
    sub: 'Modelo Full-Service · Venue de Viaje',
    situation:
      "Carlo's Bakery tenía un valor de marca que superaba por mucho su presencia física. Su producto era amado, su identidad era fuerte, pero expandirse a través de retail tradicional significaba arrendamientos, personal y complejidad operativa que no estaban listos para absorber al ritmo que necesitaban. Necesitaban un canal de distribución que se moviera tan rápido como su marca.",
    whatWeDid:
      "Desplegamos una unidad Amerikiosks con marca completa en una terminal de aeropuerto — envuelta en la identidad visual de Carlo's, abastecida con sus productos insignia, operando 24/7 sin un solo empleado de Carlo's en sitio. La instalación se completó en días, y la unidad estaba activa antes de su siguiente campaña de marketing.",
    whatHappened:
      "Resultados pendientes de confirmación del cliente: unidades vendidas, ingresos, impresiones de marca y engagement recurrente. El resultado no fue solo ventas — fue presencia en un entorno donde Carlo's no había estado antes, y una audiencia que encontró la marca en el momento exacto.",
    quote: 'Cita del cliente pendiente de confirmación.',
    quoteAttribution: "Nombre, Cargo, Carlo's Bakery",
    linkLabel: 'Ver ubicaciones de Viaje',
    linkUrl: '/travel-and-transit',
  },
  {
    heading: 'Venue Partner — Ingreso Pasivo de Espacio Subutilizado',
    sub: 'Modelo Operador de Venue · Categoría de venue por confirmar',
    situation:
      'Un venue tenía el tráfico. Tenía los metros cuadrados. Lo que no tenía era una forma de monetizar la intersección de ambos sin agregar complejidad operativa a un equipo que ya estaba al límite. Una alianza de retail tradicional significaba negociar con inquilinos, gestionar la construcción y absorber la responsabilidad de la operación de otra persona dentro de su propiedad. Nada de eso era aceptable.',
    whatWeDid:
      'Instalamos una unidad completamente gestionada por Amerikiosks — reabastecimiento, mantenimiento, reportes. El venue recibió una participación mensual de ingresos sin ninguna implicación operativa continua.',
    whatHappened:
      'Resultados pendientes de confirmación del cliente: ingreso mensual, uptime, datos de satisfacción del huésped. La unidad se convirtió en una línea recurrente en su reporte de ingresos — no un piloto, no una prueba. Infraestructura.',
    quote: 'Cita del cliente pendiente de confirmación.',
    quoteAttribution: 'Nombre, Cargo, Venue',
    linkLabel: 'Ver alianzas con venues',
    linkUrl: '/for-venues',
  },
  {
    heading: 'Marca Emergente — Ubicación Premium Sin el Costo Premium',
    sub: 'Modelo de Servicios · Venue de Retail + Campus',
    situation:
      'Una marca estaba lista para retail físico. Su producto ya se había probado en línea. Su audiencia existía en el mundo real — en campus, en oficinas, en los entornos donde el descubrimiento ocurre en persona. Lo que no tenían era el capital para una presencia de retail tradicional. Un arrendamiento, una construcción, personal — los números no funcionaban todavía.',
    whatWeDid:
      'Colocamos una unidad en un entorno de campus / corporativo bajo el modelo de Servicios — la marca era dueña del ingreso, Amerikiosks manejó la ubicación, reabastecimiento y mantenimiento. Operativa en semanas. Sin arrendamiento. Sin personal. Sin construcción.',
    whatHappened:
      'Resultados pendientes de confirmación del cliente: volumen de transacciones semanales, ingreso, tasa de recompra, mejora en reconocimiento de marca. La unidad les dio datos que nunca habían tenido: comportamiento de compra real de una audiencia física real. Esos datos moldearon su siguiente decisión de producto.',
    quote: 'Cita del cliente pendiente de confirmación.',
    quoteAttribution: 'Nombre, Cargo, Marca',
    linkLabel: 'Ver opciones para Marcas Emergentes',
    linkUrl: '/for-emerging-brands',
  },
]

const patternEn = [
  'Every story above follows the same arc: a brand or venue had something valuable — equity, space, audience, product — and a gap between that asset and the return it should have been generating.',
  'We closed the gap. Not with a complicated integration. Not with a long implementation timeline. With infrastructure that was already built, already proven, and already operating in environments like theirs.',
  'The first placement is always the hardest conversation. After that, the results do the talking.',
]

const patternEs = [
  'Cada historia anterior sigue el mismo arco: una marca o venue tenía algo valioso — equidad, espacio, audiencia, producto — y una brecha entre ese activo y el retorno que debería haber generado.',
  'Nosotros cerramos la brecha. No con una integración complicada. No con un cronograma de implementación largo. Con infraestructura que ya estaba construida, ya probada y ya operando en entornos como el suyo.',
  'La primera ubicación siempre es la conversación más difícil. Después de eso, los resultados hablan por sí solos.',
]

const buildLayout = (
  story: string[],
  caseStudies: typeof caseStudiesEn,
  pattern: string[],
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
  ...caseStudies.map((cs) => ({
    blockType: 'content' as const,
    blockName: cs.heading,
    columns: [
      {
        size: 'full' as const,
        richText: headingAndParagraphs(cs.heading, 'h3' as const, [
          cs.sub,
          cs.situation,
          cs.whatWeDid,
          cs.whatHappened,
          `"${cs.quote}" — ${cs.quoteAttribution}`,
        ]),
        enableLink: true,
        link: { label: cs.linkLabel, type: 'custom' as const, url: cs.linkUrl },
      },
    ],
  })),
  {
    blockType: 'content' as const,
    blockName: 'The Pattern',
    columns: [
      {
        size: 'full' as const,
        richText: headingAndParagraphs('The Pattern Across All of Them', 'h2' as const, pattern),
      },
    ],
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

export const seedCaseStudies = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding case-studies page...')
  await upsertPage(
    payload,
    req,
    {
      title: 'Case Studies',
      slug: 'case-studies',
      hero: heroData,
      layout: buildLayout(
        storyEn,
        caseStudiesEn,
        patternEn,
        'Your story starts with one placement.',
        "Every case study here began with a single conversation about a single location. The expansions, the results, the ongoing partnerships — those came after. We're not asking for a long-term commitment. We're asking for a first one.",
        'Start the conversation',
        'See where we operate',
      ),
      meta: {
        title: 'Case Studies — Amerikiosks',
        description:
          'Real stories behind Amerikiosks placements — the situation, what we did, and what happened after.',
      },
    },
    {
      title: 'Casos de Éxito',
      slug: 'casos-de-exito',
      hero: esHeroData,
      layout: buildLayout(
        storyEs,
        caseStudiesEs,
        patternEs,
        'Tu historia comienza con una ubicación.',
        'Cada caso de éxito aquí comenzó con una sola conversación sobre una sola ubicación. Las expansiones, los resultados, las alianzas continuas — eso llegó después. No te pedimos un compromiso de largo plazo. Te pedimos uno primero.',
        'Inicia la conversación',
        'Ve dónde operamos',
      ),
      meta: {
        title: 'Casos de Éxito — Amerikiosks',
        description:
          'Historias reales detrás de las ubicaciones de Amerikiosks — la situación, qué hicimos y qué pasó después.',
      },
    },
  )
}
