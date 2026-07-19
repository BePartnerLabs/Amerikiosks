import type { RequiredDataFromCollectionSlug } from 'payload'
import { buildConfirmationMessage, buildFormFields, type FormFieldDef } from './translateForm'

export const emergingBrandFormFieldDefs: FormFieldDef[] = [
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
    label: 'Product category (e.g. snacks, accessories, skincare…)',
    labelEs: 'Categoría de producto (ej. snacks, accesorios, skincare…)',
    required: true,
    width: 50,
  },
  {
    name: 'brand-stage',
    blockType: 'text',
    label: 'Brand stage (pre-revenue, post-revenue, Series A+)',
    labelEs: 'Etapa de la marca (pre-revenue, post-revenue, Series A+)',
    required: true,
    width: 50,
  },
  {
    name: 'monthly-units',
    blockType: 'text',
    label: 'Approximate monthly units sold',
    labelEs: 'Unidades vendidas por mes aproximadas',
    width: 50,
  },
  {
    name: 'current-channels',
    blockType: 'text',
    label: 'Current distribution channels (D2C, retail, marketplace…)',
    labelEs: 'Canales de distribución actuales (D2C, retail, marketplace…)',
    width: 50,
  },
  {
    name: 'target-venues',
    blockType: 'text',
    label: 'Target venue type (airport, hotel, gym, etc.)',
    labelEs: 'Tipo de venue objetivo (aeropuerto, hotel, gym, etc.)',
    width: 50,
  },
  {
    name: 'launch-timeline',
    blockType: 'text',
    label: 'When would you like to launch your first pilot?',
    labelEs: '¿Cuándo quisieras lanzar tu primer piloto?',
    width: 50,
  },
  {
    name: 'model-interest',
    blockType: 'text',
    label: 'Model of interest (consignment / full-service / services)',
    labelEs: 'Modelo de interés (consignación / full-service / servicios)',
    width: 100,
  },
  {
    name: 'message',
    blockType: 'textarea',
    label: 'Tell us about your brand and distribution goals',
    labelEs: 'Cuéntanos sobre tu marca y tus objetivos de distribución',
    width: 100,
  },
]

export const emergingBrandFormSubmitButtonLabelEs = 'Aplicar al programa founder'

export const emergingBrandFormConfirmationMessageEs = buildConfirmationMessage(
  '¡Gracias! Revisaremos tu aplicación pronto.',
)

export const emergingBrandForm: RequiredDataFromCollectionSlug<'forms'> = {
  title: 'Emerging Brand Form',
  confirmationType: 'message',
  confirmationMessage: buildConfirmationMessage("Thank you! We'll review your application soon."),
  emails: [
    {
      emailFrom: '"Amerikiosks" <noreply@amerikiosks.com>',
      emailTo: 'founders@amerikiosks.com',
      subject: 'New Founder Program Application',
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
                  text: 'A new founder program application has been submitted.',
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
  fields: buildFormFields(emergingBrandFormFieldDefs),
  redirect: undefined,
  submitButtonLabel: 'Apply to Founder Program',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
