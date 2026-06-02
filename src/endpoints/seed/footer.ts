import type { Payload, PayloadRequest } from 'payload'

export const seedFooter = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding footer...')

  const enResult = await payload.updateGlobal({
    slug: 'footer',
    locale: 'en',
    data: {
      brandDescription:
        'Premium automated retail experiences for brands and venues that need presence without traditional retail overhead.',
      columns: [
        {
          label: 'Solutions',
          links: [
            {
              link: {
                type: 'custom',
                label: 'Retail experiences',
                url: '/solutions/retail-experiences',
              },
            },
            {
              link: {
                type: 'custom',
                label: 'Brand activations',
                url: '/solutions/brand-activations',
              },
            },
            { link: { type: 'custom', label: 'Venue programs', url: '/solutions/venue-programs' } },
          ],
        },
        {
          label: 'Company',
          links: [
            { link: { type: 'custom', label: 'Our story', url: '/our-story' } },
            { link: { type: 'custom', label: 'Where it works', url: '/where-it-works' } },
            { link: { type: 'custom', label: 'Featured insight', url: '/insights' } },
          ],
        },
      ],
      contactCta: 'Start a partnership',
      contactCtaUrl: '/start-a-partnership',
      contactEmail: 'hello@amerikiosks.com',
    },
    req: { ...req, locale: 'en' } as PayloadRequest,
    context: { disableRevalidate: true },
    depth: 0,
  })

  const columns = enResult.columns as Array<{ id?: string; links?: Array<{ id?: string }> }>

  await payload.updateGlobal({
    slug: 'footer',
    locale: 'es',
    data: {
      brandDescription:
        'Experiencias de retail automatizado premium para marcas y venues que necesitan presencia sin los costos tradicionales.',
      columns: [
        {
          id: columns[0]?.id,
          label: 'Soluciones',
          links: [
            {
              id: columns[0]?.links?.[0]?.id,
              link: {
                type: 'custom',
                label: 'Experiencias de retail',
                url: '/solutions/retail-experiences',
              },
            },
            {
              id: columns[0]?.links?.[1]?.id,
              link: {
                type: 'custom',
                label: 'Activaciones de marca',
                url: '/solutions/brand-activations',
              },
            },
            {
              id: columns[0]?.links?.[2]?.id,
              link: {
                type: 'custom',
                label: 'Programas para venues',
                url: '/solutions/venue-programs',
              },
            },
          ],
        },
        {
          id: columns[1]?.id,
          label: 'Compañía',
          links: [
            {
              id: columns[1]?.links?.[0]?.id,
              link: { type: 'custom', label: 'Nuestra historia', url: '/our-story' },
            },
            {
              id: columns[1]?.links?.[1]?.id,
              link: { type: 'custom', label: 'Dónde funciona', url: '/where-it-works' },
            },
            {
              id: columns[1]?.links?.[2]?.id,
              link: { type: 'custom', label: 'Insights destacados', url: '/insights' },
            },
          ],
        },
      ],
      contactCta: 'Iniciar un partnership',
      contactCtaUrl: '/start-a-partnership',
      contactEmail: 'hello@amerikiosks.com',
    },
    req: { ...req, locale: 'es' } as PayloadRequest,
    context: { disableRevalidate: true },
    depth: 0,
  })
}
