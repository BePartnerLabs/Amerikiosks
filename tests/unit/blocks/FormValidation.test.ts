import { describe, expect, it } from 'vitest'
import {
  isPhoneField,
  MAX_TEXT_LENGTH,
  MAX_TEXTAREA_LENGTH,
  normalizePhone,
  validateSubmission,
  validateValue,
} from '@/blocks/Form/validation'

describe('isPhoneField', () => {
  it.each(['phone', 'telefono', 'teléfono', 'movil', 'móvil', 'mobile', 'whatsapp'])(
    'matches %s in the field name',
    (word) => {
      expect(isPhoneField(word)).toBe(true)
    },
  )

  it('matches on the label when the name is opaque', () => {
    expect(isPhoneField('field_3', 'Your Phone')).toBe(true)
  })

  it('does not match an unrelated field', () => {
    expect(isPhoneField('company', 'Company name')).toBe(false)
  })
})

describe('normalizePhone', () => {
  it('strips everything a human might type', () => {
    expect(normalizePhone('(305) 555-0100')).toBe('3055550100')
  })

  it('keeps a leading + for international numbers', () => {
    expect(normalizePhone('+1 305 555 0100')).toBe('+13055550100')
  })

  it('collapses stray + signs that are not the first character', () => {
    expect(normalizePhone('+1+305+5550100')).toBe('+13055550100')
  })
})

describe('validateValue', () => {
  it('flags a required field left empty', () => {
    expect(validateValue({ blockType: 'text', name: 'a', required: true }, '')).toBe('required')
  })

  it('treats an unticked checkbox as empty for a required field', () => {
    expect(validateValue({ blockType: 'checkbox', name: 'consent', required: true }, false)).toBe(
      'required',
    )
  })

  it('passes an optional field left empty without further checks', () => {
    expect(validateValue({ blockType: 'email', name: 'e' }, '')).toBeNull()
  })

  it.each([
    ['ada@example.com', null],
    ['ada@example.co', null],
    ['not-an-email', 'email'],
    ['ada@example', 'email'],
    ['ada @example.com', 'email'],
  ])('validates the email %s', (value, expected) => {
    expect(validateValue({ blockType: 'email', name: 'e' }, value)).toBe(expected)
  })

  it('rejects a non-numeric value in a number field', () => {
    expect(validateValue({ blockType: 'number', name: 'n' }, 'twelve')).toBe('number')
  })

  it('accepts a numeric string in a number field', () => {
    expect(validateValue({ blockType: 'number', name: 'n' }, '12')).toBeNull()
  })

  it('applies the phone pattern to a text field that looks like a phone', () => {
    const spec = { blockType: 'text', name: 'phone' }
    expect(validateValue(spec, '+1 (305) 555-0100')).toBeNull()
    expect(validateValue(spec, 'call me')).toBe('phone')
  })

  it('caps a plain text field at MAX_TEXT_LENGTH', () => {
    const spec = { blockType: 'text', name: 'company' }
    expect(validateValue(spec, 'x'.repeat(MAX_TEXT_LENGTH))).toBeNull()
    expect(validateValue(spec, 'x'.repeat(MAX_TEXT_LENGTH + 1))).toBe('maxLength')
  })

  it('caps a textarea at the larger MAX_TEXTAREA_LENGTH', () => {
    const spec = { blockType: 'textarea', name: 'message' }
    expect(validateValue(spec, 'x'.repeat(MAX_TEXTAREA_LENGTH))).toBeNull()
    expect(validateValue(spec, 'x'.repeat(MAX_TEXTAREA_LENGTH + 1))).toBe('maxLength')
  })

  it('lets an unknown block type through rather than blocking the submission', () => {
    expect(validateValue({ blockType: 'select', name: 's' }, 'anything')).toBeNull()
  })
})

describe('validateSubmission', () => {
  const fields = [
    { blockType: 'text', name: 'name', required: true },
    { blockType: 'email', name: 'email', required: true },
    { blockType: 'textarea', name: 'message' },
  ]

  it('returns no issues for a complete, valid submission', () => {
    const issues = validateSubmission(fields, [
      { field: 'name', value: 'Ada' },
      { field: 'email', value: 'ada@example.com' },
    ])
    expect(issues).toEqual([])
  })

  it('catches a required field that was omitted entirely', () => {
    // The per-entry loop can't see this one — it never appears in the payload.
    const issues = validateSubmission(fields, [{ field: 'name', value: 'Ada' }])
    expect(issues).toContainEqual({ field: 'email', code: 'required' })
  })

  it('rejects a field the form never declared, so a script cannot invent columns', () => {
    const issues = validateSubmission(fields, [
      { field: 'name', value: 'Ada' },
      { field: 'email', value: 'ada@example.com' },
      { field: 'isAdmin', value: true },
    ])
    expect(issues).toEqual([{ field: 'isAdmin', code: 'unknownField' }])
  })

  it('reports every problem at once rather than stopping at the first', () => {
    const issues = validateSubmission(fields, [
      { field: 'name', value: '' },
      { field: 'email', value: 'nope' },
    ])
    expect(issues).toHaveLength(2)
  })
})
