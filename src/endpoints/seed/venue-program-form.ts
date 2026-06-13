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
    { name: 'venue-type', blockName: 'venue-type', blockType: 'text', label: 'Tipo de venue (hotel, aeropuerto, mall, estadio, hospital…)', required: true, width: 50 },
    { name: 'location', blockName: 'location', blockType: 'text', label: 'Ciudad / país', required: true, width: 50 },
    { name: 'monthly-footfall', blockName: 'monthly-footfall', blockType: 'text', label: 'Tráfico mensual estimado de visitantes', required: false, width: 50 },
    { name: 'available-locations', blockName: 'available-locations', blockType: 'text', label: 'Número de ubicaciones disponibles dentro del venue', required: false, width: 50 },
    { name: 'available-space', blockName: 'available-space', blockType: 'text', label: 'Dimensiones aproximadas del espacio disponible', required: false, width: 50 },
    { name: 'current-revenue-model', blockName: 'current-revenue-model', blockType: 'text', label: 'Modelo de ingresos actual (concesión, renta fija, sin modelo definido)', required: false, width: 50 },
    { name: 'message', blockName: 'message', blockType: 'textarea', label: 'Notas adicionales', required: false, width: 100 },
  ],
  redirect: undefined,
  submitButtonLabel: 'Enviar solicitud de partnership',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
