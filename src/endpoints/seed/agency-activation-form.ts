import type { RequiredDataFromCollectionSlug } from 'payload'

export const agencyActivationForm: RequiredDataFromCollectionSlug<'forms'> = {
  title: 'Agency Activation Form',
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
      emailTo: 'agencies@amerikiosks.com',
      subject: 'New Agency Activation Request',
      message: {
        root: {
          type: 'root',
          children: [{ type: 'paragraph', children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'A new agency activation request has been submitted.', version: 1 }], direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1 }],
          direction: 'ltr', format: '', indent: 0, version: 1,
        },
      },
    },
  ],
  fields: [
    { name: 'agency-name', blockName: 'agency-name', blockType: 'text', label: 'Nombre de la agencia', required: true, width: 50 },
    { name: 'work-email', blockName: 'work-email', blockType: 'email', label: 'Email de trabajo', required: true, width: 50 },
    { name: 'client-brand', blockName: 'client-brand', blockType: 'text', label: 'Cliente / marca de la campaña', required: false, width: 50 },
    { name: 'target-venues', blockName: 'target-venues', blockType: 'text', label: 'Venues objetivo', required: false, width: 50 },
    { name: 'campaign-timeline', blockName: 'campaign-timeline', blockType: 'text', label: 'Timeline de la campaña', required: false, width: 100 },
    { name: 'message', blockName: 'message', blockType: 'textarea', label: 'Mensaje / notas', required: false, width: 100 },
  ],
  redirect: undefined,
  submitButtonLabel: 'Cotizar activación',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
