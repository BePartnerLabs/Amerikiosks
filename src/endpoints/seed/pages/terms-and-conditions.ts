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
        children: [{ type: 'text' as const, version: 1, text: 'Terms and Conditions' }],
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
        children: [{ type: 'text' as const, version: 1, text: 'Términos y Condiciones' }],
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

// Content sourced from the client's own draft (shared directly by the user), which
// replaces the live terms-and-conditions page's 2023 WooCommerce boilerplate (order
// cancellations, credit card charge language, "placing an order for products") —
// that copy doesn't match the current site, a B2B lead-generation site for
// brand/venue partnerships, not a storefront. Not a substitute for review by
// qualified legal counsel: the indemnification and liability sections need that
// review, and counsel should confirm a separate signed partnership/service
// agreement (not this page) governs the commercial relationship once a lead
// converts — stated explicitly below so this page isn't read as that contract.
const bodyEn = buildLegalDoc(
  [],
  [
    {
      heading: 'Acceptance of Terms',
      paragraphs: [
        'Welcome to amerikiosks.com (the "Site"), operated by Amerikiosk Corp ("Amerikiosks," "we," "us," "our"). By accessing or using the Site — browsing, submitting an inquiry, or otherwise interacting with it — you agree to be bound by these Terms and Conditions. If you do not agree, do not use the Site.',
        'These Terms govern use of the Site only. They do not constitute a partnership, vending, service, or supply agreement. Any commercial relationship between Amerikiosks and a brand partner, venue operator, or vendor is governed exclusively by a separate signed agreement, which controls in the event of any conflict with this page.',
      ],
    },
    {
      heading: 'What the Site Is For',
      paragraphs: [
        "The Site provides information about Amerikiosks' automated retail infrastructure, machine models, business models (full-service, consignment, services), and case studies, and allows visitors to submit inquiries to explore a brand partnership, venue placement, or emerging-brand distribution opportunity. Submitting an inquiry does not create any obligation on Amerikiosks' part to accept it, nor any guarantee of placement, revenue, or terms.",
      ],
    },
    {
      heading: 'Intellectual Property',
      paragraphs: [
        'All content on the Site — text, graphics, logos, photographs, videos, machine imagery, and the overall design — is owned by Amerikiosks or its licensors and protected by copyright, trademark, and other intellectual property laws. You may view and browse the Site for personal, non-commercial reference. You may not copy, reproduce, republish, modify, distribute, or create derivative works from Site content without our prior written permission. The "Amerikiosks" name and logo may not be used without written authorization.',
      ],
    },
    {
      heading: 'Accuracy of Information',
      paragraphs: [
        'We make reasonable efforts to keep machine specifications, business model descriptions, and case studies accurate and current, but we do not guarantee that all content is complete, current, or error-free. Machine availability, specifications, pricing structures, and program terms are subject to change and are confirmed only in a signed partnership agreement — not on this Site.',
      ],
    },
    {
      heading: 'Submissions',
      paragraphs: [
        'Any information you submit through a Site form (inquiries, applications, messages) will be used to evaluate and respond to your request as described in our Privacy Policy. Do not submit confidential or proprietary information you are not comfortable sharing as part of an initial business inquiry.',
      ],
    },
    {
      heading: 'Disclaimer of Warranties',
      paragraphs: [
        'THE SITE IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR UNINTERRUPTED, SECURE, OR ERROR-FREE OPERATION. AMERIKIOSKS DOES NOT WARRANT THAT THE SITE WILL MEET YOUR REQUIREMENTS.',
      ],
    },
    {
      heading: 'Limitation of Liability',
      paragraphs: [
        'TO THE MAXIMUM EXTENT PERMITTED BY LAW, AMERIKIOSKS AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AFFILIATES WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF, OR INABILITY TO USE, THE SITE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. SOME JURISDICTIONS DO NOT ALLOW THESE LIMITATIONS, SO THEY MAY NOT APPLY TO YOU.',
      ],
    },
    {
      heading: 'Third-Party Links',
      paragraphs: [
        'The Site may link to third-party websites (e.g., partner brand sites, social media). We do not control and are not responsible for the content, availability, or privacy practices of linked sites.',
      ],
    },
    {
      heading: 'Indemnification',
      paragraphs: [
        'You agree to indemnify and hold Amerikiosks harmless from claims, damages, and reasonable legal fees arising from your misuse of the Site or violation of these Terms.',
      ],
    },
    {
      heading: 'Governing Law and Venue',
      paragraphs: [
        'These Terms are governed by the laws of the State of Florida, without regard to conflict-of-law principles. Any dispute arising from use of the Site shall be brought exclusively in the state or federal courts located in Miami-Dade County, Florida.',
      ],
    },
    {
      heading: 'Changes to These Terms',
      paragraphs: [
        'We may update these Terms at any time by posting the revised version on this page with an updated effective date. Continued use of the Site after changes take effect constitutes acceptance.',
      ],
    },
    {
      heading: 'Severability & Entire Agreement',
      paragraphs: [
        'If any provision of these Terms is found unenforceable, the remaining provisions stay in effect. These Terms, together with our Privacy Policy and Cookie Policy, constitute the entire agreement regarding Site use.',
      ],
    },
    {
      heading: 'Contact',
      paragraphs: [
        'Amerikiosk Corp, 9649 NW 33rd Street, Doral, FL 33178, United States. Phone: (888) 509-3699. Email: info@Amerikiosks.com.',
      ],
    },
  ],
)

