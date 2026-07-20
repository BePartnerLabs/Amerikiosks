import type { Payload, PayloadRequest } from 'payload'
import { upsertPage } from './utils'

type Section = { heading: string; paragraphs: string[] }

const buildLegalDoc = (intro: string[], sections: Section[]) => ({
  root: {
    type: 'root' as const,
    version: 1,
    direction: null,
    format: '' as const,
    indent: 0,
    children: [
      ...intro.map((text) => ({
        type: 'paragraph' as const,
        version: 1,
        children: [{ type: 'text' as const, version: 1, text }],
      })),
      ...sections.flatMap((section) => [
        {
          type: 'heading' as const,
          tag: 'h2' as const,
          version: 1,
          children: [{ type: 'text' as const, version: 1, text: section.heading }],
        },
        ...section.paragraphs.map((text) => ({
          type: 'paragraph' as const,
          version: 1,
          children: [{ type: 'text' as const, version: 1, text }],
        })),
      ]),
    ],
  },
})

const richTextHeroEn = {
  root: {
    type: 'root' as const,
    version: 1,
    direction: null,
    format: '' as const,
    indent: 0,
    children: [
      {
        type: 'heading' as const,
        tag: 'h1' as const,
        version: 1,
        children: [{ type: 'text' as const, version: 1, text: 'Cookie Policy' }],
      },
      {
        type: 'paragraph' as const,
        version: 1,
        children: [{ type: 'text' as const, version: 1, text: 'Last updated: July 19, 2026' }],
      },
    ],
  },
}

const richTextHeroEs = {
  root: {
    type: 'root' as const,
    version: 1,
    direction: null,
    format: '' as const,
    indent: 0,
    children: [
      {
        type: 'heading' as const,
        tag: 'h1' as const,
        version: 1,
        children: [{ type: 'text' as const, version: 1, text: 'Política de Cookies' }],
      },
      {
        type: 'paragraph' as const,
        version: 1,
        children: [
          { type: 'text' as const, version: 1, text: 'Última actualización: 19 de julio de 2026' },
        ],
      },
    ],
  },
}

// Draft content — the previous WordPress site (amerikiosks.com) never had a dedicated
// Cookie Policy page (it 404s there), so this is written from scratch based on what
// this site actually does: only Google Analytics 4, gated behind the consent banner
// added by this change, with no other trackers (audited against the live WordPress
// site — no Facebook/LinkedIn/TikTok/Hotjar/Clarity/Bing pixels found). Not a
// substitute for review by qualified legal counsel before this page is final.
const bodyEn = buildLegalDoc(
  [
    'This Cookie Policy explains what cookies this website uses, why, and how you can control them. It supplements our Privacy Policy.',
    'This page is a working draft prepared as part of our GDPR compliance effort and has not yet been reviewed by legal counsel. Do not treat it as final legal advice — contact support@amerikiosks.com with any questions before relying on it.',
  ],
  [
    {
      heading: 'What Are Cookies',
      paragraphs: [
        'Cookies are small text files a website stores on your device to remember information about your visit, such as your language preference or whether you accepted cookies.',
      ],
    },
    {
      heading: 'How We Ask for Your Consent',
      paragraphs: [
        'When you first visit this site, a consent banner asks you to accept or reject non-essential cookies. Necessary cookies are always on and don’t require consent — they’re what makes the site work. You can change your choice at any time using the floating "Cookie preferences" button that appears after your first decision.',
      ],
    },
    {
      heading: 'Necessary Cookies',
      paragraphs: [
        "Required for the site to work and can't be turned off: they remember your language preference, keep you signed in to the admin panel if you're a content editor, and support the content preview mode.",
      ],
    },
    {
      heading: 'Analytics Cookies',
      paragraphs: [
        'Set only if you accept them, and off by default. We use Google Analytics 4 to understand how visitors use this site — which pages are popular, how people navigate, and similar aggregate patterns. This helps us improve the site; it does not identify you personally.',
        'Google Analytics is currently the only analytics or advertising tracker on this site. If that changes, we will update this page and, where required, ask for your consent again.',
      ],
    },
    {
      heading: 'Managing Your Preferences',
      paragraphs: [
        'You can accept or reject analytics cookies at any time via the floating "Cookie preferences" button. You can also block or delete cookies through your browser settings, though doing so may limit some site functionality.',
      ],
    },
    {
      heading: 'Third-Party Cookies',
      paragraphs: [
        'Google Analytics sets its own cookies, governed by Google’s privacy policy. We don’t control how Google processes that data beyond the reporting it provides us.',
      ],
    },
    {
      heading: 'Changes to This Policy',
      paragraphs: [
        'If we add new cookie categories or change how we use existing ones, we will update this page and, where required by law, ask for your consent again.',
      ],
    },
    {
      heading: 'Contact Us',
      paragraphs: ['Questions about this Cookie Policy can be sent to support@amerikiosks.com.'],
    },
  ],
)

