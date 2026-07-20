import type { Payload, PayloadRequest, RequiredDataFromCollectionSlug } from 'payload'

/** A form field definition with its ES label co-located, matching the
 *  `question`/`questionEs` sibling-property convention used for FAQs,
 *  machines, etc. elsewhere in this seed (see src/endpoints/seed/CLAUDE.md). */
export type FormFieldDef = {
  name: string
  blockType: 'text' | 'email' | 'textarea'
  label: string
  labelEs: string
  required?: boolean
  width?: number
}

export const buildFormFields = (
  defs: FormFieldDef[],
): RequiredDataFromCollectionSlug<'forms'>['fields'] =>
  defs.map(({ name, blockType, label, required, width }) => ({
    name,
    blockName: name,
    blockType,
    label,
    required: required ?? false,
    width,
  }))

const confirmationMessage = (text: string) => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'heading',
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text,
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        tag: 'h2',
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

export const buildConfirmationMessage = confirmationMessage

/** Resolves a form's id + current `fields` (with row ids) whether it already exists or not. */
export const findOrCreateForm = async (
  payload: Payload,
  req: PayloadRequest,
  formData: RequiredDataFromCollectionSlug<'forms'>,
): Promise<{
  id: number
  fields: RequiredDataFromCollectionSlug<'forms'>['fields']
}> => {
  const existing = await payload.find({
    collection: 'forms',
    where: { title: { equals: formData.title } },
    limit: 1,
    req,
  })

  if (existing.totalDocs > 0) {
    const doc = existing.docs[0]
    payload.logger.info(`  ${formData.title} exists, skipping creation`)
    return { id: doc?.id as number, fields: doc?.fields ?? [] }
  }

  const created = await payload.create({ collection: 'forms', data: formData, req })
  payload.logger.info(`  Created form: ${formData.title}`)
  return { id: created.id as number, fields: created.fields ?? [] }
}

/**
 * Translates a form's localized fields (submitButtonLabel, confirmationMessage,
 * per-field labels) into the `es` locale.
 *
 * `fields` (the blocks array) is NOT itself a localized field — only `label`
 * inside each block is. Passing back the exact same rows (with their `id`s)
 * and swapping just `label` keeps the update in-place instead of duplicating
 * rows, same footgun as the `cardGrid`/`audienceShowcase` items arrays
 * documented in src/endpoints/seed/CLAUDE.md.
 */
export const translateFormEs = async (
  payload: Payload,
  req: PayloadRequest,
  formId: number,
  enFields: RequiredDataFromCollectionSlug<'forms'>['fields'],
  fieldDefs: FormFieldDef[],
  submitButtonLabelEs: string,
  confirmationMessageEs: RequiredDataFromCollectionSlug<'forms'>['confirmationMessage'],
): Promise<void> => {
  const esLabelByName = new Map(fieldDefs.map((f) => [f.name, f.labelEs]))

  const fieldsEs = (enFields ?? []).map((field) => {
    const name = 'name' in field ? field.name : undefined
    const labelEs = name ? esLabelByName.get(name) : undefined
    return labelEs ? { ...field, label: labelEs } : field
  })

  await payload.update({
    collection: 'forms',
    id: formId,
    locale: 'es',
    data: {
      submitButtonLabel: submitButtonLabelEs,
      confirmationMessage: confirmationMessageEs,
      fields: fieldsEs,
    },
    req: { ...req, locale: 'es' } as PayloadRequest,
  })
}
