import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig, type PayloadRequest } from 'payload'
import sharp from 'sharp'
import { defaultLexical } from '@/fields/defaultLexical'
import { Categories } from './collections/Categories'
import { FAQItems } from './collections/FAQItems'
import { Insights } from './collections/Insights'
import { Machines } from './collections/Machines'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Partners } from './collections/Partners'
import { Projects } from './collections/Projects'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { Settings } from './Settings/config'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    meta: {
      titleSuffix: '— Amerikiosks',
      icons: [{ url: '/logos/logo-1.svg', type: 'image/svg+xml' }],
    },
    components: {
      graphics: {
        Logo: '@/components/AdminLogo',
        Icon: '@/components/AdminLogo',
      },
      beforeLogin: ['@/components/BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard'],
      afterNavLinks: ['@/components/SeedPanel'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    push: false,
  }),
  collections: [Pages, Insights, Media, Categories, Users, Partners, Machines, FAQItems, Projects],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, Settings],
  localization: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    fallback: true,
  },
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
