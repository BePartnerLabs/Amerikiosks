import type { RequiredDataFromCollectionSlug } from 'payload'

export const emergingBrandForm: RequiredDataFromCollectionSlug<'forms'> = {
  title: 'Emerging Brand Form',
  confirmationType: 'message',
  confirmationMessage: {
    root: {
      type: 'root',
      children: [
        {
          type: 'heading',
          children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: "¡Gracias! Revisaremos tu aplicación pronto.", version: 1 }],
          direction: 'ltr', format: '', indent: 0, tag: 'h2', version: 1,
        },
      ],
      direction: 'ltr', format: '', indent: 0, version: 1,
    },
  },
  emails: [
    {
      emailFrom: '"Amerikiosks" <noreply@amerikiosks.com>',
      emailTo: 'founders@amerikiosks.com',
      subject: 'New Founder Program Application',
      message: {
        root: {
          type: 'root',
          children: [{ type: 'paragraph', children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'A new founder program application has been submitted.', version: 1 }], direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1 }],
          direction: 'ltr', format: '', indent: 0, version: 1,
        },
      },
    },
  ],
  fields: [
    { name: 'brand-name', blockName: 'brand-name', blockType: 'text', label: 'Nombre de la marca', required: true, width: 50 },
    { name: 'work-email', blockName: 'work-email', blockType: 'email', label: 'Email de trabajo', required: true, width: 50 },
    { name: 'product-category', blockName: 'product-category', blockType: 'text', label: 'Categoría de producto (ej. snacks, accesorios, skincare…)', required: true, width: 50 },
    { name: 'brand-stage', blockName: 'brand-stage', blockType: 'text', label: 'Etapa de la marca (pre-revenue, post-revenue, Series A+)', required: true, width: 50 },
    { name: 'monthly-units', blockName: 'monthly-units', blockType: 'text', label: 'Unidades vendidas por mes aproximadas', required: false, width: 50 },
    { name: 'current-channels', blockName: 'current-channels', blockType: 'text', label: 'Canales de distribución actuales (D2C, retail, marketplace…)', required: false, width: 50 },
    { name: 'target-venues', blockName: 'target-venues', blockType: 'text', label: 'Tipo de venue objetivo (aeropuerto, hotel, gym, etc.)', required: false, width: 50 },
    { name: 'launch-timeline', blockName: 'launch-timeline', blockType: 'text', label: '¿Cuándo quisieras lanzar tu primer piloto?', required: false, width: 50 },
    { name: 'model-interest', blockName: 'model-interest', blockType: 'text', label: 'Modelo de interés (consignación / full-service / servicios)', required: false, width: 100 },
    { name: 'message', blockName: 'message', blockType: 'textarea', label: 'Cuéntanos sobre tu marca y tus objetivos de distribución', required: false, width: 100 },
  ],
  redirect: undefined,
  submitButtonLabel: 'Aplicar al programa founder',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

