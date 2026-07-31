import { beforeAll, describe, expect, it } from 'vitest'

// Building the real config needs a secret; the DB adapter is instantiated but
// never connected, so no database is required.
process.env.PAYLOAD_SECRET ||= 'test-secret'

type FieldLike = {
  name?: string
  type?: string
  access?: { read?: (args: { req: { user?: unknown } }) => unknown }
  blocks?: FieldLike[]
  fields?: FieldLike[]
}

let formsFields: FieldLike[]

beforeAll(async () => {
  const config = await (await import('@payload-config')).default
  const forms = config.collections.find((c: { slug: string }) => c.slug === 'forms')
  if (!forms) throw new Error('forms collection missing from the built config')
  formsFields = forms.fields as FieldLike[]
}, 120_000)

function findField(fields: FieldLike[], name: string): FieldLike | undefined {
  for (const field of fields) {
    if (field.name === name) return field
    const nested = [...(field.fields ?? []), ...(field.blocks ?? [])]
    const hit = nested.length ? findField(nested, name) : undefined
    if (hit) return hit
  }
  return undefined
}

// Walks the *built* config rather than testing the helper in isolation. The
// previous version asserted that `Boolean(req.user)` returns a boolean — a
// tautology that stayed green even if every `access:` line were deleted, which
// is the only failure that matters here.
describe('forms integration fields are gated on the built config', () => {
  it.each(['integrationTarget', 'externalId', 'mondayGroupId'])(
    'gates %s at field level',
    (name) => {
      const field = findField(formsFields, name)
      expect(field, `${name} not found on the forms collection`).toBeDefined()
      expect(typeof field?.access?.read).toBe('function')
      expect(field?.access?.read?.({ req: { user: undefined } })).toBe(false)
      expect(field?.access?.read?.({ req: { user: { id: 1 } } })).toBe(true)
    },
  )

  // The per-field Monday column mapping, added to every field block. This is
  // the one that describes which answer lands in which CRM column.
  it('gates externalId on every field block that carries one', () => {
    const fieldsField = formsFields.find((f) => f.name === 'fields')
    const blocks = (fieldsField?.blocks ?? []) as FieldLike[]
    expect(blocks.length).toBeGreaterThan(0)

    const withExternalId = blocks.filter((b) =>
      (b.fields ?? []).some((f) => f.name === 'externalId'),
    )
    expect(withExternalId.length).toBeGreaterThan(0)

    for (const block of withExternalId) {
      const field = (block.fields ?? []).find((f) => f.name === 'externalId')
      expect(typeof field?.access?.read, `block missing gate`).toBe('function')
      expect(field?.access?.read?.({ req: { user: undefined } })).toBe(false)
    }
  })
})
