import type { Block } from 'payload'
import { defaultLexical } from '@/fields/defaultLexical'

export const ProjectsShowcase: Block = {
  slug: 'projectsShowcase',
  interfaceName: 'ProjectsShowcaseBlock',
  imageURL: '/block-previews/projects-showcase.png',
  imageAltText: 'Projects Showcase — heading + project cards filtered by tag',
  labels: {
    singular: { en: 'Projects Showcase', es: 'Vitrina de Proyectos' },
    plural: { en: 'Projects Showcases', es: 'Vitrinas de Proyectos' },
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      admin: { description: 'Small label above heading, e.g. "REAL BRAND MOMENTS"' },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description:
          'Para destacar una palabra o frase en negrita, envuélvela en asteriscos dobles: **texto**',
      },
    },
    {
      name: 'body',
      type: 'richText',
      editor: defaultLexical,
      localized: true,
      admin: { description: 'Supporting text shown below the heading' },
    },
    {
      name: 'filterTag',
      type: 'text',
      required: true,
      admin: {
        description: 'Fetch projects where tags.label matches this value, e.g. "brand", "agency"',
      },
    },
  ],
}
