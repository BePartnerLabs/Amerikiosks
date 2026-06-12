import type { Block } from 'payload'
import { defaultLexical } from '@/fields/defaultLexical'

export const ProjectsShowcase: Block = {
  slug: 'projectsShowcase',
  interfaceName: 'ProjectsShowcaseBlock',
  labels: { singular: 'Projects Showcase', plural: 'Projects Showcases' },
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
