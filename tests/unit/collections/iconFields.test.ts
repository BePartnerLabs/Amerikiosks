import { describe, expect, it } from 'vitest'
import { iconPaths } from '@/components/Icon/icons'

type Field = {
  name?: string
  type?: string
  admin?: { components?: { Field?: string } }
  fields?: Field[]
  blocks?: Field[]
  tabs?: Field[]
}

const PICKER = '@/components/MaterialIconPicker#MaterialIconPicker'

function collectIconFields(fields: Field[] = [], out: Field[] = []): Field[] {
  for (const field of fields) {
    if (field.name === 'icon' && field.type === 'text') out.push(field)
    collectIconFields(
      [...(field.fields ?? []), ...(field.blocks ?? []), ...(field.tabs ?? [])],
      out,
    )
  }
  return out
}

// `Icon` returns null for a name it does not know, so a typo is invisible: no
// icon, no error, no clue. Three of the four icon fields were plain text
// inputs with the name to be typed from memory — including two on machines and
// families that nobody had used yet, which is why it had not bitten.
describe('icon fields all use the picker', () => {
  it.each([
    ['CardGrid block', () => import('@/blocks/CardGrid/config').then((m) => m.CardGrid)],
    ['Machines collection', () => import('@/collections/Machines').then((m) => m.Machines)],
    [
      'MachineFamilies collection',
      () => import('@/collections/MachineFamilies').then((m) => m.MachineFamilies),
    ],
    ['Header global', () => import('@/Header/config').then((m) => m.Header)],
  ])('%s', async (_name, load) => {
    const config = (await load()) as { fields?: Field[] }
    const iconFields = collectIconFields(config.fields)

    expect(iconFields.length).toBeGreaterThan(0)
    for (const field of iconFields) {
      expect(field.admin?.components?.Field).toBe(PICKER)
    }
  })
})

describe('the icon set the picker offers', () => {
  it('is not empty and every entry has a path', () => {
    const entries = Object.entries(iconPaths)
    expect(entries.length).toBeGreaterThan(0)
    for (const [name, path] of entries) {
      expect(path, `${name} has no path`).toBeTruthy()
      expect(typeof path).toBe('string')
    }
  })

  // Icon renders `<path d>` inside a fixed viewBox, so a path copied from a
  // differently-sized SVG would draw off-canvas rather than fail loudly.
  it('holds single path data, not markup', () => {
    for (const [name, path] of Object.entries(iconPaths)) {
      expect(path, `${name} looks like markup`).not.toContain('<')
      expect(path, `${name} is not path data`).toMatch(/^[Mm]/)
    }
  })
})
