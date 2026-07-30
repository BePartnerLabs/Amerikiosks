import { describe, expect, it } from 'vitest'
import { jsonLdString } from '@/utilities/jsonLdString'

describe('jsonLdString', () => {
  it('escapes < so editor content cannot close the script tag', () => {
    expect(jsonLdString({ a: '</script><svg onload=x>' })).not.toContain('</script>')
    expect(jsonLdString({ a: '</script>' })).toContain('\\u003c/script>')
  })
})
