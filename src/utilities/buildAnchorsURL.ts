/**
 * URL de los anclajes de cota de una secuencia.
 *
 * Vive junto a los fotogramas, en la misma carpeta versionada, porque nace del
 * mismo render: `machine-sequence.py --anchors`, en el repo
 * `BePartnerLabs/amerikiosks-blender`, lo escribe en la misma pasada que produce
 * los PNG. Ponerlo en otro sitio —un campo de Payload,
 * otro bucket— abriría la puerta a que las cotas de una versión se dibujen sobre
 * los fotogramas de otra, y el síntoma sería una flecha apuntando al aire al
 * lado de la máquina, sin nada que lo delate.
 *
 * Al compartir carpeta comparte también la regla de inmutabilidad: versión nueva
 * es carpeta nueva es URL nueva, y los anclajes se invalidan con ella.
 */
export const buildAnchorsURL = (sequencePath: string): string => {
  const base = process.env.NEXT_PUBLIC_S3_PUBLIC_URL ?? process.env.S3_PUBLIC_URL
  const host = base?.replace(/\/+$/, '') ?? ''
  const prefix = sequencePath.replace(/^\/+|\/+$/g, '')

  return `${host}/${prefix}/anchors.json`
}

/** Lo que escribe `machine-sequence.py --anchors`. */
export type FrameAnchors = {
  /** Medidas del gabinete tomadas de la malla, en mm. Ubican, no se publican. */
  measuredMm: { height: number; width: number; depth: number }
  /** Qué par de esquinas une cada cota. */
  edges: Record<string, [string, string]>
  frames: {
    frame: number
    /** Esquina → [x, y] en 0..1, origen arriba a la izquierda, listo para CSS. */
    p: Record<string, [number, number]>
    /** Cuánto mira a la cámara la cara sobre la que vive cada cota, 0..1. */
    facing: Record<string, number>
  }[]
}
