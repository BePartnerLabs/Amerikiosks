import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'

export const Brands: CollectionConfig = {
  slug: 'brands',
  labels: {
    plural: { en: 'Refund Brands', es: 'Marcas de Reembolso' },
    singular: { en: 'Refund Brand', es: 'Marca de Reembolso' },
  },
  admin: {
    group: { en: 'Config', es: 'Configuración' },
    defaultColumns: ['name', 'updatedAt'],
    useAsTitle: 'name',
    description: {
      en: "Client brands/product lines sold through Amerikiosks machines (e.g. Carlo's Bakery, Pharmabox by CVS) — referenced by Claims.kioskBrand, populates the brand picker on the refund claim form. Not the machine hardware (see Machines) or homepage trust-strip logos (see Partners).",
      es: "Marcas de clientes/líneas de producto vendidas a través de los kioscos de Amerikiosks (ej. Carlo's Bakery, Pharmabox by CVS) — referenciadas por Claims.kioskBrand, alimentan el selector de marca en el formulario de reembolso. No es el hardware de la máquina (ver Machines) ni los logos de la franja de confianza en el home (ver Partners).",
    },
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
