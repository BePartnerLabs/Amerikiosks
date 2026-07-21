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
        children: [{ type: 'text' as const, version: 1, text: 'Política de Privacidad' }],
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
// provided directly by the user), which reflects the site's actual data flows — not
// migrated/adapted from the old WordPress copy. Not a substitute for review by
// qualified legal counsel: CCPA applicability, PCI-DSS payment language, and any
// Curaçao/El Salvador-specific requirements still need that review before this is
// treated as final (per the source doc's own disclaimer).
const bodyEn = buildLegalDoc(
  [],
  [
    {
      heading: 'Who We Are',
      paragraphs: [
        'Amerikiosks ("Amerikiosks," "we," "us," "our") provides branded automated retail infrastructure — self-operating kiosks placed in high-traffic venues (airports, hotels, stadiums, resorts, commercial properties) across the United States, El Salvador, and (soon) Curaçao. This policy covers data collected through amerikiosks.com (the "Site") and, where applicable, through our physical kiosks.',
      ],
    },
    {
      heading: 'What Data We Collect',
      paragraphs: [
        "Data you give us directly: contact forms (partnership inquiries, venue operator inquiries, brand applications) — name, email, phone, company, role, and message content — plus any information submitted through the Site's lead pre-qualification forms.",
        'Data collected automatically: usage data via Google Analytics 4 (pages visited, session duration, referral source, device/browser type, approximate location derived from IP), and standard server logs (IP address, timestamp, user agent).',
        'Cookie consent record: when you make a cookie choice, we log a randomly generated id, the choice, and the date as proof of consent. This record does not include your IP address or any other identifier — see the Cookie Policy for details.',
        'Data from kiosk transactions: transaction metadata (item, time, machine ID, amount) processed by our payment processor. Amerikiosks does not collect, transmit, or store full payment card data — that is handled entirely by our PCI-DSS-compliant payment processor.',
      ],
    },
    {
      heading: 'How We Use Your Data',
      paragraphs: [
        'We use your data to respond to partnership, venue, and brand inquiries and route qualified leads to our sales team; to operate, maintain, and improve the Site and our kiosk network; to measure marketing performance and site conversion (aggregated/anonymized where possible); and to comply with legal obligations.',
        'We do not sell personal information.',
      ],
    },
    {
      heading: 'Who We Share Data With',
      paragraphs: [
        'Internal tooling: lead data submitted through the Site flows into our CRM/operations stack (JotForm → Monday.com → Odoo, or direct integration where in use) solely to manage the sales and partnership process.',
        'Service providers: hosting (Vercel), database, storage (Cloudflare R2), analytics (Google Analytics 4), and payment processing (a third-party PCI-DSS-compliant processor).',
        'Legal: if required by law, regulation, or valid legal process.',
        'We do not share data with third parties for their own marketing purposes.',
      ],
    },
    {
      heading: 'International Data Transfers',
      paragraphs: [
        'Amerikiosks operates across the US, El Salvador, and Curaçao. Data may be processed in the United States regardless of where you submit it. By using the Site, you acknowledge this transfer.',
      ],
    },
    {
      heading: 'Data Retention',
      paragraphs: [
        'We retain inquiry and lead data for as long as necessary to manage the business relationship and for a reasonable period afterward for legal and record-keeping purposes, after which it is deleted or anonymized.',
      ],
    },
    {
      heading: 'Your Rights',
      paragraphs: [
        'Depending on your location, you may have the right to access, correct, delete, or restrict use of your personal data, and (for California residents) to opt out of "sale" or "sharing" as defined under the CCPA/CPRA — noting Amerikiosks does not sell personal information. To exercise any right, contact info@Amerikiosks.com.',
      ],
    },
    {
      heading: "Children's Privacy",
      paragraphs: [
        'The Site is not directed to children under 13, and we do not knowingly collect their personal information.',
      ],
    },
    {
      heading: 'Security',
      paragraphs: [
        'We use commercially reasonable technical and organizational measures to protect your data. No system is 100% secure.',
      ],
    },
    {
      heading: 'Changes to This Policy',
      paragraphs: [
        'We may update this policy periodically. Material changes will be reflected by an updated "Effective date" above.',
      ],
    },
    {
      heading: 'Contact',
      paragraphs: [
        'Amerikiosks, Amerikiosk Corp, 9649 NW 33rd Street, Doral, FL 33178, United States. Phone: (888) 509-3699. Email: info@Amerikiosks.com.',
      ],
    },
  ],
)

