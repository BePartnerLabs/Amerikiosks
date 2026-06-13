import type { RequiredDataFromCollectionSlug } from 'payload'

export const venueProgramForm: RequiredDataFromCollectionSlug<'forms'> = {
  title: 'Venue Program Form',
  confirmationType: 'message',
  confirmationMessage: {
    root: {
      type: 'root',
      children: [
        {
          type: 'heading',
          children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: "¡Gracias! Nos pondremos en contacto pronto.", version: 1 }],
          direction: 'ltr', format: '', indent: 0, tag: 'h2', version: 1,
        },
      ],
      direction: 'ltr', format: '', indent: 0, version: 1,
    },
  },
  emails: [
    {
      emailFrom: '"Amerikiosks" <noreply@amerikiosks.com>',
      emailTo: 'venues@amerikiosks.com',
      subject: 'New Venue Partnership Request',
      message: {
        root: {
          type: 'root',
          children: [{ type: 'paragraph', children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'A new venue partnership request has been submitted.', version: 1 }], direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1 }],
          direction: 'ltr', format: '', indent: 0, version: 1,
        },
      },
    },
  ],
  fields: [
    { name: 'venue-name', blockName: 'venue-name', blockType: 'text', label: 'Nombre del venue', required: true, width: 50 },
    { name: 'work-email', blockName: 'work-email', blockType: 'email', label: 'Email de trabajo', required: true, width: 50 },
    { name: 'venue-type', blockName: 'venue-type', blockType: 'text', label: 'Tipo de venue (hotel, aeropuerto, mall, estadio…)', required: false, width: 50 },
    { name: 'location', blockName: 'location', blockType: 'text', label: 'Ubicación / ciudad', required: false, width: 50 },
    { name: 'available-space', blockName: 'available-space', blockType: 'text', label: 'Espacio disponible aprox.', required: false, width: 100 },
    { name: 'message', blockName: 'message', blockType: 'textarea', label: 'Mensaje / notas', required: false, width: 100 },
  ],
  redirect: undefined,
  submitButtonLabel: 'Enviar solicitud de partnership',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
