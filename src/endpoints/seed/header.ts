import type { Payload, PayloadRequest } from 'payload'

export const seedHeader = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding header...')

  // Step 1: write EN — Payload assigns IDs to array entries
  const enResult = await payload.updateGlobal({
    slug: 'header',
    locale: 'en',
    data: {
      cta: { label: 'Start a Partnership', url: '/start-a-partnership' },
      navItems: [
        {
          link: { type: 'custom', label: 'Solutions', url: '/solutions' },
          hasMegaMenu: true,
          megaMenu: {
            panelLabel: 'Solutions',
            panelHeadline: 'Choose the kind of presence you want to build.',
            panelDescription: 'Turn the right space, audience, and product mix into an operated retail experience.',
            rightTitle: 'What are you trying to create?',
            rightSubtitle: 'Start from the partnership model, then move into the program that fits your growth plan.',
            items: [
              { icon: 'storefront', title: 'Brand Programs', description: 'Launch a branded retail moment in high-value physical spaces.', link: { type: 'custom', url: '/solutions/brand-programs' } },
              { icon: 'handshake', title: 'Venue Partnerships', description: 'Turn underused square footage into curated revenue and guest value.', link: { type: 'custom', url: '/solutions/venue-partnerships' } },
              { icon: 'campaign', title: 'Agency Activations', description: 'Use automated retail as a physical media and experience layer.', link: { type: 'custom', url: '/solutions/agency-activations' } },
              { icon: 'rocket_launch', title: 'Emerging Brand Pilots', description: 'Test real-world demand before scaling into more locations.', link: { type: 'custom', url: '/solutions/emerging-brand-pilots' } },
            ],
          },
        },
        {
          link: { type: 'custom', label: 'Where It Works', url: '/where-it-works' },
          hasMegaMenu: true,
          megaMenu: {
            panelLabel: 'Where It Works',
            panelHeadline: 'Start with the moment, not the machine.',
            panelDescription: 'Find the environments where attention, need, and brand presence naturally meet.',
            rightTitle: 'Where attention and need already exist',
            rightSubtitle: 'Explore premium environments where automated retail can feel useful, memorable, and native to the visit.',
            items: [
              { icon: 'flight_takeoff', title: 'Travel and Transit', description: 'Airports, transit hubs, and waiting moments with captive attention.', link: { type: 'custom', url: '/where-it-works/travel-and-transit' } },
              { icon: 'theaters', title: 'Entertainment Venues', description: 'Arenas, theaters, stadiums, and live-event destinations.', link: { type: 'custom', url: '/where-it-works/entertainment-venues' } },
              { icon: 'hotel', title: 'Hospitality and Destinations', description: 'Hotels, resorts, casinos, museums, and curated guest spaces.', link: { type: 'custom', url: '/where-it-works/hospitality-and-destinations' } },
              { icon: 'local_mall', title: 'Retail and Campuses', description: 'Malls, universities, offices, and daily high-footfall environments.', link: { type: 'custom', url: '/where-it-works/retail-and-campuses' } },
            ],
          },
        },
        {
          link: { type: 'custom', label: 'Case Studies', url: '/case-studies' },
          hasMegaMenu: false,
        },
        {
          link: { type: 'custom', label: 'Why Amerikiosks', url: '/why-amerikiosks' },
          hasMegaMenu: false,
        },
      ],
    },
    req: { ...req, locale: 'en' } as PayloadRequest,
    context: { disableRevalidate: true },
    depth: 0,
  })

  // Step 2: write ES reusing the same array item IDs from step 1
  const navItems = enResult.navItems as any[]

  await payload.updateGlobal({
    slug: 'header',
    locale: 'es',
    data: {
      cta: { label: 'Iniciar Partnership', url: '/start-a-partnership' },
      navItems: [
        {
          id: navItems[0]?.id,
          link: { type: 'custom', label: 'Soluciones', url: '/solutions' },
          hasMegaMenu: true,
          megaMenu: {
            panelLabel: 'Soluciones',
            panelHeadline: 'Elige el tipo de presencia que quieres construir.',
            panelDescription: 'Convierte el espacio, la audiencia y el mix de productos en una experiencia de retail operada.',
            rightTitle: '¿Qué estás intentando crear?',
            rightSubtitle: 'Parte del modelo de partnership y avanza hacia el programa que se adapta a tu plan de crecimiento.',
            items: [
              { id: navItems[0]?.megaMenu?.items?.[0]?.id, icon: 'storefront', title: 'Programas de Marca', description: 'Lanza un momento de retail de marca en espacios físicos de alto valor.', link: { type: 'custom', url: '/solutions/brand-programs' } },
              { id: navItems[0]?.megaMenu?.items?.[1]?.id, icon: 'handshake', title: 'Partnerships con Venues', description: 'Convierte metros cuadrados sin uso en ingresos y valor para el visitante.', link: { type: 'custom', url: '/solutions/venue-partnerships' } },
              { id: navItems[0]?.megaMenu?.items?.[2]?.id, icon: 'campaign', title: 'Activaciones para Agencias', description: 'Usa el retail automatizado como capa de medios físicos y experiencia.', link: { type: 'custom', url: '/solutions/agency-activations' } },
              { id: navItems[0]?.megaMenu?.items?.[3]?.id, icon: 'rocket_launch', title: 'Pilotos de Marcas Emergentes', description: 'Prueba la demanda real antes de escalar a más ubicaciones.', link: { type: 'custom', url: '/solutions/emerging-brand-pilots' } },
            ],
          },
        },
        {
          id: navItems[1]?.id,
          link: { type: 'custom', label: 'Dónde Funciona', url: '/where-it-works' },
          hasMegaMenu: true,
          megaMenu: {
            panelLabel: 'Dónde Funciona',
            panelHeadline: 'Empieza por el momento, no por la máquina.',
            panelDescription: 'Encuentra los entornos donde la atención, la necesidad y la presencia de marca se encuentran de forma natural.',
            rightTitle: 'Donde la atención y la necesidad ya existen',
            rightSubtitle: 'Explora entornos premium donde el retail automatizado puede sentirse útil, memorable y nativo a la visita.',
            items: [
              { id: navItems[1]?.megaMenu?.items?.[0]?.id, icon: 'flight_takeoff', title: 'Viajes y Tránsito', description: 'Aeropuertos, hubs de tránsito y momentos de espera con atención cautiva.', link: { type: 'custom', url: '/where-it-works/travel-and-transit' } },
              { id: navItems[1]?.megaMenu?.items?.[1]?.id, icon: 'theaters', title: 'Venues de Entretenimiento', description: 'Estadios, teatros, arenas y destinos de eventos en vivo.', link: { type: 'custom', url: '/where-it-works/entertainment-venues' } },
              { id: navItems[1]?.megaMenu?.items?.[2]?.id, icon: 'hotel', title: 'Hospitalidad y Destinos', description: 'Hoteles, resorts, casinos, museos y espacios curados para huéspedes.', link: { type: 'custom', url: '/where-it-works/hospitality-and-destinations' } },
              { id: navItems[1]?.megaMenu?.items?.[3]?.id, icon: 'local_mall', title: 'Retail y Campus', description: 'Malls, universidades, oficinas y entornos de alto tráfico diario.', link: { type: 'custom', url: '/where-it-works/retail-and-campuses' } },
            ],
          },
        },
        {
          id: navItems[2]?.id,
          link: { type: 'custom', label: 'Casos de Éxito', url: '/case-studies' },
          hasMegaMenu: false,
        },
        {
          id: navItems[3]?.id,
          link: { type: 'custom', label: 'Por Qué Amerikiosks', url: '/why-amerikiosks' },
          hasMegaMenu: false,
        },
      ],
    },
    req: { ...req, locale: 'es' } as PayloadRequest,
    context: { disableRevalidate: true },
    depth: 0,
  })
}
