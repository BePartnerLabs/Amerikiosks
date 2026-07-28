/**
 * Field validation rules, shared by the client form and the submission route.
 *
 * Both sides import from here on purpose: `react-hook-form` uses these to stop
 * a bad value before it leaves the browser, and
 * `/next/form-submissions/route.ts` re-checks the exact same rules server-side,
 * because the client checks are a courtesy and the endpoint is public. Keeping
 * one source means a rule can never tighten on one side only.
 */

// Requires a dot-something TLD — the previous inline pattern in Email/index.tsx
// (/^\S[^\s@]*@\S+$/) accepted "a@b", which reaches Monday as an unusable lead.
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const MAX_TEXT_LENGTH = 200
export const MAX_TEXTAREA_LENGTH = 5000

// Monday's phone column rejected formatted numbers once already (commit
// ffd890a). Normalizing at the edge keeps that failure from coming back
// through the generic form path.
export const PHONE_PATTERN = /^\+?[\d\s().-]{7,25}$/

/** Heuristic — the form builder has no dedicated phone block type. */
export function isPhoneField(name?: string, label?: string): boolean {
  const haystack = `${name ?? ''} ${label ?? ''}`.toLowerCase()
  return /phone|tel[eé]fono|movil|móvil|mobile|whatsapp/.test(haystack)
}

/** Strips everything a human might type so only `+` and digits reach Monday. */
export function normalizePhone(value: string): string {
  const digits = value.replace(/[^\d+]/g, '')
  return digits.startsWith('+') ? `+${digits.slice(1).replace(/\+/g, '')}` : digits
}

export type FieldSpec = {
  blockType?: string
  name?: string
  label?: string
  required?: boolean
}

export type ValidationCode =
  | 'required'
  | 'email'
  | 'number'
  | 'phone'
  | 'maxLength'
  | 'unknownField'

export type ValidationIssue = { field: string; code: ValidationCode }

/**
 * The single rule engine. Returns a code rather than a message so the client
 * can translate it and the server can log it without carrying a locale.
 */
export function validateValue(field: FieldSpec, value: unknown): ValidationCode | null {
  const isEmpty = value === undefined || value === null || value === '' || value === false

  if (field.required && isEmpty) return 'required'
  if (isEmpty) return null

  const str = typeof value === 'string' ? value : String(value)

  switch (field.blockType) {
    case 'email':
      return EMAIL_PATTERN.test(str) ? null : 'email'
    case 'number':
      return Number.isFinite(Number(str)) ? null : 'number'
    case 'textarea':
      return str.length > MAX_TEXTAREA_LENGTH ? 'maxLength' : null
    case 'text':
      if (isPhoneField(field.name, field.label)) {
        return PHONE_PATTERN.test(str) ? null : 'phone'
      }
      return str.length > MAX_TEXT_LENGTH ? 'maxLength' : null
    default:
      return null
  }
}

/**
 * Server-side pass over a whole submission. Also rejects fields the form
 * doesn't declare — a scripted POST shouldn't be able to invent columns.
 */
export function validateSubmission(
  fields: FieldSpec[],
  submissionData: { field: string; value: unknown }[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const byName = new Map(fields.filter((f) => f.name).map((f) => [f.name as string, f]))
  const submitted = new Map(submissionData.map((entry) => [entry.field, entry.value]))

  for (const entry of submissionData) {
    const spec = byName.get(entry.field)
    if (!spec) {
      issues.push({ field: entry.field, code: 'unknownField' })
      continue
    }
    const code = validateValue(spec, entry.value)
    if (code) issues.push({ field: entry.field, code })
  }

  // A required field that was simply omitted never appears in submissionData,
  // so the loop above can't catch it.
  for (const [name, spec] of byName) {
    if (spec.required && !submitted.has(name)) {
      issues.push({ field: name, code: 'required' })
    }
  }

  return issues
}

/** `react-hook-form` rules for a given field, derived from the same engine. */
export function registerOptions(field: FieldSpec) {
  return {
    required: Boolean(field.required),
    validate: (value: unknown) => {
      const code = validateValue(field, value)
      // Returning the code as the "message" lets FormError translate it via
      // the form.errors.* namespace; `true` means valid.
      return code ? code : true
    },
  }
}
