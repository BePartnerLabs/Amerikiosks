import { describe, expect, it } from 'vitest'
import { reservedSlug } from '@/collections/Pages/hooks/reservedSlug'

const run = (slug?: string) =>
  // biome-ignore lint/suspicious/noExplicitAny: el hook solo lee `data`
  reservedSlug({ data: slug === undefined ? {} : { slug } } as any)

describe('reservedSlug', () => {
  it.each(['insights', 'faq', 'customer-service', 'projects', 'search'])(
    'rejects %s, which is still a fixed route',
    (slug) => {
      expect(() => run(slug)).toThrow(/reserved/i)
    },
  )

  // Este es el que importa. `machines` estuvo reservado mientras el listado era
  // una ruta de código; al migrarlo a una Page, la reserva pasó a impedir
  // exactamente la migración que se buscaba, y el editor solo veía un error que
  // no explicaba nada. Si alguien repone la entrada, esto lo detiene.
  it('allows machines, which is a Page now', () => {
    expect(() => run('machines')).not.toThrow()
  })

  it('allows the spanish slug of the machines page', () => {
    expect(() => run('maquinas')).not.toThrow()
  })

  it('allows an unrelated slug', () => {
    expect(() => run('for-brands')).not.toThrow()
  })

  // Un borrador recién creado no trae slug todavía; el hook corre igual y no
  // puede explotar por eso.
  it('passes through when there is no slug yet', () => {
    expect(() => run()).not.toThrow()
  })
})