const bodyEs = buildLegalDoc(
  [
    'Esta Política de Cookies explica qué cookies usa este sitio, por qué, y cómo podés controlarlas. Complementa nuestra Política de Privacidad.',
    'Esta página es un borrador de trabajo preparado como parte de nuestro esfuerzo de cumplimiento GDPR y todavía no fue revisada por asesoría legal. No la trates como asesoramiento legal definitivo — escribinos a support@amerikiosks.com ante cualquier duda antes de basarte en ella.',
  ],
  [
    {
      heading: 'Qué son las cookies',
      paragraphs: [
        'Las cookies son pequeños archivos de texto que un sitio web guarda en tu dispositivo para recordar información sobre tu visita, como tu preferencia de idioma o si aceptaste las cookies.',
      ],
    },
    {
      heading: 'Cómo pedimos tu consentimiento',
      paragraphs: [
        'Cuando visitás el sitio por primera vez, un banner de consentimiento te pide aceptar o rechazar las cookies no esenciales. Las cookies necesarias siempre están activas y no requieren consentimiento — son las que hacen que el sitio funcione. Podés cambiar tu decisión en cualquier momento con el botón flotante "Preferencias de cookies" que aparece después de tu primera decisión.',
      ],
    },
    {
      heading: 'Cookies necesarias',
      paragraphs: [
        'Requeridas para que el sitio funcione y no se pueden desactivar: recuerdan tu preferencia de idioma, mantienen tu sesión iniciada en el panel de admin si sos editor de contenido, y habilitan el modo de vista previa.',
      ],
    },
    {
      heading: 'Cookies de analítica',
      paragraphs: [
        'Se activan solo si las aceptás, y están desactivadas por defecto. Usamos Google Analytics 4 para entender cómo los visitantes usan este sitio — qué páginas son populares, cómo navega la gente, y patrones agregados similares. Esto nos ayuda a mejorar el sitio; no te identifica personalmente.',
        'Google Analytics es actualmente el único rastreador de analítica o publicidad en este sitio. Si eso cambia, actualizaremos esta página y, cuando corresponda, volveremos a pedir tu consentimiento.',
      ],
    },
    {
      heading: 'Cómo gestionar tus preferencias',
      paragraphs: [
        'Podés aceptar o rechazar las cookies de analítica en cualquier momento con el botón flotante "Preferencias de cookies". También podés bloquear o eliminar cookies desde la configuración de tu navegador, aunque eso puede limitar algunas funciones del sitio.',
      ],
    },
    {
      heading: 'Cookies de terceros',
      paragraphs: [
        'Google Analytics establece sus propias cookies, reguladas por la política de privacidad de Google. No controlamos cómo Google procesa esos datos más allá de los reportes que nos provee.',
      ],
    },
    {
      heading: 'Cambios a esta política',
      paragraphs: [
        'Si agregamos nuevas categorías de cookies o cambiamos cómo usamos las existentes, actualizaremos esta página y, cuando la ley lo requiera, volveremos a pedir tu consentimiento.',
      ],
    },
    {
      heading: 'Contacto',
      paragraphs: [
        'Consultas sobre esta Política de Cookies pueden enviarse a support@amerikiosks.com.',
      ],
    },
  ],
)

export const seedCookiePolicy = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding cookie-policy page...')

  await upsertPage(
    payload,
    req,
    {
      title: 'Cookie Policy',
      slug: 'cookie-policy',
      hero: { type: 'lowImpact', richText: richTextHeroEn, links: [] },
      layout: [
        {
          blockType: 'content' as const,
          blockName: 'Cookie Policy Body',
          columns: [{ size: 'full' as const, richText: bodyEn }],
        },
      ],
      _status: 'published',
    },
    {
      // Same slug as EN, deliberately not translated: the consent banner links to the
      // bare path "/cookie-policy" (plain next/link, not locale-aware) from both
      // locales, so this page must resolve at the same slug either way. Per
      // src/i18n/routing.ts, bare paths always resolve to the 'en' locale content
      // regardless of the visitor's locale — a Spanish-side visitor clicking the
      // banner link currently sees the English page. That's an existing limitation
      // of the link approach chosen in this change, not something fixed here.
      title: 'Política de Cookies',
      slug: 'cookie-policy',
      hero: { type: 'lowImpact', richText: richTextHeroEs },
      layout: [
        {
          blockType: 'content' as const,
          blockName: 'Cookie Policy Body',
          columns: [{ size: 'full' as const, richText: bodyEs }],
        },
      ],
    },
  )
}