const bodyEs = buildLegalDoc(
  [],
  [
    {
      heading: 'Quiénes Somos',
      paragraphs: [
        'Amerikiosks ("Amerikiosks," "nosotros") ofrece infraestructura de retail automatizado de marca — kiosks autónomos ubicados en espacios de alto tráfico (aeropuertos, hoteles, estadios, resorts, propiedades comerciales) en Estados Unidos, El Salvador y (próximamente) Curazao. Esta política cubre los datos recolectados a través de amerikiosks.com (el "Sitio") y, cuando aplique, a través de nuestros kiosks físicos.',
      ],
    },
    {
      heading: 'Qué Datos Recolectamos',
      paragraphs: [
        'Datos que nos entregas directamente: formularios de contacto (consultas de partnership, operadores de venue, aplicaciones de marca) — nombre, correo, teléfono, empresa, cargo y mensaje — más cualquier información enviada a través de los formularios de precalificación de leads del Sitio.',
        'Datos recolectados automáticamente: datos de uso vía Google Analytics 4 (páginas visitadas, duración de sesión, fuente de referencia, tipo de dispositivo/navegador, ubicación aproximada derivada de la IP), y registros estándar de servidor (dirección IP, timestamp, user agent).',
        'Registro de consentimiento de cookies: cuando tomás una decisión sobre cookies, registramos un id generado aleatoriamente, la elección y la fecha como prueba de consentimiento. Este registro no incluye tu dirección IP ni ningún otro identificador — ver la Política de Cookies para más detalles.',
        'Datos de transacciones en kiosks: metadata de transacción (ítem, hora, ID de máquina, monto) procesada por nuestro procesador de pagos. Amerikiosks no recolecta, transmite ni almacena datos completos de tarjeta — eso lo maneja íntegramente nuestro procesador de pagos, certificado PCI-DSS.',
      ],
    },
    {
      heading: 'Cómo Usamos Tus Datos',
      paragraphs: [
        'Usamos tus datos para responder consultas de partnership, venue y marca, y enrutar leads calificados a nuestro equipo comercial; para operar, mantener y mejorar el Sitio y nuestra red de kiosks; para medir desempeño de marketing y conversión del sitio (agregado/anonimizado cuando sea posible); y para cumplir con obligaciones legales.',
        'No vendemos información personal.',
      ],
    },
    {
      heading: 'Con Quién Compartimos Datos',
      paragraphs: [
        'Herramientas internas: los datos de leads enviados a través del Sitio fluyen hacia nuestro stack de CRM/operaciones (JotForm → Monday.com → Odoo, o integración directa cuando esté en uso) únicamente para gestionar el proceso comercial y de partnership.',
        'Proveedores de servicio: hosting (Vercel), base de datos, almacenamiento (Cloudflare R2), analítica (Google Analytics 4), y procesamiento de pagos (un procesador externo certificado PCI-DSS).',
        'Legal: cuando lo exija la ley, regulación o proceso legal válido.',
        'No compartimos datos con terceros para sus propios fines de marketing.',
      ],
    },
    {
      heading: 'Transferencias Internacionales de Datos',
      paragraphs: [
        'Amerikiosks opera en Estados Unidos, El Salvador y Curazao. Tus datos pueden procesarse en Estados Unidos independientemente de dónde los envíes. Al usar el Sitio, reconocés esta transferencia.',
      ],
    },
    {
      heading: 'Retención de Datos',
      paragraphs: [
        'Retenemos los datos de consultas y leads mientras sea necesario para gestionar la relación comercial, y por un período razonable adicional para fines legales y de registro, tras lo cual se eliminan o anonimizan.',
      ],
    },
    {
      heading: 'Tus Derechos',
      paragraphs: [
        'Dependiendo de tu ubicación, podés tener derecho a acceder, corregir, eliminar o restringir el uso de tus datos personales, y (para residentes de California) a optar por no participar en la "venta" o "compartición" definida bajo CCPA/CPRA — aclarando que Amerikiosks no vende información personal. Para ejercer cualquier derecho, contactá a info@Amerikiosks.com.',
      ],
    },
    {
      heading: 'Privacidad de Menores',
      paragraphs: [
        'El Sitio no está dirigido a menores de 13 años y no recolectamos conscientemente su información personal.',
      ],
    },
    {
      heading: 'Seguridad',
      paragraphs: [
        'Usamos medidas técnicas y organizacionales comercialmente razonables para proteger tus datos. Ningún sistema es 100% seguro.',
      ],
    },
    {
      heading: 'Cambios a Esta Política',
      paragraphs: [
        'Podemos actualizar esta política periódicamente. Los cambios materiales se reflejarán con una "Fecha de vigencia" actualizada arriba.',
      ],
    },
    {
      heading: 'Contacto',
      paragraphs: [
        'Amerikiosks, Amerikiosk Corp, 9649 NW 33rd Street, Doral, FL 33178, United States. Teléfono: (888) 509-3699. Email: info@Amerikiosks.com.',
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
