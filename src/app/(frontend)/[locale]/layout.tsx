import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import { cookies, draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import type React from 'react'
import { AccessibilityWidget } from '@/components/AccessibilityWidget'
import { AdminBar } from '@/components/AdminBar'
import { GAListener } from '@/components/Analytics/GAListener'
import { ConsentManager } from '@/components/ConsentBanner/ConsentManager'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { routing } from '@/i18n/routing'
import { Providers } from '@/providers'
import { A11Y_RESTORE_SCRIPT } from '@/utilities/a11yPrefs'
import { CONSENT_COOKIE_NAME, parseConsentCookie } from '@/utilities/consent'
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

  const cookieStore = await cookies()
  const consent = parseConsentCookie(cookieStore.get(CONSENT_COOKIE_NAME)?.value)
  const hasAnalyticsConsent = consent?.analytics === true

  if (!locales.includes(locale as 'en' | 'es')) {
    notFound()
  }

  const messages = await getMessages()
  const settings = await getCachedGlobal('settings', 1)()
  const footer = await getCachedGlobal('footer', 1)()
  const gaId = (settings as { googleAnalyticsId?: string } | null)?.googleAnalyticsId
  const turnstile = settings as {
    turnstileEnabled?: boolean
    turnstileSiteKey?: string
  } | null
  const turnstileSiteKey = turnstile?.turnstileEnabled ? turnstile.turnstileSiteKey : undefined
  const brandDescription = (footer as { brandDescription?: string } | null)?.brandDescription
  const contactEmail = (footer as { contactEmail?: string } | null)?.contactEmail

  const serverUrl = getServerSideURL()
  const organizationJsonLd = generateOrganizationJsonLd({
    serverUrl,
    brandDescription,
    contactEmail,
    socialUrls: (settings as { socialLinks?: { url?: string | null }[] } | null)?.socialLinks?.map(
      (link) => link.url,
    ),
  })
  const websiteJsonLd = generateWebsiteJsonLd({ serverUrl })

  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable, poppins.variable)}
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        {turnstileSiteKey && (
          // Published once here rather than threaded as a prop through every
          // FormBlock call site (blocks, FAQWithForm, the modal drawer, the
          // header/footer CTAs). A Turnstile site key is public by design.
          <meta
            content={turnstileSiteKey}
            name="turnstile-site-key"
          />
        )}
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
        <script
          // Must run before first paint, so it's a plain blocking inline script
          // rather than next/script — otherwise stored accessibility prefs
          // visibly flash off on every navigation.
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static build-time constant, no user input
          dangerouslySetInnerHTML={{ __html: A11Y_RESTORE_SCRIPT }}
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
        {gaId && hasAnalyticsConsent && (
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
            <ConsentManager initialConsent={consent} />
            <AccessibilityWidget />
            <AdminBar adminBarProps={{ preview: isEnabled }} />
            {/* High-contrast mode applies a CSS filter to this wrapper. It
                can't go on <body>: a filtered element becomes the containing
                block for its position:fixed descendants, which would make the
                accessibility and cookie buttons above scroll away with the
                page. Keeping them outside the wrapper avoids that. */}
            <div className="ak-a11y-filter-root">
              <Header />
              <main id="main-content">{children}</main>
              <Footer />
            </div>
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
