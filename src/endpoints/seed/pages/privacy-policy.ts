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
        children: [{ type: 'text' as const, version: 1, text: 'Privacy Policy' }],
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
        children: [{ type: 'text' as const, version: 1, text: 'Política de Privacidad' }],
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

// Draft content adapted from the previous WordPress site's published Privacy Policy
// (amerikiosks.com/privacy-policy) plus the cookie-consent categories introduced by
// this change. NOT a substitute for review by qualified legal counsel before this
// page is treated as final — flagged explicitly in the intro paragraph below and in
// docs/CLIENT-MANUAL.md.
const bodyEn = buildLegalDoc(
  [
    'This Privacy Policy explains how Amerikiosks Corp. ("Amerikiosks", "we", "us") collects, uses, and protects information when you visit this website or use our kiosk products and services.',
    'This page is a working draft prepared as part of our GDPR compliance effort and has not yet been reviewed by legal counsel. Do not treat it as final legal advice — contact support@amerikiosks.com with any questions before relying on it.',
  ],
  [
    {
      heading: 'Information We Collect',
      paragraphs: [
        'We collect personally identifiable information you provide directly, such as your name, phone number, and email address, when you register an account, request a demo, or contact us through a form on this site.',
        "If you purchase a product from us, we or our third-party payment processors collect the payment information necessary to complete that transaction. We don't store full payment card numbers ourselves.",
      ],
    },
    {
      heading: 'Cookies & Tracking Technologies',
      paragraphs: [
        'This site uses cookies for two purposes: to run correctly (language preference, admin sessions, preview mode), and — only if you opt in — to understand how the site is used, via Google Analytics.',
        'You choose whether analytics cookies are set through the cookie consent banner shown on your first visit, and you can change that choice at any time using the floating "Cookie preferences" button. See our Cookie Policy for the full breakdown of what each category does.',
      ],
    },
    {
      heading: 'How We Share Your Information',
      paragraphs: [
        'We do not rent or sell your personally identifiable information to third parties.',
        'We may share non-personal, aggregated data (for example, anonymized analytics about site traffic) with service providers who help us operate the site, such as Google Analytics.',
      ],
    },
    {
      heading: 'Data Retention',
      paragraphs: [
        'If you have an account with us, we retain your information for as long as your account remains active.',
        "If you don't have an account, we retain data associated with your visit for no longer than one (1) year after your last visit to this site.",
      ],
    },
    {
      heading: 'Your Rights (EU/EEA Residents)',
      paragraphs: [
        'If you are located in the European Union or European Economic Area, you have the right to request access to, rectification of, or deletion of your personal information, and to request that we restrict or object to certain processing.',
        'Your IP address, keystroke activity, and other personal information collected from EU/EEA visitors are never stored or shared with third parties for marketing purposes.',
        'To exercise any of these rights, contact us at support@amerikiosks.com.',
      ],
    },
    {
      heading: "Children's Privacy",
      paragraphs: [
        'This site is not directed at children, and we do not knowingly collect personal information from anyone under the age of 16. If you believe a child has provided us with personal information, contact us and we will delete it.',
      ],
    },
    {
      heading: 'Changes to This Policy',
      paragraphs: [
        'If we make material changes to this policy, we will notify registered account holders by email before the changes take effect.',
      ],
    },
    {
      heading: 'Contact Us',
      paragraphs: ['Questions about this Privacy Policy can be sent to support@amerikiosks.com.'],
    },
  ],
)

