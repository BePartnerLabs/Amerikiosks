import type { RequiredDataFromCollectionSlug } from 'payload'
import { buildConfirmationMessage, buildFormFields, type FormFieldDef } from './translateForm'

export const agencyActivationFormFieldDefs: FormFieldDef[] = [
  {
    name: 'agency-name',
    blockType: 'text',
    label: 'Agency name',
    labelEs: 'Nombre de la agencia',
    required: true,
    width: 50,
  },
  {
    name: 'work-email',
    blockType: 'email',
    label: 'Work email',
    labelEs: 'Email de trabajo',
    required: true,
    width: 50,
  },
  {
    name: 'client-brand',
    blockType: 'text',
    label: 'Client / campaign brand',
    labelEs: 'Cliente / marca de la campaña',
    required: true,
    width: 50,
  },
  {
    name: 'campaign-objective',
    blockType: 'text',
    label: 'Campaign objective (awareness, conversion, experiential…)',
    labelEs: 'Objetivo de la campaña (awareness, conversión, experiencial…)',
    width: 50,
  },
  {
    name: 'target-venues',
    blockType: 'text',
    label: 'Target venues (city, type of space)',
    labelEs: 'Venues objetivo (ciudad, tipo de espacio)',
    width: 50,
  },
  {
    name: 'number-of-venues',
    blockType: 'text',
    label: 'Estimated number of venues',
    labelEs: 'Número de venues estimados',
    width: 50,
  },
  {
    name: 'campaign-timeline',
    blockType: 'text',
    label: 'Estimated campaign start',
    labelEs: 'Inicio estimado de la campaña',
    width: 50,
  },
  {
    name: 'campaign-duration',
    blockType: 'text',
    label: 'Activation duration (weeks / months)',
    labelEs: 'Duración de la activación (semanas / meses)',
    width: 50,
  },
  {
    name: 'budget-range',
    blockType: 'text',
    label: 'Budget range (e.g. $5k–$20k USD)',
    labelEs: 'Rango de presupuesto (ej. $5k–$20k USD)',
    width: 100,
  },
  {
    name: 'message',
    blockType: 'textarea',
    label: 'Brief / additional notes',
    labelEs: 'Brief / notas adicionales',
    width: 100,
  },
]

export const agencyActivationFormSubmitButtonLabelEs = 'Cotizar activación'

export const agencyActivationFormConfirmationMessageEs = buildConfirmationMessage(
  '¡Gracias! Nos pondremos en contacto pronto.',
)

export const agencyActivationForm: RequiredDataFromCollectionSlug<'forms'> = {
  title: 'Agency Activation Form',
  confirmationType: 'message',
  confirmationMessage: buildConfirmationMessage("Thank you! We'll be in touch shortly."),
  emails: [
    {
      emailFrom: '"Amerikiosks" <noreply@amerikiosks.com>',
      emailTo: 'agencies@amerikiosks.com',
      subject: 'New Agency Activation Request',
      message: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'A new agency activation request has been submitted.',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              textFormat: 0,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
    },
  ],
  fields: buildFormFields(agencyActivationFormFieldDefs),
  redirect: undefined,
  submitButtonLabel: 'Get a Quote',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
