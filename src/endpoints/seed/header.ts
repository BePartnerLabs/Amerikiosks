import type { Payload, PayloadRequest } from 'payload'

const findPageId = async (
  payload: Payload,
  req: PayloadRequest,
  slug: string,
): Promise<number | undefined> => {
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    req,
  })
  return docs[0]?.id as number | undefined
}

export const seedHeader = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding header...')

  const [
    forBrandsId,
    forVenuesId,
    forAgenciesId,
    forEmergingBrandsId,
    solutionsId,
    whereItWorksId,
    caseStudiesId,
    whyAmerikiosksId,
    travelAndTransitId,
    entertainmentVenuesId,
    hospitalityAndDestinationsId,
    retailAndCampusesId,
  ] = await Promise.all([
    findPageId(payload, req, 'for-brands'),
    findPageId(payload, req, 'for-venues'),
    findPageId(payload, req, 'for-agencies'),
    findPageId(payload, req, 'for-emerging-brands'),
    findPageId(payload, req, 'solutions'),
    findPageId(payload, req, 'where-it-works'),
    findPageId(payload, req, 'case-studies'),
    findPageId(payload, req, 'why-amerikiosks'),
    findPageId(payload, req, 'travel-and-transit'),
    findPageId(payload, req, 'entertainment-venues'),
    findPageId(payload, req, 'hospitality-and-destinations'),
    findPageId(payload, req, 'retail-and-campuses'),
  ])

  const refOr = (id: number | undefined, fallbackUrl: string) =>
    id
      ? { type: 'reference' as const, reference: { relationTo: 'pages' as const, value: id } }
      : { type: 'custom' as const, url: fallbackUrl }

  // Step 1: write EN — Payload assigns IDs to array entries
  const enResult = await payload.updateGlobal({
    slug: 'header',
    locale: 'en',
    data: {
      cta: { label: 'Start a Partnership', url: '/start-a-partnership' },
      navItems: [
        {
          link: { label: 'Solutions', ...refOr(solutionsId, '/solutions') },
          hasMegaMenu: true,
          megaMenu: {
            panelLabel: 'Solutions',
            panelHeadline: 'Choose the kind of presence you want to build.',
            panelDescription:
              'Turn the right space, audience, and product mix into an operated retail experience.',
            rightTitle: 'What are you trying to create?',
            rightSubtitle:
              'Start from the partnership model, then move into the program that fits your growth plan.',
            items: [
              {
                icon: 'storefront',
                title: 'Brand Programs',
                description: 'Launch a branded retail moment in high-value physical spaces.',
                link: forBrandsId
                  ? { type: 'reference', reference: { relationTo: 'pages', value: forBrandsId } }
                  : { type: 'custom', url: '/for-brands' },
              },
              {
                icon: 'handshake',
                title: 'Venue Partnerships',
                description: 'Turn underused square footage into curated revenue and guest value.',
                link: forVenuesId
                  ? { type: 'reference', reference: { relationTo: 'pages', value: forVenuesId } }
                  : { type: 'custom', url: '/for-venues' },
              },
              {
                icon: 'campaign',
                title: 'Agency Activations',
                description: 'Use automated retail as a physical media and experience layer.',
                link: forAgenciesId
                  ? {
                      type: 'reference',
                      reference: { relationTo: 'pages', value: forAgenciesId },
                    }
                  : { type: 'custom', url: '/for-agencies' },
              },
              {
                icon: 'rocket_launch',
                title: 'Emerging Brand Pilots',
                description: 'Test real-world demand before scaling into more locations.',
                link: forEmergingBrandsId
                  ? {
                      type: 'reference',
                      reference: { relationTo: 'pages', value: forEmergingBrandsId },
                    }
                  : { type: 'custom', url: '/for-emerging-brands' },
              },
            ],
          },
        },
        {
          link: { label: 'Where It Works', ...refOr(whereItWorksId, '/where-it-works') },
          hasMegaMenu: true,
          megaMenu: {
            panelLabel: 'Where It Works',
            panelHeadline: 'Start with the moment, not the machine.',
            panelDescription:
              'Find the environments where attention, need, and brand presence naturally meet.',
            rightTitle: 'Where attention and need already exist',
            rightSubtitle:
              'Explore premium environments where automated retail can feel useful, memorable, and native to the visit.',
            items: [
              {
                icon: 'flight_takeoff',
                title: 'Travel and Transit',
                description: 'Airports, transit hubs, and waiting moments with captive attention.',
                link: refOr(travelAndTransitId, '/travel-and-transit'),
              },
              {
                icon: 'theaters',
                title: 'Entertainment Venues',
                description: 'Arenas, theaters, stadiums, and live-event destinations.',
                link: refOr(entertainmentVenuesId, '/entertainment-venues'),
              },
              {
                icon: 'hotel',
                title: 'Hospitality and Destinations',
                description: 'Hotels, resorts, casinos, museums, and curated guest spaces.',
                link: refOr(hospitalityAndDestinationsId, '/hospitality-and-destinations'),
              },
              {
                icon: 'local_mall',
                title: 'Retail and Campuses',
                description: 'Malls, universities, offices, and daily high-footfall environments.',
                link: refOr(retailAndCampusesId, '/retail-and-campuses'),
              },
            ],
          },
        },
        {
          link: { label: 'Case Studies', ...refOr(caseStudiesId, '/case-studies') },
          hasMegaMenu: false,
        },
        {
          link: { label: 'Why Amerikiosks', ...refOr(whyAmerikiosksId, '/why-amerikiosks') },
          hasMegaMenu: false,
        },
      ],
    },
    req: { ...req, locale: 'en' } as PayloadRequest,
    context: { disableRevalidate: true },
    depth: 0,
  })

  // Step 2: write ES reusing the same array item IDs from step 1
  type HeaderNavItem = {
    id?: string
    megaMenu?: {
      items?: Array<{
        id?: string
      }>
    }
  }

  const navItems = enResult.navItems as HeaderNavItem[]

  await payload.updateGlobal({
    slug: 'header',
    locale: 'es',
    data: {
      cta: { label: 'Iniciar Partnership', url: '/start-a-partnership' },
      navItems: [
        {
          id: navItems[0]?.id,
          link: { label: 'Soluciones', ...refOr(solutionsId, '/solutions') },
          hasMegaMenu: true,
          megaMenu: {
            panelLabel: 'Soluciones',
            panelHeadline: 'Elige el tipo de presencia que quieres construir.',
            panelDescription:
              'Convierte el espacio, la audiencia y el mix de productos en una experiencia de retail operada.',
            rightTitle: '¿Qué estás intentando crear?',
            rightSubtitle:
              'Parte del modelo de partnership y avanza hacia el programa que se adapta a tu plan de crecimiento.',
            items: [
              {
                id: navItems[0]?.megaMenu?.items?.[0]?.id,
                icon: 'storefront',
                title: 'Programas de Marca',
                description:
                  'Lanza un momento de retail de marca en espacios físicos de alto valor.',
                link: forBrandsId
                  ? { type: 'reference', reference: { relationTo: 'pages', value: forBrandsId } }
                  : { type: 'custom', url: '/para-marcas' },
              },
              {
                id: navItems[0]?.megaMenu?.items?.[1]?.id,
                icon: 'handshake',
                title: 'Partnerships con Venues',
                description:
                  'Convierte metros cuadrados sin uso en ingresos y valor para el visitante.',
                link: forVenuesId
                  ? { type: 'reference', reference: { relationTo: 'pages', value: forVenuesId } }
                  : { type: 'custom', url: '/para-venues' },
              },
              {
                id: navItems[0]?.megaMenu?.items?.[2]?.id,
                icon: 'campaign',
                title: 'Activaciones para Agencias',
                description:
                  'Usa el retail automatizado como capa de medios físicos y experiencia.',
                link: forAgenciesId
                  ? {
                      type: 'reference',
                      reference: { relationTo: 'pages', value: forAgenciesId },
                    }
                  : { type: 'custom', url: '/para-agencias' },
              },
              {
                id: navItems[0]?.megaMenu?.items?.[3]?.id,
                icon: 'rocket_launch',
                title: 'Pilotos de Marcas Emergentes',
                description: 'Prueba la demanda real antes de escalar a más ubicaciones.',
                link: forEmergingBrandsId
                  ? {
                      type: 'reference',
                      reference: { relationTo: 'pages', value: forEmergingBrandsId },
                    }
                  : { type: 'custom', url: '/para-marcas-emergentes' },
              },
            ],
          },
        },
        {
          id: navItems[1]?.id,
          link: { label: 'Dónde Funciona', ...refOr(whereItWorksId, '/where-it-works') },
          hasMegaMenu: true,
          megaMenu: {
            panelLabel: 'Dónde Funciona',
            panelHeadline: 'Empieza por el momento, no por la máquina.',
            panelDescription:
              'Encuentra los entornos donde la atención, la necesidad y la presencia de marca se encuentran de forma natural.',
            rightTitle: 'Donde la atención y la necesidad ya existen',
            rightSubtitle:
              'Explora entornos premium donde el retail automatizado puede sentirse útil, memorable y nativo a la visita.',
            items: [
              {
                id: navItems[1]?.megaMenu?.items?.[0]?.id,
                icon: 'flight_takeoff',
                title: 'Viajes y Tránsito',
                description:
                  'Aeropuertos, hubs de tránsito y momentos de espera con atención cautiva.',
                link: refOr(travelAndTransitId, '/travel-and-transit'),
              },
              {
                id: navItems[1]?.megaMenu?.items?.[1]?.id,
                icon: 'theaters',
                title: 'Venues de Entretenimiento',
                description: 'Estadios, teatros, arenas y destinos de eventos en vivo.',
                link: refOr(entertainmentVenuesId, '/entertainment-venues'),
              },
              {
                id: navItems[1]?.megaMenu?.items?.[2]?.id,
                icon: 'hotel',
                title: 'Hospitalidad y Destinos',
                description: 'Hoteles, resorts, casinos, museos y espacios curados para huéspedes.',
                link: refOr(hospitalityAndDestinationsId, '/hospitality-and-destinations'),
              },
              {
                id: navItems[1]?.megaMenu?.items?.[3]?.id,
                icon: 'local_mall',
                title: 'Retail y Campus',
                description: 'Malls, universidades, oficinas y entornos de alto tráfico diario.',
                link: refOr(retailAndCampusesId, '/retail-and-campuses'),
              },
            ],
          },
        },
        {
          id: navItems[2]?.id,
          link: { label: 'Casos de Éxito', ...refOr(caseStudiesId, '/case-studies') },
          hasMegaMenu: false,
        },
        {
          id: navItems[3]?.id,
          link: { label: 'Por Qué Amerikiosks', ...refOr(whyAmerikiosksId, '/why-amerikiosks') },
          hasMegaMenu: false,
        },
      ],
    },
    req: { ...req, locale: 'es' } as PayloadRequest,
    context: { disableRevalidate: true },
    depth: 0,
  })
}