const bodyEs = buildLegalDoc(
  [
    'Esta Política de Privacidad explica cómo Amerikiosks Corp. ("Amerikiosks", "nosotros") recolecta, usa y protege la información cuando visitás este sitio o usás nuestros productos y servicios de kioscos.',
    'Esta página es un borrador de trabajo preparado como parte de nuestro esfuerzo de cumplimiento GDPR y todavía no fue revisada por asesoría legal. No la trates como asesoramiento legal definitivo — escribinos a support@amerikiosks.com ante cualquier duda antes de basarte en ella.',
  ],
  [
    {
      heading: 'Información que recolectamos',
      paragraphs: [
        'Recolectamos información personal que nos proporcionás directamente, como tu nombre, teléfono y email, cuando registrás una cuenta, solicitás una demo, o nos contactás a través de un formulario en este sitio.',
        'Si comprás un producto, nosotros o nuestros procesadores de pago externos recolectamos la información de pago necesaria para completar esa transacción. No almacenamos los números completos de tarjetas.',
      ],
    },
    {
      heading: 'Cookies y tecnologías de seguimiento',
      paragraphs: [
        'Este sitio usa cookies con dos propósitos: para funcionar correctamente (idioma, sesiones de admin, modo de vista previa), y — solo si lo autorizás — para entender cómo se usa el sitio, vía Google Analytics.',
        'Vos decidís si se activan las cookies de analítica a través del banner de consentimiento que aparece en tu primera visita, y podés cambiar esa decisión en cualquier momento con el botón flotante "Preferencias de cookies". Consultá nuestra Política de Cookies para el detalle completo de cada categoría.',
      ],
    },
    {
      heading: 'Cómo compartimos tu información',
      paragraphs: [
        'No alquilamos ni vendemos tu información personal identificable a terceros.',
        'Podemos compartir datos agregados y no personales (por ejemplo, analítica anonimizada de tráfico del sitio) con proveedores que nos ayudan a operar el sitio, como Google Analytics.',
      ],
    },
    {
      heading: 'Retención de datos',
      paragraphs: [
        'Si tenés una cuenta con nosotros, retenemos tu información mientras la cuenta permanezca activa.',
        'Si no tenés cuenta, retenemos los datos asociados a tu visita por no más de un (1) año después de tu última visita a este sitio.',
      ],
    },
    {
      heading: 'Tus derechos (residentes de la UE/EEE)',
      paragraphs: [
        'Si estás en la Unión Europea o el Espacio Económico Europeo, tenés derecho a solicitar acceso, rectificación o eliminación de tu información personal, y a solicitar que restrinjamos o nos opongamos a cierto procesamiento.',
        'Tu dirección IP, actividad de teclado, y demás información personal recolectada de visitantes de la UE/EEE nunca se almacena ni comparte con terceros con fines de marketing.',
        'Para ejercer estos derechos, contactanos a support@amerikiosks.com.',
      ],
    },
    {
      heading: 'Privacidad de menores',
      paragraphs: [
        'Este sitio no está dirigido a menores, y no recolectamos a sabiendas información personal de nadie menor de 16 años. Si creés que un menor nos proporcionó información personal, contactanos y la eliminaremos.',
      ],
    },
    {
      heading: 'Cambios a esta política',
      paragraphs: [
        'Si hacemos cambios materiales a esta política, notificaremos a los titulares de cuenta registrados por email antes de que entren en vigencia.',
      ],
    },
    {
      heading: 'Contacto',
      paragraphs: [
        'Consultas sobre esta Política de Privacidad pueden enviarse a support@amerikiosks.com.',
      ],
    },
  ],
)

export const seedPrivacyPolicy = async (payload: Payload, req: PayloadRequest): Promise<void> => {
  payload.logger.info('— Seeding privacy-policy page...')

  await upsertPage(
    payload,
    req,
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      hero: { type: 'lowImpact', richText: richTextHeroEn, links: [] },
      layout: [
        {
          blockType: 'content' as const,
          blockName: 'Privacy Policy Body',
          columns: [{ size: 'full' as const, richText: bodyEn }],
        },
      ],
      _status: 'published',
    },
    {
      title: 'Política de Privacidad',
      slug: 'politica-de-privacidad',
      hero: { type: 'lowImpact', richText: richTextHeroEs },
      layout: [
        {
          blockType: 'content' as const,
          blockName: 'Privacy Policy Body',
          columns: [{ size: 'full' as const, richText: bodyEs }],
        },
      ],
    },
  )
}