const bodyEs = buildLegalDoc(
  [],
  [
    {
      heading: 'Aceptación de los Términos',
      paragraphs: [
        'Bienvenido a amerikiosks.com (el "Sitio"), operado por Amerikiosk Corp ("Amerikiosks," "nosotros"). Al acceder o usar el Sitio — navegar, enviar una consulta, o interactuar de cualquier forma — aceptás quedar sujeto a estos Términos y Condiciones. Si no estás de acuerdo, no uses el Sitio.',
        'Estos Términos rigen únicamente el uso del Sitio. No constituyen un acuerdo de partnership, venta, servicio o suministro. Cualquier relación comercial entre Amerikiosks y una marca partner, operador de venue o proveedor se rige exclusivamente por un acuerdo firmado por separado, que prevalece en caso de conflicto con esta página.',
      ],
    },
    {
      heading: 'Para Qué Es el Sitio',
      paragraphs: [
        'El Sitio ofrece información sobre la infraestructura de retail automatizado de Amerikiosks, modelos de máquina, modelos de negocio (full-service, consignación, servicios) y casos de éxito, y permite a los visitantes enviar consultas para explorar una oportunidad de partnership de marca, colocación en venue, o distribución para marca emergente. Enviar una consulta no genera ninguna obligación de parte de Amerikiosks de aceptarla, ni garantía de colocación, revenue o términos.',
      ],
    },
    {
      heading: 'Propiedad Intelectual',
      paragraphs: [
        'Todo el contenido del Sitio — texto, gráficos, logos, fotografías, videos, imágenes de máquinas y el diseño general — es propiedad de Amerikiosks o sus licenciantes y está protegido por derechos de autor, marca registrada y otras leyes de propiedad intelectual. Podés ver y navegar el Sitio para referencia personal, no comercial. No podés copiar, reproducir, republicar, modificar, distribuir ni crear obras derivadas del contenido del Sitio sin autorización previa por escrito. El nombre y logo "Amerikiosks" no pueden usarse sin autorización escrita.',
      ],
    },
    {
      heading: 'Exactitud de la Información',
      paragraphs: [
        'Hacemos esfuerzos razonables para mantener actualizadas y precisas las especificaciones de máquinas, descripciones de modelos de negocio y casos de éxito, pero no garantizamos que todo el contenido esté completo, actualizado o libre de errores. La disponibilidad de máquinas, especificaciones, estructuras de precio y términos de programa están sujetos a cambio y solo se confirman en un acuerdo de partnership firmado — no en este Sitio.',
      ],
    },
    {
      heading: 'Envíos de Información',
      paragraphs: [
        'Cualquier información que envíes a través de un formulario del Sitio (consultas, aplicaciones, mensajes) será usada para evaluar y responder tu solicitud según lo descrito en nuestra Política de Privacidad. No envíes información confidencial o propietaria que no estés dispuesto a compartir como parte de una consulta comercial inicial.',
      ],
    },
    {
      heading: 'Exclusión de Garantías',
      paragraphs: [
        'EL SITIO SE PROPORCIONA "TAL CUAL" Y "SEGÚN DISPONIBILIDAD," SIN GARANTÍAS DE NINGÚN TIPO, EXPRESAS O IMPLÍCITAS, INCLUYENDO GARANTÍAS DE COMERCIABILIDAD, IDONEIDAD PARA UN PROPÓSITO PARTICULAR, NO INFRACCIÓN, U OPERACIÓN ININTERRUMPIDA, SEGURA O LIBRE DE ERRORES. AMERIKIOSKS NO GARANTIZA QUE EL SITIO CUMPLIRÁ CON TUS REQUISITOS.',
      ],
    },
    {
      heading: 'Limitación de Responsabilidad',
      paragraphs: [
        'EN LA MEDIDA MÁXIMA PERMITIDA POR LA LEY, AMERIKIOSKS Y SUS FUNCIONARIOS, DIRECTORES, EMPLEADOS Y AFILIADOS NO SERÁN RESPONSABLES POR DAÑOS INDIRECTOS, INCIDENTALES, ESPECIALES, CONSECUENTES O PUNITIVOS DERIVADOS DEL USO O IMPOSIBILIDAD DE USO DEL SITIO, INCLUSO SI SE ADVIRTIÓ DE LA POSIBILIDAD DE TALES DAÑOS. ALGUNAS JURISDICCIONES NO PERMITEN ESTAS LIMITACIONES, POR LO QUE PUEDEN NO APLICARTE.',
      ],
    },
    {
      heading: 'Enlaces a Terceros',
      paragraphs: [
        'El Sitio puede enlazar a sitios web de terceros (ej. sitios de marcas partner, redes sociales). No controlamos ni somos responsables del contenido, disponibilidad o prácticas de privacidad de sitios enlazados.',
      ],
    },
    {
      heading: 'Indemnización',
      paragraphs: [
        'Aceptás indemnizar y mantener indemne a Amerikiosks frente a reclamos, daños y honorarios legales razonables derivados de tu uso indebido del Sitio o violación de estos Términos.',
      ],
    },
    {
      heading: 'Ley Aplicable y Jurisdicción',
      paragraphs: [
        'Estos Términos se rigen por las leyes del Estado de Florida, sin considerar principios de conflicto de leyes. Cualquier disputa derivada del uso del Sitio se presentará exclusivamente ante las cortes estatales o federales ubicadas en el condado de Miami-Dade, Florida.',
      ],
    },
    {
      heading: 'Cambios a Estos Términos',
      paragraphs: [
        'Podemos actualizar estos Términos en cualquier momento publicando la versión revisada en esta página con una fecha de vigencia actualizada. El uso continuado del Sitio después de que los cambios entren en vigor constituye aceptación.',
      ],
    },
    {
      heading: 'Divisibilidad y Acuerdo Completo',
      paragraphs: [
        'Si alguna disposición de estos Términos resulta inaplicable, las disposiciones restantes permanecen vigentes. Estos Términos, junto con nuestra Política de Privacidad y Política de Cookies, constituyen el acuerdo completo respecto al uso del Sitio.',
      ],
    },
    {
      heading: 'Contacto',
      paragraphs: [
        'Amerikiosk Corp, 9649 NW 33rd Street, Doral, FL 33178, United States. Teléfono: (888) 509-3699. Correo: info@Amerikiosks.com.',
      ],
    },
  ],
)

export const seedTermsAndConditions = async (
  payload: Payload,
  req: PayloadRequest,
): Promise<void> => {
  payload.logger.info('— Seeding terms-and-conditions page...')

  await upsertPage(
    payload,
    req,
    {
      title: 'Terms and Conditions',
      slug: 'terms-and-conditions',
      hero: { type: 'lowImpact', richText: richTextHeroEn, links: [] },
      layout: [
        {
          blockType: 'content' as const,
          blockName: 'Terms and Conditions Body',
          columns: [{ size: 'full' as const, richText: bodyEn }],
        },
      ],
      _status: 'published',
    },
    {
      title: 'Términos y Condiciones',
      slug: 'terminos-y-condiciones',
      hero: { type: 'lowImpact', richText: richTextHeroEs },
      layout: [
        {
          blockType: 'content' as const,
          blockName: 'Terms and Conditions Body',
          columns: [{ size: 'full' as const, richText: bodyEs }],
        },
      ],
    },
  )
}
