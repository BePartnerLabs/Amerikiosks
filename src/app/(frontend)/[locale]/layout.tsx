import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import type React from 'react'
import { AdminBar } from '@/components/AdminBar'
import { GAListener } from '@/components/Analytics/GAListener'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { routing } from '@/i18n/routing'
import { Providers } from '@/providers'
import { generateOrganizationJsonLd, generateWebsiteJsonLd } from '@/utilities/generateJsonLd'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { cn } from '@/utilities/ui'

import '../globals.css'
import '../frontend.css'
import { getServerSideURL } from '@/utilities/getURL'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

const locales = routing.locales

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  const { isEnabled } = await draftMode()

  if (!locales.includes(locale as 'en' | 'es')) {
    notFound()
  }

  const messages = await getMessages()
  const settings = await getCachedGlobal('settings', 1)()
  const footer = await getCachedGlobal('footer', 1)()
  const gaId = (settings as { googleAnalyticsId?: string } | null)?.googleAnalyticsId
  const brandDescription = (footer as { brandDescription?: string } | null)?.brandDescription
  const contactEmail = (footer as { contactEmail?: string } | null)?.contactEmail

  const serverUrl = getServerSideURL()
  const organizationJsonLd = generateOrganizationJsonLd({
    serverUrl,
    brandDescription,
    contactEmail,
  })
  const websiteJsonLd = generateWebsiteJsonLd({ serverUrl })

  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable, poppins.variable)}
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is server-generated structured data, not user input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is server-generated structured data, not user input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <link
          href="/favicon.ico"
          rel="icon"
          sizes="32x32"
        />
        <link
          href="/favicon.svg"
          rel="icon"
          type="image/svg+xml"
        />
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script
              id="ga4-init"
              strategy="afterInteractive"
            >{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}</Script>
          </>
        )}
      </head>
      <body>
        <a
          href="#main-content"
          className="skip-to-content"
        >
          Skip to content
        </a>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <GAListener />
            <AdminBar adminBarProps={{ preview: isEnabled }} />
            <Header />
            <main id="main-content">{children}</main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@amerikiosks',
  },
}
