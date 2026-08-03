import { describe, expect, it } from 'vitest'
import { stripFormIntegrationFields } from '@/utilities/stripFormIntegrationFields'

// This is the belt to the field-level access braces. A Header/Footer global
// read at depth 1 arrives with a modal CTA's whole Form document populated, and
// that object is handed to a client component — so it lands in the RSC payload
// of every page. #199 found all three board ids in the HTML of the live home
// page. This strips them at the server→client boundary rather than depending on
// exactly when Payload evaluates field access through a populated relationship.
describe('stripFormIntegrationFields', () => {
  it('removes the Monday wiring from a populated form', () => {
    const global = {
      contactCtaForm: {
        id: 9,
        title: 'Design Your Kiosk',
        integrationTarget: 'monday',
        externalId: '4024508641',
        mondayGroupId: 'topics',
      },
    }

    expect(stripFormIntegrationFields(global)).toEqual({
      contactCtaForm: { id: 9, title: 'Design Your Kiosk' },
    })
  })

  // The per-field column mapping is the part that describes the client's CRM
  // layout, and it lives one level deeper, inside an array.
  it('reaches the per-field externalId inside arrays', () => {
    const form = {
      fields: [
        { name: 'email', label: 'Email', externalId: 'email' },
        { name: 'phone', label: 'Phone', externalId: 'phone' },
      ],
    }

    expect(stripFormIntegrationFields(form)).toEqual({
      fields: [
        { name: 'email', label: 'Email' },
        { name: 'phone', label: 'Phone' },
      ],
    })
  })

  it('strips at any depth', () => {
    const nested = { a: { b: { c: [{ externalId: 'x', keep: 1 }] } } }
    expect(stripFormIntegrationFields(nested)).toEqual({ a: { b: { c: [{ keep: 1 }] } } })
  })

  // Everything the drawer and FormBlock actually read has to survive, or the
  // fix would trade a leak for a broken form.
  it('leaves the fields the render needs alone', () => {
    const form = {
      title: 'Contact',
      displayTitle: 'Contáctanos',
      fields: [{ name: 'email', label: 'Email', required: true }],
      confirmationType: 'message',
      requiresConsent: true,
      consentText: { root: { children: [] } },
      submitButtonLabel: 'Enviar',
    }

    expect(stripFormIntegrationFields(form)).toEqual(form)
  })

  it('passes primitives and null through untouched', () => {
    expect(stripFormIntegrationFields('a string')).toBe('a string')
    expect(stripFormIntegrationFields(42)).toBe(42)
    expect(stripFormIntegrationFields(null)).toBeNull()
    expect(stripFormIntegrationFields(undefined)).toBeUndefined()
    expect(stripFormIntegrationFields(false)).toBe(false)
  })

  it('handles empty objects and arrays', () => {
    expect(stripFormIntegrationFields({})).toEqual({})
    expect(stripFormIntegrationFields([])).toEqual([])
  })

  // A copy, not a mutation: the input is a cached global, and editing it in
  // place would poison the cache entry for every later request.
  it('does not mutate its input', () => {
    const original = { externalId: '4024508641', title: 'Keep' }
    const result = stripFormIntegrationFields(original)

    expect(original.externalId).toBe('4024508641')
    expect(result).not.toBe(original)
  })
})
