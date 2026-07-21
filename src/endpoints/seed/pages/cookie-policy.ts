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
        children: [{ type: 'text' as const, version: 1, text: 'Effective date: July 20, 2026' }],
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
          { type: 'text' as const, version: 1, text: 'Fecha de vigencia: 20 de julio de 2026' },
        ],
      },
    ],
  },
}

// Content sourced from the client's own draft (Amerikiosks_Privacy_Cookie_Policies.md,
// provided directly by the user). Two adjustments from that draft:
// - Dropped the "Functional" category (sessionStorage-based "liked" machine models) —
//   verified against the codebase, no such feature exists; publishing it would be a
//   false claim about cookies not actually set, which the source doc itself warns
//   against.
// - "We will present a cookie consent banner" -> present tense: the banner is already
//   live as of this change (src/components/ConsentBanner), not a future commitment.
// The category table became plain paragraphs (one per category) — this project's
// lexical editor config doesn't have TableFeature enabled (it ships marked
// "experimental" in the installed Payload version), and the content doesn't need a
// grid to be clear. Not a substitute for review by qualified legal counsel.
const bodyEn = buildLegalDoc(
  [],
  [
    {
      heading: 'What Are Cookies',
      paragraphs: [
        "Small text files stored on your device when you visit the Site, used to make it function properly and to understand how it's used.",
      ],
    },
    {
      heading: 'Cookies We Use',
      paragraphs: [
        'Strictly necessary — core site functionality, security, and load balancing (Vercel), such as session cookies. Required for the Site to work; you cannot opt out of these.',
        'Analytics — understanding traffic and conversion via Google Analytics 4 (cookies such as _ga, _ga_*). You can opt out at any time.',
        'Marketing — not currently used. This site runs no advertising or retargeting pixels today. If that changes in the future, you will be asked for consent before any such cookie is set.',
      ],
    },
    {
      heading: 'Managing Cookies',
      paragraphs: [
        'You can control cookies through your browser settings (block, delete, or receive alerts). Blocking strictly necessary cookies may break site functionality.',
        'We present a cookie consent banner on your first visit, letting you accept or reject non-essential cookies before they are set. You can change your choice at any time using the floating "Cookie preferences" button.',
      ],
    },
    {
      heading: 'Proof of Consent',
      paragraphs: [
        'When you make a cookie choice, we keep a record of that decision on our servers as evidence that consent was requested and given (or declined): a randomly generated id, the choice you made, and the date. This id is stored in your browser alongside your preference and is not derived from or linked to your IP address, device fingerprint, or any other personal identifier — we do not log your IP address for this purpose.',
      ],
    },
    {
      heading: 'Third-Party Cookies',
      paragraphs: [
        'Some cookies are set by third parties we work with (currently, Google Analytics). We do not control these providers’ cookies directly — refer to their respective privacy policies.',
      ],
    },
    {
      heading: 'Changes',
      paragraphs: [
        'We may update this Cookie Policy; check back periodically for the latest version.',
      ],
    },
    {
      heading: 'Contact',
      paragraphs: ['info@Amerikiosks.com'],
    },
  ],
)

const bodyEs = buildLegalDoc(
  [],
  [
    {
      heading: 'Qué Son las Cookies',
      paragraphs: [
        'Pequeños archivos de texto almacenados en tu dispositivo al visitar el Sitio, usados para que funcione correctamente y para entender cómo se usa.',
      ],
    },
    {
      heading: 'Cookies Que Usamos',
      paragraphs: [
        'Estrictamente necesarias — funcionalidad central del sitio, seguridad, y balanceo de carga (Vercel), como cookies de sesión. Requeridas para que el Sitio funcione; no podés desactivarlas.',
        'Analíticas — entender tráfico y conversión vía Google Analytics 4 (cookies como _ga, _ga_*). Podés rechazarlas en cualquier momento.',
        'Marketing — no se usan actualmente. Este sitio no corre pixeles de publicidad ni retargeting hoy. Si eso cambia en el futuro, te pediremos consentimiento antes de activar cualquier cookie de ese tipo.',
      ],
    },
    {
      heading: 'Gestión de Cookies',
      paragraphs: [
        'Podés controlar las cookies desde la configuración de tu navegador (bloquear, eliminar o recibir alertas). Bloquear cookies estrictamente necesarias puede romper la funcionalidad del sitio.',
        'Mostramos un banner de consentimiento de cookies en tu primera visita, que te permite aceptar o rechazar cookies no esenciales antes de que se activen. Podés cambiar tu decisión en cualquier momento con el botón flotante "Preferencias de cookies".',
      ],
    },
    {
      heading: 'Prueba de Consentimiento',
      paragraphs: [
        'Cuando tomás una decisión sobre cookies, guardamos un registro de esa decisión en nuestros servidores como evidencia de que se solicitó y se otorgó (o rechazó) el consentimiento: un id generado aleatoriamente, la elección que hiciste y la fecha. Ese id se guarda en tu navegador junto con tu preferencia y no se deriva ni está vinculado a tu dirección IP, huella digital del dispositivo, ni ningún otro identificador personal — no registramos tu dirección IP para este fin.',
      ],
    },
    {
      heading: 'Cookies de Terceros',
      paragraphs: [
        'Algunas cookies son configuradas por terceros con los que trabajamos (actualmente, Google Analytics). No controlamos directamente las cookies de estos proveedores — revisá sus políticas de privacidad respectivas.',
      ],
    },
    {
      heading: 'Cambios',
      paragraphs: [
        'Podemos actualizar esta Política de Cookies; revisá periódicamente la versión más reciente.',
      ],
    },
    {
      heading: 'Contacto',
      paragraphs: ['info@Amerikiosks.com'],
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
