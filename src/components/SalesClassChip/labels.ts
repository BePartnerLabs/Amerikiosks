import { getTranslations } from 'next-intl/server'
import type { SalesClass } from './index'

export type SalesClassLabels = Record<SalesClass, string>

const CLASSES: SalesClass[] = [
  'frozen',
  'hot-food',
  'refrigerated',
  'ambient-high-volume',
  'tight-space',
]

/**
 * Los cinco rótulos, resueltos de una vez en el wrapper de servidor.
 *
 * El chip los recibe ya traducidos en vez de llamar a next-intl él mismo: los
 * componentes de presentación de estos bloques son síncronos a propósito —ver
 * la nota sobre `getLocale()` y `DYNAMIC_SERVER_USAGE` en
 * `app/(frontend)/CLAUDE.md`— y uno de ellos viaja además como `children` de un
 * componente de cliente.
 *
 * Las claves son los valores del select cerrado de `machine-families`, así que
 * agregar una clase es agregarla en los dos `messages/*.json` y acá.
 */
export const getSalesClassLabels = async (): Promise<SalesClassLabels> => {
  const t = await getTranslations('machines')
  return Object.fromEntries(
    CLASSES.map((salesClass) => [salesClass, t(`salesClass.${salesClass}`)]),
  ) as SalesClassLabels
}
