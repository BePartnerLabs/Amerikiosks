import type { RequiredDataFromCollectionSlug } from 'payload'
import { buildConfirmationMessage, buildFormFields, type FormFieldDef } from './translateForm'

export const venueProgramFormFieldDefs: FormFieldDef[] = [
  {
    name: 'venue-name',
    blockType: 'text',
    label: 'Venue name',
    labelEs: 'Nombre del venue',
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
    name: 'venue-type',
    blockType: 'text',
    label: 'Venue type (hotel, airport, mall, stadium, hospital…)',
    labelEs: 'Tipo de venue (hotel, aeropuerto, mall, estadio, hospital…)',
    required: true,
    width: 50,
  },
  {
    name: 'location',
    blockType: 'text',
    label: 'City / country',
    labelEs: 'Ciudad / país',
    required: true,
    width: 50,
  },
  {
    name: 'monthly-footfall',
    blockType: 'text',
    label: 'Estimated monthly foot traffic',
    labelEs: 'Tráfico mensual estimado de visitantes',
    width: 50,
  },
  {
    name: 'available-locations',
    blockType: 'text',
    label: 'Number of available locations within the venue',
    labelEs: 'Número de ubicaciones disponibles dentro del venue',
    width: 50,
  },
  {
    name: 'available-space',
    blockType: 'text',
    label: 'Approximate dimensions of the available space',
    labelEs: 'Dimensiones aproximadas del espacio disponible',
    width: 50,
  },
  {
    name: 'current-revenue-model',
    blockType: 'text',
    label: 'Current revenue model (concession, fixed rent, none yet)',
    labelEs: 'Modelo de ingresos actual (concesión, renta fija, sin modelo definido)',
    width: 50,
  },
  {
    name: 'message',
    blockType: 'textarea',
    label: 'Additional notes',
    labelEs: 'Notas adicionales',
    width: 100,
  },
]

export const venueProgramFormSubmitButtonLabelEs = 'Enviar solicitud de partnership'

export const venueProgramFormConfirmationMessageEs = buildConfirmationMessage(
  '¡Gracias! Nos pondremos en contacto pronto.',
)

export const venueProgramForm: RequiredDataFromCollectionSlug<'forms'> = {
  title: 'Venue Program Form',
  confirmationType: 'message',
  confirmationMessage: buildConfirmationMessage("Thank you! We'll be in touch shortly."),
  emails: [
    {
      emailFrom: '"Amerikiosks" <noreply@amerikiosks.com>',
      emailTo: 'venues@amerikiosks.com',
      subject: 'New Venue Partnership Request',
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
                  text: 'A new venue partnership request has been submitted.',
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
  fields: buildFormFields(venueProgramFormFieldDefs),
  redirect: undefined,
  submitButtonLabel: 'Submit Partnership Request',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
