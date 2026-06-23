import path from 'node:path'
import type { Payload, PayloadRequest } from 'payload'
import { uploadMedia } from '../uploadMedia'
import { upsertPage } from './utils'

const richText = (paragraphs: string[]) => ({
  root: {
    type: 'root',
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
    type: 'root',
    version: 1,
    direction: null,
    format: '' as const,
    indent: 0,
    children: [
      {
        type: 'heading',
        tag: 'h2',
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

type Segment = {
  eyebrow: string
  title: string
  body: string
  linkLabel: string
  linkUrl: string
}

type VenueType = { icon: string; label: string }

type CaseStudy = {
  venueType: string
  brandPartner: string
  location: string
  situation: string
  whatWeDid: string
  result: string
  quote: string
  quoteAttribution: string
}

type LocaleContent = {
  title: string
  slug: string
  heroHeadline: string
  heroSubheadline: string
  heroTags: string[]
  heroPrimaryCta: string
  heroSecondaryCta: string
  storyHeading: string
  storyParagraphs: string[]
  venueTypesEyebrow: string
  venueTypesHeading: string
  venueTypes: VenueType[]
  segmentsEyebrow: string
  segmentsHeading: string
  segments: Segment[]
  caseStudyHeading: string
  caseStudy: CaseStudy
  closingHeadline: string
  closingBody: string
  closingPrimaryCta: string
  closingSecondaryCta: string
  metaDescription: string
}

type DetailPage = {
  heroAsset: string
  heroAlt: string
  en: LocaleContent
  es: LocaleContent
}

const pages: DetailPage[] = [
  // ── Entertainment ──────────────────────────────────────────────────────────
  {
    heroAsset: 'project-fan-stand.jpg',
    heroAlt: 'Branded kiosk on an arena concourse during a live event',
    en: {
      title: 'Entertainment Venues',
      slug: 'entertainment-venues',
      heroHeadline: "When the crowd is already electric, your brand doesn't have to try hard.",
      heroSubheadline:
        "Arenas, stadiums, theme parks, concert venues — entertainment environments are where attention peaks and inhibition drops. Amerikiosks operates here because context isn't background noise. It's the message.",
      heroTags: [{ label: 'Arenas' }, { label: 'Theme Parks' }, { label: 'Concert Venues' }].map(
        (t) => t.label,
      ),
      heroPrimaryCta: 'Talk to us about entertainment placements',
      heroSecondaryCta: 'See our full venue network',
      storyHeading: 'The Story',
      storyParagraphs: [
        "Think about the last time you were at a concert, a playoff game, a theme park on a Saturday. The energy in those spaces is unlike anything a screen can replicate. People are present, emotionally activated, and spending freely — on food, on merchandise, on moments they want to remember. That's not a crowd. That's an audience already leaning in.",
        "Most brands fight for that state of mind through advertising, campaigns, and activations that cost hundreds of thousands and last a weekend. Amerikiosks puts you inside that environment permanently — not as a sponsor banner above the scoreboard, but as a physical brand experience on the concourse, next to the gate, in the walkway where 18,000 people pass on their way to their seats. You're not interrupting the experience. You're part of it.",
        'And for venue operators, that means a new revenue stream that activates every single event — without adding a single line item to your staffing budget.',
      ],
      venueTypesEyebrow: 'WHAT ENTERTAINMENT VENUES LOOK LIKE',
      venueTypesHeading: 'Where the energy already exists.',
      venueTypes: [
        { icon: 'sports_basketball', label: 'Sports arenas and stadiums' },
        { icon: 'music_note', label: 'Concert halls and amphitheaters' },
        { icon: 'attractions', label: 'Theme parks and family entertainment centers' },
        { icon: 'event', label: 'Event centers with recurring programming' },
      ],
      segmentsEyebrow: 'WHO THIS SERVES',
      segmentsHeading: 'Built for three different goals on the same concourse.',
      segments: [
        {
          eyebrow: 'PREMIUM BRANDS',
          title: 'For Premium Brands',
          body: "Entertainment venues self-select your audience for you. Luxury box holders, season ticket members, premium event attendees — the demographic profile of a major arena skews exactly where you want to be. Your unit isn't just available. It's associated with that experience.",
          linkLabel: 'See how we work with premium brands',
          linkUrl: '/for-brands',
        },
        {
          eyebrow: 'VENUE OPERATORS',
          title: 'For Venue Operators',
          body: "You have 20,000 people walking your concourses on game night and empty square footage between activations. That's not a venue problem — that's an untapped revenue line. We install, operate, restock, and maintain. You add a monthly revenue figure to your report without adding complexity to your operation.",
          linkLabel: 'See how we work with venues',
          linkUrl: '/for-venues',
        },
        {
          eyebrow: 'EMERGING BRANDS',
          title: 'For Emerging Brands',
          body: "Theme parks and entertainment centers are aspirational environments. Consumers associate what they buy there with the feeling of the experience itself. For an emerging brand, that association is worth more than any influencer campaign — and it's available at a fraction of what a sponsorship deal would cost.",
          linkLabel: 'See options for emerging brands',
          linkUrl: '/for-emerging-brands',
        },
      ],
      caseStudyHeading: 'Case Study',
      caseStudy: {
        venueType: 'Sports arena / Entertainment center',
        brandPartner: 'Representative case — confirm with client',
        location: 'Arena, City TBD',
        situation:
          'A venue operator needed to maximize per-event revenue without expanding headcount or retrofitting concourse retail infrastructure. A brand partner was simultaneously looking for a high-visibility placement aligned with families, young adults, and experience-seekers.',
        whatWeDid:
          'We installed a fully branded unit in the concourse, operational before tip-off and stocked for peak event demand, with zero staff required from the venue. Branding matched the event aesthetic and product selection was curated for the specific audience profile of that venue.',
        result:
          'Results pending — revenue per event, units moved, and brand impressions to be supplied by client.',
        quote: 'Client quote pending — venue operator or brand partner perspective.',
        quoteAttribution: 'Name, Title, Organization',
      },
      closingHeadline: '18,000 people walked past your brand last Saturday. Were you there?',
      closingBody:
        "Entertainment venues are the highest-density brand moments available outside of digital. We know how to place, operate, and optimize within them — because we've done it, and we don't treat every venue the same.",
      closingPrimaryCta: 'Talk to us about entertainment placements',
      closingSecondaryCta: 'See our full venue network',
      metaDescription:
        'Branded kiosks in arenas, stadiums, theme parks, and concert venues — built for premium brands, venue operators, and emerging brands.',
    },
    es: {
      title: 'Venues de Entretenimiento',
      slug: 'venues-de-entretenimiento',
      heroHeadline: 'Cuando la multitud ya está eléctrica, tu marca no tiene que esforzarse.',
      heroSubheadline:
        'Arenas, estadios, parques temáticos, venues de conciertos — los entornos de entretenimiento son donde la atención alcanza su pico y la inhibición cae. Amerikiosks opera ahí porque el contexto no es ruido de fondo. Es el mensaje.',
      heroTags: ['Arenas', 'Parques Temáticos', 'Venues de Conciertos'],
      heroPrimaryCta: 'Hablemos de ubicaciones en entretenimiento',
      heroSecondaryCta: 'Ver toda nuestra red de venues',
      storyHeading: 'La Historia',
      storyParagraphs: [
        'Piensa en la última vez que estuviste en un concierto, un partido de playoffs, un parque temático un sábado. La energía de esos espacios no se compara con nada que una pantalla pueda replicar. La gente está presente, emocionalmente activada y gastando libremente — en comida, en merchandising, en momentos que quiere recordar. Eso no es una multitud. Es una audiencia que ya está inclinada a comprar.',
        'La mayoría de las marcas pelean por ese estado de ánimo con publicidad, campañas y activaciones que cuestan cientos de miles de dólares y duran un fin de semana. Amerikiosks te coloca dentro de ese entorno de forma permanente — no como un banner de sponsor sobre el marcador, sino como una experiencia de marca física en el pasillo, junto a la puerta, en el camino donde 18,000 personas pasan hacia sus asientos. No estás interrumpiendo la experiencia. Eres parte de ella.',
        'Y para los operadores de venues, eso significa un nuevo flujo de ingresos que se activa en cada evento — sin agregar una sola línea al presupuesto de personal.',
      ],
      venueTypesEyebrow: 'CÓMO SE VEN LOS VENUES DE ENTRETENIMIENTO',
      venueTypesHeading: 'Donde la energía ya existe.',
      venueTypes: [
        { icon: 'sports_basketball', label: 'Arenas y estadios deportivos' },
        { icon: 'music_note', label: 'Salas de concierto y anfiteatros' },
        { icon: 'attractions', label: 'Parques temáticos y centros de entretenimiento familiar' },
        { icon: 'event', label: 'Centros de eventos con programación recurrente' },
      ],
      segmentsEyebrow: 'A QUIÉN SIRVE',
      segmentsHeading: 'Construido para tres objetivos distintos en el mismo pasillo.',
      segments: [
        {
          eyebrow: 'MARCAS PREMIUM',
          title: 'Para Marcas Premium',
          body: 'Los venues de entretenimiento seleccionan tu audiencia por ti. Titulares de palcos de lujo, miembros de boletos de temporada, asistentes a eventos premium — el perfil demográfico de una arena importante coincide exactamente con donde quieres estar. Tu unidad no solo está disponible. Está asociada con esa experiencia.',
          linkLabel: 'Ver cómo trabajamos con marcas premium',
          linkUrl: '/for-brands',
        },
        {
          eyebrow: 'OPERADORES DE VENUES',
          title: 'Para Operadores de Venues',
          body: 'Tienes 20,000 personas caminando por tus pasillos la noche del juego y metros cuadrados vacíos entre activaciones. Eso no es un problema del venue — es una línea de ingresos sin explotar. Nosotros instalamos, operamos, reabastecemos y damos mantenimiento. Tú agregas una cifra de ingresos mensuales a tu reporte sin agregar complejidad a tu operación.',
          linkLabel: 'Ver cómo trabajamos con venues',
          linkUrl: '/for-venues',
        },
        {
          eyebrow: 'MARCAS EMERGENTES',
          title: 'Para Marcas Emergentes',
          body: 'Los parques temáticos y centros de entretenimiento son entornos aspiracionales. Los consumidores asocian lo que compran ahí con la sensación de la experiencia misma. Para una marca emergente, esa asociación vale más que cualquier campaña de influencers — y está disponible a una fracción de lo que costaría un acuerdo de sponsoreo.',
          linkLabel: 'Ver opciones para marcas emergentes',
          linkUrl: '/for-emerging-brands',
        },
      ],
      caseStudyHeading: 'Caso de Estudio',
      caseStudy: {
        venueType: 'Arena deportiva / Centro de entretenimiento',
        brandPartner: 'Caso representativo — confirmar con cliente',
        location: 'Arena, Ciudad por confirmar',
        situation:
          'Un operador de venue necesitaba maximizar el ingreso por evento sin ampliar su personal ni adaptar la infraestructura de retail del pasillo. Un brand partner buscaba simultáneamente una ubicación de alta visibilidad alineada con familias, jóvenes adultos y buscadores de experiencias.',
        whatWeDid:
          'Instalamos una unidad con marca completa en el pasillo, operativa antes del inicio del evento y abastecida para la demanda pico, sin requerir personal del venue. El branding coincidió con la estética del evento y la selección de producto se curó para el perfil de audiencia específico de ese venue.',
        result:
          'Resultados pendientes — ingreso por evento, unidades vendidas e impresiones de marca a ser provistos por el cliente.',
        quote:
          'Cita del cliente pendiente — perspectiva del operador del venue o del brand partner.',
        quoteAttribution: 'Nombre, Cargo, Organización',
      },
      closingHeadline: '18,000 personas pasaron junto a tu marca el sábado pasado. ¿Estabas ahí?',
      closingBody:
        'Los venues de entretenimiento son los momentos de marca de mayor densidad disponibles fuera de lo digital. Sabemos cómo ubicar, operar y optimizar dentro de ellos — porque lo hemos hecho, y no tratamos a todos los venues por igual.',
      closingPrimaryCta: 'Hablemos de ubicaciones en entretenimiento',
      closingSecondaryCta: 'Ver toda nuestra red de venues',
      metaDescription:
        'Kiosks de marca en arenas, estadios, parques temáticos y venues de conciertos — construidos para marcas premium, operadores de venues y marcas emergentes.',
    },
  },
  // ── Hospitality ────────────────────────────────────────────────────────────
  {
    heroAsset: 'hero-for-venues.jpg',
    heroAlt: 'Branded kiosk in a luxury hotel lobby',
    en: {
      title: 'Hospitality and Destinations',
      slug: 'hospitality-and-destinations',
      heroHeadline: "Luxury properties don't accept mediocre amenities. Neither do we.",
      heroSubheadline:
        'Hotels, resorts, and premium properties are where guests spend days — not minutes. Longer dwell time, higher spend intent, and an audience that expects quality in everything they encounter. Amerikiosks was built to match that standard.',
      heroTags: ['Hotels', 'Resorts', 'Cruise Ships'],
      heroPrimaryCta: 'Talk to us about hospitality placements',
      heroSecondaryCta: 'See our full venue network',
      storyHeading: 'The Story',
      storyParagraphs: [
        "A guest checks into a five-star hotel. The lobby is immaculate. The service is flawless. The room is exactly what they expected. Then they need something at 11pm — a skincare product they forgot to pack, a premium snack before an early flight, a gift for a colleague they're meeting tomorrow. And what they find is a glass cabinet with fluorescent lighting and three options that belong in a gas station. That's the gap Amerikiosks closes.",
        "Hospitality is the only environment where guests have both time and willingness to discover brands they haven't tried before. They're relaxed, in a mindset of indulgence. And if your brand is there — beautifully presented, thoughtfully positioned, operating without friction — you're not just making a sale. You're becoming part of a memory.",
        'For venue operators in hospitality, this is even simpler: your guests already expect curated experiences. We deliver one that generates revenue for you and elevates the perception of your property. No staff. No complexity. Just a unit that looks like it belongs — because it does.',
      ],
      venueTypesEyebrow: 'WHAT HOSPITALITY VENUES LOOK LIKE',
      venueTypesHeading: 'Where guests have time, and willingness to discover.',
      venueTypes: [
        { icon: 'hotel', label: 'Luxury and boutique hotels' },
        { icon: 'beach_access', label: 'Resorts and vacation properties' },
        { icon: 'business_center', label: 'Extended-stay and business travel properties' },
        { icon: 'casino', label: 'Casino floors and integrated resort complexes' },
        { icon: 'directions_boat', label: 'Cruise ships and onboard hospitality' },
      ],
      segmentsEyebrow: 'WHO THIS SERVES',
      segmentsHeading: 'A standard guests already expect — extended to your brand.',
      segments: [
        {
          eyebrow: 'PREMIUM BRANDS',
          title: 'For Premium Brands',
          body: "Hotel guests are pre-qualified. They're spending on the experience — which means they're already open to brands that match that standard. A unit in a luxury property isn't a vending machine. It's a curated retail moment in an environment that does your positioning work for you.",
          linkLabel: 'See how we work with premium brands',
          linkUrl: '/for-brands',
        },
        {
          eyebrow: 'VENUE OPERATORS',
          title: 'For Venue Operators',
          body: "Your property's revenue doesn't stop at room rate and F&B. Every touchpoint is an opportunity — and the hallway between the elevator and the gym is one you're currently leaving empty. We turn underutilized square footage into a branded amenity that guests appreciate and that generates monthly revenue without a single additional hire.",
          linkLabel: 'See how we work with venues',
          linkUrl: '/for-venues',
        },
        {
          eyebrow: 'EMERGING BRANDS',
          title: 'For Emerging Brands',
          body: 'Hospitality gives emerging brands something rare: a premium context they could not buy on their own. Guests encounter you in a moment of relaxation and receptivity — exactly when brand discovery happens.',
          linkLabel: 'See options for emerging brands',
          linkUrl: '/for-emerging-brands',
        },
      ],
      caseStudyHeading: 'Case Study',
      caseStudy: {
        venueType: 'Luxury hotel / Resort property',
        brandPartner: 'Premium skincare / lifestyle brand — confirm with client',
        location: 'Property, City TBD',
        situation:
          'A hotel group was looking for ways to elevate its in-property amenity offering and generate ancillary revenue without expanding retail staff or overhauling its lobby layout. A traditional gift shop model was not viable — the investment and overhead did not pencil out.',
        whatWeDid:
          "We installed a custom-wrapped Amerikiosks unit in the lobby, with a curated product selection aligned with the property's guest profile and branding that complemented the hotel's aesthetic rather than interrupting it. Turnkey installation, zero training required for hotel staff.",
        result:
          'Results pending — monthly revenue, guest satisfaction lift, and average transaction value to be supplied by client.',
        quote: 'Client quote pending — from hotel GM or brand partner.',
        quoteAttribution: 'Name, Title, Property',
      },
      closingHeadline: 'Your guests expect quality in every corner. So do we.',
      closingBody:
        "We don't place a standard unit in a premium property and call it done. Every hospitality deployment is evaluated for aesthetic fit, product curation, and placement logic. If it doesn't belong in your lobby, we won't put it there.",
      closingPrimaryCta: 'Talk to us about hospitality placements',
      closingSecondaryCta: 'See our full venue network',
      metaDescription:
        'Branded kiosks in hotels, resorts, and premium properties — curated for guest dwell time and built for venue operators and brands.',
    },
    es: {
      title: 'Hospitalidad y Destinos',
      slug: 'hospitalidad-y-destinos',
      heroHeadline: 'Las propiedades de lujo no aceptan amenidades mediocres. Nosotros tampoco.',
      heroSubheadline:
        'Hoteles, resorts y propiedades premium son donde los huéspedes pasan días — no minutos. Más tiempo de permanencia, mayor intención de gasto, y una audiencia que espera calidad en todo lo que encuentra. Amerikiosks se construyó para cumplir ese estándar.',
      heroTags: ['Hoteles', 'Resorts', 'Cruceros'],
      heroPrimaryCta: 'Hablemos de ubicaciones en hospitalidad',
      heroSecondaryCta: 'Ver toda nuestra red de venues',
      storyHeading: 'La Historia',
      storyParagraphs: [
        'Un huésped se registra en un hotel de cinco estrellas. El lobby es impecable. El servicio es impecable. La habitación es exactamente lo que esperaba. Luego necesita algo a las 11pm — un producto de skincare que olvidó empacar, un snack premium antes de un vuelo temprano, un regalo para un colega con quien se reunirá mañana. Y lo que encuentra es una vitrina de vidrio con luz fluorescente y tres opciones que parecen de una gasolinera. Esa es la brecha que Amerikiosks cierra.',
        'La hospitalidad es el único entorno donde los huéspedes tienen tanto el tiempo como la disposición para descubrir marcas que no han probado. Están relajados, en un estado de indulgencia. Y si tu marca está ahí — bellamente presentada, posicionada con cuidado, operando sin fricción — no solo estás haciendo una venta. Te estás convirtiendo en parte de un recuerdo.',
        'Para los operadores de venues en hospitalidad, esto es aún más simple: tus huéspedes ya esperan experiencias curadas. Nosotros entregamos una que genera ingresos para ti y eleva la percepción de tu propiedad. Sin personal. Sin complejidad. Solo una unidad que se ve como si perteneciera ahí — porque pertenece.',
      ],
      venueTypesEyebrow: 'CÓMO SE VEN LOS VENUES DE HOSPITALIDAD',
      venueTypesHeading: 'Donde los huéspedes tienen tiempo y disposición para descubrir.',
      venueTypes: [
        { icon: 'hotel', label: 'Hoteles de lujo y boutique' },
        { icon: 'beach_access', label: 'Resorts y propiedades vacacionales' },
        { icon: 'business_center', label: 'Propiedades de estadía extendida y viaje de negocios' },
        { icon: 'casino', label: 'Pisos de casino y complejos de resort integrados' },
        { icon: 'directions_boat', label: 'Cruceros y hospitalidad a bordo' },
      ],
      segmentsEyebrow: 'A QUIÉN SIRVE',
      segmentsHeading: 'Un estándar que los huéspedes ya esperan — extendido a tu marca.',
      segments: [
        {
          eyebrow: 'MARCAS PREMIUM',
          title: 'Para Marcas Premium',
          body: 'Los huéspedes de hotel están pre-calificados. Están gastando en la experiencia — lo que significa que ya están abiertos a marcas que coincidan con ese estándar. Una unidad en una propiedad de lujo no es una máquina expendedora. Es un momento de retail curado en un entorno que hace el trabajo de posicionamiento por ti.',
          linkLabel: 'Ver cómo trabajamos con marcas premium',
          linkUrl: '/for-brands',
        },
        {
          eyebrow: 'OPERADORES DE VENUES',
          title: 'Para Operadores de Venues',
          body: 'El ingreso de tu propiedad no termina en tarifa de habitación y alimentos y bebidas. Cada punto de contacto es una oportunidad — y el pasillo entre el elevador y el gimnasio es uno que actualmente dejas vacío. Convertimos metros cuadrados subutilizados en una amenidad de marca que los huéspedes aprecian y que genera ingresos mensuales sin una sola contratación adicional.',
          linkLabel: 'Ver cómo trabajamos con venues',
          linkUrl: '/for-venues',
        },
        {
          eyebrow: 'MARCAS EMERGENTES',
          title: 'Para Marcas Emergentes',
          body: 'La hospitalidad les da a las marcas emergentes algo raro: un contexto premium que no podrían comprar por su cuenta. Los huéspedes te encuentran en un momento de relajación y receptividad — exactamente cuando ocurre el descubrimiento de marca.',
          linkLabel: 'Ver opciones para marcas emergentes',
          linkUrl: '/for-emerging-brands',
        },
      ],
      caseStudyHeading: 'Caso de Estudio',
      caseStudy: {
        venueType: 'Hotel de lujo / Propiedad de resort',
        brandPartner: 'Marca premium de skincare / lifestyle — confirmar con cliente',
        location: 'Propiedad, Ciudad por confirmar',
        situation:
          'Un grupo hotelero buscaba formas de elevar su oferta de amenidades dentro de la propiedad y generar ingresos adicionales sin ampliar su personal de retail ni rediseñar el layout de su lobby. Un modelo tradicional de tienda de regalos no era viable — la inversión y los costos operativos no eran rentables.',
        whatWeDid:
          'Instalamos una unidad Amerikiosks con wrap personalizado en el lobby, con una selección de producto curada según el perfil de huésped de la propiedad y un branding que complementaba la estética del hotel en lugar de interrumpirla. Instalación llave en mano, sin capacitación requerida para el personal del hotel.',
        result:
          'Resultados pendientes — ingreso mensual, mejora en satisfacción del huésped y ticket promedio a ser provistos por el cliente.',
        quote: 'Cita del cliente pendiente — del gerente general del hotel o del brand partner.',
        quoteAttribution: 'Nombre, Cargo, Propiedad',
      },
      closingHeadline: 'Tus huéspedes esperan calidad en cada rincón. Nosotros también.',
      closingBody:
        'No colocamos una unidad estándar en una propiedad premium y lo damos por terminado. Cada despliegue en hospitalidad se evalúa por ajuste estético, curaduría de producto y lógica de ubicación. Si no pertenece en tu lobby, no la pondremos ahí.',
      closingPrimaryCta: 'Hablemos de ubicaciones en hospitalidad',
      closingSecondaryCta: 'Ver toda nuestra red de venues',
      metaDescription:
        'Kiosks de marca en hoteles, resorts y propiedades premium — curados para el tiempo de permanencia del huésped y construidos para operadores de venues y marcas.',
    },
  },
  // ── Retail + Campus ────────────────────────────────────────────────────────
  {
    heroAsset: 'hero-for-agencies.png',
    heroAlt: 'Branded kiosk in a busy retail mall or campus common area',
    en: {
      title: 'Retail and Campuses',
      slug: 'retail-and-campuses',
      heroHeadline: 'One visit is an impression. Daily traffic is a relationship.',
      heroSubheadline:
        "Shopping centers, corporate campuses, and universities share something airports and arenas don't: the same people come back, every day, every week. That's not foot traffic — that's a built-in audience, and Amerikiosks operates right in the middle of it.",
      heroTags: ['Malls', 'Universities', 'Corporate Campuses'],
      heroPrimaryCta: 'Talk to us about retail and campus placements',
      heroSecondaryCta: 'See our full venue network',
      storyHeading: 'The Story',
      storyParagraphs: [
        "There's a version of brand-building that most companies can't afford: the flagship store on the premium retail corridor, open seven days a week, staffed and managed and optimized for the 200 people who walk through it on a Tuesday. And then there's this.",
        'A corporate campus with 3,000 employees who eat lunch in the same quad, pass the same building twice a day, and respond to brands that feel like they belong in their environment. A university with 20,000 students who form habits — coffee, snacks, products — that follow them for decades. A shopping mall where 15,000 people circulate every weekend looking for something to buy.',
        "Retail and campus environments aren't about a single high-energy moment. They're about repetition, recognition, the slow build of familiarity that turns a first purchase into a habit. This is where brand loyalty gets built — not in a campaign, but in a Tuesday afternoon when someone walks past your unit for the fourth time that week and finally stops.",
      ],
      venueTypesEyebrow: 'WHAT RETAIL AND CAMPUS VENUES LOOK LIKE',
      venueTypesHeading: 'Where the same people come back every day.',
      venueTypes: [
        { icon: 'local_mall', label: 'Shopping malls and mixed-use retail centers' },
        { icon: 'apartment', label: 'Corporate campuses and office park commons' },
        {
          icon: 'school',
          label: 'University facilities — student unions, libraries, residence halls',
        },
        { icon: 'local_hospital', label: 'Hospital and healthcare campuses' },
        {
          icon: 'account_balance',
          label: 'Government and institutional buildings with high daily traffic',
        },
      ],
      segmentsEyebrow: 'WHO THIS SERVES',
      segmentsHeading: 'Daily presence, built for compounding returns.',
      segments: [
        {
          eyebrow: 'EMERGING BRANDS',
          title: 'For Emerging Brands',
          body: 'This is your entry point into physical retail without the overhead. A unit on a university campus or in a corporate common area gives you a recurring audience and daily visibility — without a lease, without staff, without the capital commitment of a traditional retail location.',
          linkLabel: 'See options for emerging brands',
          linkUrl: '/for-emerging-brands',
        },
        {
          eyebrow: 'VENUE OPERATORS',
          title: 'For Venue Operators',
          body: 'Daily traffic means daily revenue. Unlike event-based venues, retail and campus environments generate consistent, predictable returns from a single unit — because the same audience is there every day. We handle everything after installation. You capture the revenue on a recurring basis.',
          linkLabel: 'See how we work with venues',
          linkUrl: '/for-venues',
        },
        {
          eyebrow: 'PREMIUM BRANDS',
          title: 'For Premium Brands',
          body: 'Corporate campuses and premium retail environments host exactly the audience you are targeting: high-income professionals, decision-makers, brand-conscious consumers with disposable income and daily routine. A placement in the right corporate campus is direct access to the individual behind the title.',
          linkLabel: 'See how we work with premium brands',
          linkUrl: '/for-brands',
        },
      ],
      caseStudyHeading: 'Case Study',
      caseStudy: {
        venueType: 'Corporate campus / University facility',
        brandPartner: 'Lifestyle or wellness brand — confirm with client',
        location: 'Campus or complex, City TBD',
        situation:
          'A campus operator needed to solve a specific gap: high daily traffic, underserved at the point of need, with no viable retail option within reach. Opening a traditional retail outlet was not feasible — the volume was there, but the operational model did not support staffed retail.',
        whatWeDid:
          'We placed a fully branded Amerikiosks unit in the campus common area, with product selection curated for the specific demographic of that environment. Operational within days, with zero training or management required from the venue.',
        result:
          'Results pending — weekly revenue, daily transaction volume, and repeat purchase rate to be supplied by client.',
        quote: 'Client quote pending — from campus operator or brand partner.',
        quoteAttribution: 'Name, Title, Organization',
      },
      closingHeadline: 'Campaigns end. Presence compounds.',
      closingBody:
        "Retail and campus placements aren't a one-time activation. They're infrastructure. The longer a unit operates in a high-traffic recurring environment, the more the brand becomes part of the fabric of that space.",
      closingPrimaryCta: 'Talk to us about retail and campus placements',
      closingSecondaryCta: 'See our full venue network',
      metaDescription:
        'Branded kiosks in malls, universities, and corporate campuses — built for daily, recurring traffic and compounding brand presence.',
    },
    es: {
      title: 'Retail y Campus',
      slug: 'retail-y-campus',
      heroHeadline: 'Una visita es una impresión. El tráfico diario es una relación.',
      heroSubheadline:
        'Los centros comerciales, campus corporativos y universidades comparten algo que los aeropuertos y las arenas no tienen: las mismas personas regresan, todos los días, cada semana. Eso no es tráfico peatonal — es una audiencia incorporada, y Amerikiosks opera justo en medio de ella.',
      heroTags: ['Centros Comerciales', 'Universidades', 'Campus Corporativos'],
      heroPrimaryCta: 'Hablemos de ubicaciones en retail y campus',
      heroSecondaryCta: 'Ver toda nuestra red de venues',
      storyHeading: 'La Historia',
      storyParagraphs: [
        'Existe una versión de construcción de marca que la mayoría de las empresas no pueden costear: la tienda insignia en el corredor de retail premium, abierta siete días a la semana, con personal y gestionada y optimizada para las 200 personas que pasan un martes. Y luego está esto.',
        'Un campus corporativo con 3,000 empleados que almuerzan en el mismo patio, pasan por el mismo edificio dos veces al día, y responden a marcas que sienten que pertenecen a su entorno. Una universidad con 20,000 estudiantes que forman hábitos — café, snacks, productos — que los siguen por décadas. Un centro comercial donde 15,000 personas circulan cada fin de semana buscando algo que comprar.',
        'Los entornos de retail y campus no se tratan de un solo momento de alta energía. Se tratan de repetición, reconocimiento, la construcción lenta de familiaridad que convierte una primera compra en un hábito. Aquí es donde se construye la lealtad de marca — no en una campaña, sino en una tarde de martes cuando alguien pasa frente a tu unidad por cuarta vez esa semana y finalmente se detiene.',
      ],
      venueTypesEyebrow: 'CÓMO SE VEN LOS VENUES DE RETAIL Y CAMPUS',
      venueTypesHeading: 'Donde las mismas personas regresan todos los días.',
      venueTypes: [
        { icon: 'local_mall', label: 'Centros comerciales y de retail de uso mixto' },
        { icon: 'apartment', label: 'Campus corporativos y áreas comunes de parques de oficinas' },
        {
          icon: 'school',
          label: 'Instalaciones universitarias — centros estudiantiles, bibliotecas, residencias',
        },
        { icon: 'local_hospital', label: 'Campus hospitalarios y de salud' },
        {
          icon: 'account_balance',
          label: 'Edificios gubernamentales e institucionales con alto tráfico diario',
        },
      ],
      segmentsEyebrow: 'A QUIÉN SIRVE',
      segmentsHeading: 'Presencia diaria, construida para retornos compuestos.',
      segments: [
        {
          eyebrow: 'MARCAS EMERGENTES',
          title: 'Para Marcas Emergentes',
          body: 'Este es tu punto de entrada al retail físico sin la carga operativa. Una unidad en un campus universitario o en un área común corporativa te da una audiencia recurrente y visibilidad diaria — sin arrendamiento, sin personal, sin el compromiso de capital de una ubicación de retail tradicional.',
          linkLabel: 'Ver opciones para marcas emergentes',
          linkUrl: '/for-emerging-brands',
        },
        {
          eyebrow: 'OPERADORES DE VENUES',
          title: 'Para Operadores de Venues',
          body: 'Tráfico diario significa ingreso diario. A diferencia de los venues basados en eventos, los entornos de retail y campus generan retornos consistentes y predecibles desde una sola unidad — porque la misma audiencia está ahí todos los días. Nosotros manejamos todo después de la instalación. Tú capturas el ingreso de forma recurrente.',
          linkLabel: 'Ver cómo trabajamos con venues',
          linkUrl: '/for-venues',
        },
        {
          eyebrow: 'MARCAS PREMIUM',
          title: 'Para Marcas Premium',
          body: 'Los campus corporativos y entornos de retail premium albergan exactamente la audiencia que buscas: profesionales de altos ingresos, tomadores de decisiones, consumidores conscientes de marca con ingreso disponible y rutina diaria. Una ubicación en el campus corporativo correcto es acceso directo a la persona detrás del cargo.',
          linkLabel: 'Ver cómo trabajamos con marcas premium',
          linkUrl: '/for-brands',
        },
      ],
      caseStudyHeading: 'Caso de Estudio',
      caseStudy: {
        venueType: 'Campus corporativo / Instalación universitaria',
        brandPartner: 'Marca de lifestyle o bienestar — confirmar con cliente',
        location: 'Campus o complejo, Ciudad por confirmar',
        situation:
          'Un operador de campus necesitaba resolver una brecha específica: alto tráfico diario, desatendido en el punto de necesidad, sin una opción de retail viable al alcance. Abrir un local de retail tradicional no era factible — el volumen estaba ahí, pero el modelo operativo no soportaba retail con personal.',
        whatWeDid:
          'Colocamos una unidad Amerikiosks con marca completa en el área común del campus, con selección de producto curada para la demografía específica de ese entorno. Operativa en días, sin capacitación ni gestión requerida del venue.',
        result:
          'Resultados pendientes — ingreso semanal, volumen de transacciones diarias y tasa de recompra a ser provistos por el cliente.',
        quote: 'Cita del cliente pendiente — del operador del campus o del brand partner.',
        quoteAttribution: 'Nombre, Cargo, Organización',
      },
      closingHeadline: 'Las campañas terminan. La presencia se acumula.',
      closingBody:
        'Las ubicaciones de retail y campus no son una activación de una sola vez. Son infraestructura. Cuanto más tiempo opera una unidad en un entorno recurrente de alto tráfico, más se convierte la marca en parte del tejido de ese espacio.',
      closingPrimaryCta: 'Hablemos de ubicaciones en retail y campus',
      closingSecondaryCta: 'Ver toda nuestra red de venues',
      metaDescription:
        'Kiosks de marca en centros comerciales, universidades y campus corporativos — construidos para tráfico diario recurrente y presencia de marca compuesta.',
    },
  },
  // ── Travel ─────────────────────────────────────────────────────────────────
  {
    heroAsset: 'project-airport-retail.png',
    heroAlt: 'Branded kiosk in an airport terminal gate area',
    en: {
      title: 'Travel and Transit',
      slug: 'travel-and-transit',
      heroHeadline: 'Millions of people. One direction. Yours.',
      heroSubheadline:
        'Travel environments are the only places on earth where people are simultaneously captive, open, and primed to spend. Airports, cruise terminals, transit hubs — Amerikiosks lives here because your brand should too.',
      heroTags: ['Airports', 'Cruise Terminals', 'Transit Hubs'],
      heroPrimaryCta: 'Talk to us about travel placements',
      heroSecondaryCta: 'See our full venue network',
      storyHeading: 'The Story',
      storyParagraphs: [
        "There's a moment that happens in every airport, in every terminal, in every gate waiting area. People stop. Not because they want to. Because they have to. And in that pause — bags at their feet, phone in hand, forty minutes until boarding — something interesting happens: they actually look around. They see what's there. They engage with what catches their eye.",
        'That moment is worth more than a billboard on a highway, a banner ad on a feed, or a popup on a screen they were already about to close. It is a captive audience that chose to be there. And that is exactly where Amerikiosks operates.',
        "We don't place machines in airports because it's convenient. We place them there because the context does half the selling for you — and the other half, your brand does on its own.",
      ],
      venueTypesEyebrow: 'WHAT TRAVEL VENUES LOOK LIKE',
      venueTypesHeading: 'Where people are captive, open, and ready to spend.',
      venueTypes: [
        {
          icon: 'flight',
          label: 'International airports — terminals, gates, baggage claim, lounges',
        },
        { icon: 'directions_boat', label: 'Cruise terminals and port embarkation areas' },
        { icon: 'train', label: 'Train stations and intercity transit hubs' },
        { icon: 'hotel', label: 'Airport hotels and layover properties' },
      ],
      segmentsEyebrow: 'WHO THIS SERVES',
      segmentsHeading: 'A captive audience, working for three different goals.',
      segments: [
        {
          eyebrow: 'PREMIUM BRANDS',
          title: 'For Premium Brands',
          body: "Your customer isn't just traveling — they're in a mindset of openness and spend. Business class passengers, international travelers, frequent flyers: this is your audience, already there, already looking. A branded unit in a premium terminal isn't a vending machine. It's an outpost.",
          linkLabel: 'See how we work with premium brands',
          linkUrl: '/for-brands',
        },
        {
          eyebrow: 'EMERGING BRANDS',
          title: 'For Emerging Brands',
          body: "You don't need a flagship store in a major airport. You need presence in it. A single unit in a high-traffic terminal gives you the same real estate — at a fraction of the cost, with zero buildout, operating before the lease on a traditional retail space would even be signed.",
          linkLabel: 'See options for emerging brands',
          linkUrl: '/for-emerging-brands',
        },
        {
          eyebrow: 'VENUE OPERATORS',
          title: 'For Venue Operators',
          body: 'Airports and terminals have underutilized square footage that most operators have not figured out how to monetize without adding staff or complexity. We do the work. You collect the revenue. No operational overhead, no inventory management, no maintenance calls on your team.',
          linkLabel: 'See how we work with venues',
          linkUrl: '/for-venues',
        },
      ],
      caseStudyHeading: 'Case Study',
      caseStudy: {
        venueType: 'International airport terminal',
        brandPartner: 'Bakery / food brand — confirm with client',
        location: 'Airport, City TBD',
        situation:
          'A brand needed a way to reach travelers during high-dwell, high-intent moments — without opening full retail outlets across every terminal. The cost and operational complexity of traditional retail expansion was not viable at that pace.',
        whatWeDid:
          "We deployed a fully branded Amerikiosks unit, wrapped in the brand's visual identity, stocked with signature products, operating 24/7 with zero staff from their side. Installation completed within days, operational before the next marketing campaign launched.",
        result:
          'Results pending — units sold, revenue generated, and conversion rate to be supplied by client.',
        quote: 'Client quote pending — about the experience, brand visibility, or results.',
        quoteAttribution: 'Name, Title, Organization',
      },
      closingHeadline: "The right location isn't luck. It's a decision.",
      closingBody:
        "Every placement we make in a travel environment goes through location validation — traffic volume, demographic fit, brand compatibility. We don't fill empty space. We create brand moments in the right space.",
      closingPrimaryCta: 'Talk to us about travel placements',
      closingSecondaryCta: 'See our full venue network',
      metaDescription:
        'Branded kiosks in airports, cruise terminals, and transit hubs — built for captive, high-intent travel audiences.',
    },
    es: {
      title: 'Viajes y Tránsito',
      slug: 'viajes-y-transito',
      heroHeadline: 'Millones de personas. Una dirección. La tuya.',
      heroSubheadline:
        'Los entornos de viaje son los únicos lugares en el mundo donde las personas son simultáneamente cautivas, abiertas y dispuestas a gastar. Aeropuertos, terminales de cruceros, hubs de tránsito — Amerikiosks vive ahí porque tu marca también debería.',
      heroTags: ['Aeropuertos', 'Terminales de Cruceros', 'Hubs de Tránsito'],
      heroPrimaryCta: 'Hablemos de ubicaciones en viajes',
      heroSecondaryCta: 'Ver toda nuestra red de venues',
      storyHeading: 'La Historia',
      storyParagraphs: [
        'Hay un momento que sucede en cada aeropuerto, en cada terminal, en cada área de espera de la puerta. La gente se detiene. No porque quiera. Porque tiene que hacerlo. Y en esa pausa — maletas a sus pies, teléfono en mano, cuarenta minutos para abordar — sucede algo interesante: en realidad miran a su alrededor. Ven lo que hay. Se involucran con lo que llama su atención.',
        'Ese momento vale más que un billboard en una autopista, un banner en un feed, o un popup en una pantalla que ya estaban a punto de cerrar. Es una audiencia cautiva que eligió estar ahí. Y ahí es exactamente donde opera Amerikiosks.',
        'No colocamos máquinas en aeropuertos porque sea conveniente. Las colocamos ahí porque el contexto hace la mitad de la venta por ti — y la otra mitad, tu marca la hace por sí misma.',
      ],
      venueTypesEyebrow: 'CÓMO SE VEN LOS VENUES DE VIAJE',
      venueTypesHeading: 'Donde la gente está cautiva, abierta y lista para gastar.',
      venueTypes: [
        {
          icon: 'flight',
          label: 'Aeropuertos internacionales — terminales, puertas, equipaje, salas VIP',
        },
        { icon: 'directions_boat', label: 'Terminales de cruceros y áreas de embarque portuario' },
        { icon: 'train', label: 'Estaciones de tren y hubs de tránsito interurbano' },
        { icon: 'hotel', label: 'Hoteles de aeropuerto y propiedades de escala' },
      ],
      segmentsEyebrow: 'A QUIÉN SIRVE',
      segmentsHeading: 'Una audiencia cautiva, trabajando para tres objetivos distintos.',
      segments: [
        {
          eyebrow: 'MARCAS PREMIUM',
          title: 'Para Marcas Premium',
          body: 'Tu cliente no solo está viajando — está en un estado de apertura y disposición a gastar. Pasajeros de clase ejecutiva, viajeros internacionales, viajeros frecuentes: esta es tu audiencia, ya ahí, ya mirando. Una unidad de marca en una terminal premium no es una máquina expendedora. Es un puesto avanzado.',
          linkLabel: 'Ver cómo trabajamos con marcas premium',
          linkUrl: '/for-brands',
        },
        {
          eyebrow: 'MARCAS EMERGENTES',
          title: 'Para Marcas Emergentes',
          body: 'No necesitas una tienda insignia en un aeropuerto importante. Necesitas presencia en él. Una sola unidad en una terminal de alto tráfico te da el mismo espacio — a una fracción del costo, sin construcción, operando antes de que se firmara el contrato de un local de retail tradicional.',
          linkLabel: 'Ver opciones para marcas emergentes',
          linkUrl: '/for-emerging-brands',
        },
        {
          eyebrow: 'OPERADORES DE VENUES',
          title: 'Para Operadores de Venues',
          body: 'Los aeropuertos y terminales tienen metros cuadrados subutilizados que la mayoría de los operadores no han logrado monetizar sin agregar personal ni complejidad. Nosotros hacemos el trabajo. Tú cobras el ingreso. Sin carga operativa, sin gestión de inventario, sin llamadas de mantenimiento para tu equipo.',
          linkLabel: 'Ver cómo trabajamos con venues',
          linkUrl: '/for-venues',
        },
      ],
      caseStudyHeading: 'Caso de Estudio',
      caseStudy: {
        venueType: 'Terminal de aeropuerto internacional',
        brandPartner: 'Marca de panadería / alimentos — confirmar con cliente',
        location: 'Aeropuerto, Ciudad por confirmar',
        situation:
          'Una marca necesitaba una forma de llegar a los viajeros durante momentos de alta permanencia y alta intención — sin abrir locales completos de retail en cada terminal. El costo y la complejidad operativa de una expansión de retail tradicional no era viable a ese ritmo.',
        whatWeDid:
          'Desplegamos una unidad Amerikiosks con marca completa, envuelta en la identidad visual de la marca, abastecida con productos insignia, operando 24/7 sin personal de su parte. Instalación completada en días, operativa antes del lanzamiento de su siguiente campaña de marketing.',
        result:
          'Resultados pendientes — unidades vendidas, ingreso generado y tasa de conversión a ser provistos por el cliente.',
        quote:
          'Cita del cliente pendiente — sobre la experiencia, la visibilidad de marca o los resultados.',
        quoteAttribution: 'Nombre, Cargo, Organización',
      },
      closingHeadline: 'La ubicación correcta no es suerte. Es una decisión.',
      closingBody:
        'Cada ubicación que hacemos en un entorno de viaje pasa por una validación de ubicación — volumen de tráfico, ajuste demográfico, compatibilidad de marca. No llenamos espacio vacío. Creamos momentos de marca en el espacio correcto.',
      closingPrimaryCta: 'Hablemos de ubicaciones en viajes',
      closingSecondaryCta: 'Ver toda nuestra red de venues',
      metaDescription:
        'Kiosks de marca en aeropuertos, terminales de cruceros y hubs de tránsito — construidos para audiencias de viaje cautivas y de alta intención.',
    },
  },
]

const buildLayout = (content: LocaleContent, ctaFormUrl = '/contact') => [
  {
    blockType: 'content' as const,
    blockName: 'The Story',
    columns: [
      {
        size: 'full' as const,
        richText: headingAndParagraphs(content.storyHeading, content.storyParagraphs),
      },
    ],
  },
  {
    blockType: 'cardGrid' as const,
    blockName: 'What Venues Look Like',
    variant: 'icon' as const,
    eyebrow: content.venueTypesEyebrow,
    heading: content.venueTypesHeading,
    items: content.venueTypes.map((v) => ({
      icon: v.icon,
      title: v.label,
      body: richText(['']),
    })),
  },
  {
    blockType: 'cardGrid' as const,
    blockName: 'Who This Serves',
    variant: 'pillar' as const,
    eyebrow: content.segmentsEyebrow,
    heading: content.segmentsHeading,
    items: content.segments.map((s) => ({
      eyebrow: s.eyebrow,
      title: s.title,
      body: richText([s.body]),
      link: { label: s.linkLabel, url: s.linkUrl, type: 'custom' as const },
    })),
  },
  {
    blockType: 'content' as const,
    blockName: 'Case Study',
    columns: [
      {
        size: 'full' as const,
        richText: headingAndParagraphs(content.caseStudyHeading, [
          `${content.caseStudy.venueType} — ${content.caseStudy.brandPartner} — ${content.caseStudy.location}`,
          content.caseStudy.situation,
          content.caseStudy.whatWeDid,
          content.caseStudy.result,
          `"${content.caseStudy.quote}" — ${content.caseStudy.quoteAttribution}`,
        ]),
      },
    ],
  },
  {
    blockType: 'cta' as const,
    blockName: 'Closing',
    richText: headingAndParagraphs(content.closingHeadline, [content.closingBody]),
    links: [
      {
        link: {
          label: content.closingPrimaryCta,
          type: 'custom' as const,
          url: ctaFormUrl,
          appearance: 'default' as const,
        },
      },
      {
        link: {
          label: content.closingSecondaryCta,
          type: 'custom' as const,
          url: '/where-it-works',
          appearance: 'outline' as const,
        },
      },
    ],
  },
]

export const seedWhereItWorksDetail = async (
  payload: Payload,
  req: PayloadRequest,
): Promise<void> => {
  payload.logger.info('— Seeding Where It Works detail pages...')

  const whereItWorks = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'where-it-works' } },
    limit: 1,
    depth: 0,
    req,
  })
  const whereItWorksId =
    whereItWorks.totalDocs > 0 ? (whereItWorks.docs[0]?.id as number) : undefined

  for (const page of pages) {
    const { en, es, heroAsset, heroAlt } = page

    // Delete any existing stub/page so upsertPage creates fresh with the correct hero type.
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: en.slug } },
      limit: 1,
      req,
    })
    if (existing.totalDocs > 0) {
      await payload.delete({
        collection: 'pages',
        id: existing.docs[0]?.id as number,
        overrideAccess: true,
        req,
      })
      payload.logger.info(`  Deleted existing ${en.slug} page stub`)
    }

    const heroImage = await uploadMedia(
      payload,
      req,
      path.join(process.cwd(), 'public', 'seed-assets', heroAsset),
      heroAlt,
    )

    await upsertPage(
      payload,
      req,
      {
        title: en.title,
        slug: en.slug,
        ...(whereItWorksId !== undefined ? { parent: whereItWorksId } : {}),
        hero: {
          type: 'mediumImpact',
          media: heroImage.id,
          richText: {
            root: {
              type: 'root',
              version: 1,
              direction: null,
              format: '' as const,
              indent: 0,
              children: [
                {
                  type: 'heading',
                  tag: 'h1',
                  version: 1,
                  children: [{ type: 'text', version: 1, text: en.heroHeadline }],
                },
                {
                  type: 'paragraph',
                  version: 1,
                  children: [{ type: 'text', version: 1, text: en.heroSubheadline }],
                },
              ],
            },
          },
          links: [
            {
              link: {
                label: en.heroPrimaryCta,
                type: 'custom',
                url: '/contact',
                appearance: 'default',
              },
            },
            {
              link: {
                label: en.heroSecondaryCta,
                type: 'custom',
                url: '/where-it-works',
                appearance: 'outline',
              },
            },
          ],
          tags: en.heroTags.map((label) => ({ label })),
        },
        layout: buildLayout(en),
        _status: 'published',
        meta: {
          title: `${en.title} — Amerikiosks`,
          description: en.metaDescription,
          image: heroImage.id,
        },
      },
      {
        title: es.title,
        slug: es.slug,
        hero: {
          type: 'mediumImpact',
          media: heroImage.id,
          richText: {
            root: {
              type: 'root',
              version: 1,
              direction: null,
              format: '' as const,
              indent: 0,
              children: [
                {
                  type: 'heading',
                  tag: 'h1',
                  version: 1,
                  children: [{ type: 'text', version: 1, text: es.heroHeadline }],
                },
                {
                  type: 'paragraph',
                  version: 1,
                  children: [{ type: 'text', version: 1, text: es.heroSubheadline }],
                },
              ],
            },
          },
          links: [
            {
              link: {
                label: es.heroPrimaryCta,
                type: 'custom',
                url: '/contact',
                appearance: 'default',
              },
            },
            {
              link: {
                label: es.heroSecondaryCta,
                type: 'custom',
                url: '/where-it-works',
                appearance: 'outline',
              },
            },
          ],
          tags: es.heroTags.map((label) => ({ label })),
        },
        layout: buildLayout(es),
        meta: {
          title: `${es.title} — Amerikiosks`,
          description: es.metaDescription,
          image: heroImage.id,
        },
      },
    )

    payload.logger.info(`  Seeded ${en.slug} / ${es.slug}`)
  }

  payload.logger.info('— Where It Works detail pages seeding complete.')
}
