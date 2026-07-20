import type { RequiredDataFromCollectionSlug } from 'payload'
import { buildConfirmationMessage, buildFormFields, type FormFieldDef } from './translateForm'

export const brandProgramFormFieldDefs: FormFieldDef[] = [
  {
    name: 'brand-name',
    blockType: 'text',
    label: 'Brand name',
    labelEs: 'Nombre de la marca',
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
    name: 'product-category',
    blockType: 'text',
    label: 'Product category',
    labelEs: 'Categoría de producto',
    width: 50,
  },
  {
    name: 'target-venues',
    blockType: 'text',
    label: 'Target venues',
    labelEs: 'Venues objetivo',
    width: 50,
  },
  {
    name: 'desired-timeline',
    blockType: 'text',
    label: 'Desired timeline',
    labelEs: 'Cronograma deseado',
    width: 50,
  },
  {
    name: 'placement-goal',
    blockType: 'text',
    label: 'Placement goal',
    labelEs: 'Objetivo de colocación',
    width: 50,
  },
  {
    name: 'message',
    blockType: 'textarea',
    label: 'Message / notes',
    labelEs: 'Mensaje / notas',
    width: 100,
  },
]

export const brandProgramFormSubmitButtonLabelEs = 'Enviar solicitud de programa de marca'

export const brandProgramFormConfirmationMessageEs = buildConfirmationMessage(
  '¡Gracias! Nos pondremos en contacto pronto.',
)

export const brandProgramForm: RequiredDataFromCollectionSlug<'forms'> = {
  title: 'Brand Program Form',
  confirmationType: 'message',
  confirmationMessage: buildConfirmationMessage("Thank you! We'll be in touch shortly."),
  emails: [
    {
      emailFrom: '"Amerikiosks" <noreply@amerikiosks.com>',
      emailTo: 'brands@amerikiosks.com',
      subject: 'New Brand Program Request',
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
                  text: 'A new brand program request has been submitted.',
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
  fields: buildFormFields(brandProgramFormFieldDefs),
  redirect: undefined,
  submitButtonLabel: 'Submit Brand Program Request',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
