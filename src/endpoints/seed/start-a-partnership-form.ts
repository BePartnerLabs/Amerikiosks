import type { Payload, PayloadRequest, RequiredDataFromCollectionSlug } from 'payload'
import {
  buildConfirmationMessage,
  buildFormFields,
  type FormFieldDef,
  findOrCreateForm,
  translateFormEs,
} from './translateForm'

export const startAPartnershipFormFieldDefs: FormFieldDef[] = [
  {
    name: 'full-name',
    blockType: 'text',
    label: 'Full name',
    labelEs: 'Nombre completo',
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
    name: 'company',
    blockType: 'text',
    label: 'Company',
    labelEs: 'Empresa',
    required: true,
    width: 50,
  },
  {
    name: 'phone',
    blockType: 'text',
    label: 'Phone',
    labelEs: 'Teléfono',
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

export const startAPartnershipFormSubmitButtonLabelEs = 'Iniciar un Partnership'

export const startAPartnershipFormConfirmationMessageEs = buildConfirmationMessage(
  '¡Gracias! Nos pondremos en contacto pronto.',
)

export const startAPartnershipForm: RequiredDataFromCollectionSlug<'forms'> = {
  title: 'Start a Partnership Form',
  confirmationType: 'message',
  confirmationMessage: buildConfirmationMessage("Thank you! We'll be in touch shortly."),
  emails: [
    {
      emailFrom: '"Amerikiosks" <noreply@amerikiosks.com>',
      emailTo: 'partnerships@amerikiosks.com',
      subject: 'New Partnership Inquiry',
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
                  text: 'A new partnership inquiry has been submitted from the site header.',
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
  fields: buildFormFields(startAPartnershipFormFieldDefs),
  redirect: undefined,
  submitButtonLabel: 'Start a Partnership',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

/** Idempotent by title — safe to call from multiple seed parts (header, home). */
export const ensureStartAPartnershipForm = async (
  payload: Payload,
  req: PayloadRequest,
): Promise<number> => {
  const { id, fields } = await findOrCreateForm(payload, req, startAPartnershipForm)

  await translateFormEs(
    payload,
    req,
    id,
    fields,
    startAPartnershipFormFieldDefs,
    startAPartnershipFormSubmitButtonLabelEs,
    startAPartnershipFormConfirmationMessageEs,
  )

  return id
}
