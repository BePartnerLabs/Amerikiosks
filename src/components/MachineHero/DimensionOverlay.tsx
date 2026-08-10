'use client'

import { useEffect, useState } from 'react'
import { buildAnchorsURL, type FrameAnchors } from '@/utilities/buildAnchorsURL'

type Props = {
  /**
   * URL completa del `anchors.json`, resuelta **en el servidor**.
   *
   * No se compone aqui a proposito. `buildAnchorsURL` lee `S3_PUBLIC_URL`, y en
   * el navegador esa variable no existe: Next solo inlinea las `NEXT_PUBLIC_*`.
   * Componerla en el cliente daba un host vacio, la peticion caia contra el
   * propio origen, devolvia 404 y las cotas no aparecian nunca — sin error en
   * consola, porque el catch trata el fallo como "esta maquina no tiene
   * anclajes", que es el caso normal de diez de las once.
   */
  anchorsUrl: string
  /** Fotograma que el canvas está mostrando ahora. */
  frameIndex: number
  /** 0..1 del recorrido del hero. Gobierna la entrada. */
  progress: number
  /** Textos publicados, tal como los guarda /admin: `77"`, `72"`, `39"`. */
  labels: Partial<Record<'height' | 'width' | 'depth', string>>
  reducedMotion: boolean
}

/**
 * Las cotas del hero, dibujadas en SVG sobre el canvas.
 *
 * No van horneadas en los fotogramas a propósito. Un número dentro de un PNG no
 * se traduce, no se puede conmutar entre pulgadas y milímetros, no lo lee un
 * lector de pantalla, no lo indexa Google, y cada corrección obliga a
 * re-renderizar la secuencia entera. Aquí el número es texto y sale del mismo
 * campo que la tabla de specs.
 *
 * Lo que Blender aporta es sólo la geometría: dónde cae cada esquina del
 * gabinete dentro de la imagen, fotograma por fotograma, ya proyectada con la
 * cámara real —rotación y zoom incluidos—. Por eso la flecha sigue a la máquina
 * mientras gira y se acerca, en vez de flotar sobre ella.
 */
export const DimensionOverlay: React.FC<Props> = ({
  anchorsUrl,
  frameIndex,
  progress,
  labels,
  reducedMotion,
}) => {
  const [anchors, setAnchors] = useState<FrameAnchors | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(anchorsUrl)
      .then((r) => (r.ok ? r.json() : null))
      // Sin anclajes el hero sigue funcionando: la máquina gira y las cotas no
      // aparecen. Es exactamente lo que pasa con las diez máquinas que todavía
      // no tienen secuencia, así que no es un caso excepcional que haya que
      // señalar — es el estado normal de casi todo el catálogo.
      .then((data) => !cancelled && setAnchors(data))
      .catch(() => !cancelled && setAnchors(null))
    return () => {
      cancelled = true
    }
  }, [anchorsUrl])

  if (!anchors) return null

  const frame = anchors.frames[Math.min(frameIndex, anchors.frames.length - 1)]
  if (!frame) return null

  return (
    // `xMidYMid meet` y no `none`, y no es cosmetico: es lo que hace que las
    // cotas caigan encima de la maquina.
    //
    // Los anclajes estan normalizados contra el fotograma, que es cuadrado. El
    // canvas lo dibuja con `contain` —proporcion intacta, centrado— asi que la
    // imagen ocupa un cuadrado centrado dentro de un contenedor panoramico, no
    // el contenedor entero. Con `none` el SVG estiraba su rejilla de 1000x1000
    // hasta llenar toda la caja: las flechas quedaban corridas respecto de la
    // maquina y ademas deformadas, gordas en horizontal y finas en vertical.
    //
    // `meet` reproduce exactamente el mismo encuadre que `contain`, asi que las
    // dos capas comparten sistema de coordenadas.
    <svg
      className="ak-hero-cotas"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <title>Dimensions</title>
      {Object.entries(anchors.edges).map(([key, [a, b]]) => {
        const label = labels[key as keyof typeof labels]
        if (!label) return null

        const shown = reducedMotion ? 1 : fade(frame.facing[key] ?? 0) * gate(progress)
        if (shown < 0.02) return null

        return (
          <Cota
            key={key}
            from={frame.p[a]}
            to={frame.p[b]}
            label={label}
            shown={shown}
            outward={key === 'height' ? -1 : 1}
          />
        )
      })}
    </svg>
  )
}

/**
 * Una cota: dos líneas de referencia, la línea acotada, sus puntas y el número.
 *
 * El trazado no es una animación con duración. Con scroll-scrub el usuario es el
 * reloj: una transición CSS sigue corriendo hacia adelante cuando el dedo va
 * hacia atrás y el efecto se despega del fotograma que hay debajo. Todo cuelga
 * de `shown`, así que scrollear al revés desdibuja la cota, que es lo único
 * coherente con un scrubber.
 */
const Cota: React.FC<{
  from: [number, number]
  to: [number, number]
  label: string
  shown: number
  outward: number
}> = ({ from, to, label, shown, outward }) => {
  const [x1, y1] = [from[0] * 1000, from[1] * 1000]
  const [x2, y2] = [to[0] * 1000, to[1] * 1000]

  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const offset = 58 * outward
  const nx = (-dy / len) * offset
  const ny = (dx / len) * offset
  const [ax, ay] = [x1 + nx, y1 + ny]
  const [bx, by] = [x2 + nx, y2 + ny]
  const [mx, my] = [(ax + bx) / 2, (ay + by) / 2]

  // Tres etapas solapadas sobre el mismo valor: brotan las referencias desde las
  // esquinas, se traza la línea desde el centro hacia las dos puntas, y al final
  // llegan las flechas y el número. Se lee como un instrumento midiendo, no como
  // un cartel que se enciende.
  const grow = stage(shown, 0, 0.45)
  const trace = stage(shown, 0.3, 0.85)
  const settle = stage(shown, 0.7, 1)

  const head = (px: number, py: number, sx: number, sy: number) => {
    const ux = (sx / len) * 26 * settle
    const uy = (sy / len) * 26 * settle
    return `M${px},${py} L${px + ux - uy * 0.34},${py + uy + ux * 0.34} M${px},${py} L${px + ux + uy * 0.34},${py + uy - ux * 0.34}`
  }

  const drift = (1 - settle) * 20

  return (
    <g
      className="ak-hero-cotas__cota"
      opacity={shown}
    >
      <line
        x1={x1}
        y1={y1}
        x2={lerp(x1, ax, grow)}
        y2={lerp(y1, ay, grow)}
      />
      <line
        x1={x2}
        y1={y2}
        x2={lerp(x2, bx, grow)}
        y2={lerp(y2, by, grow)}
      />
      <line
        className="ak-hero-cotas__line"
        x1={lerp(mx, ax, trace)}
        y1={lerp(my, ay, trace)}
        x2={lerp(mx, bx, trace)}
        y2={lerp(my, by, trace)}
      />
      <path
        d={`${head(ax, ay, dx, dy)} ${head(bx, by, -dx, -dy)}`}
        opacity={settle}
      />
      <text
        x={mx + (nx / offset) * drift}
        y={my - 14 + (ny / offset) * drift}
        opacity={settle}
      >
        {label}
      </text>
    </g>
  )
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

const smoothstep = (v: number, from: number, to: number) => {
  const t = Math.min(Math.max((v - from) / (to - from), 0), 1)
  return t * t * (3 - 2 * t)
}

const stage = smoothstep

/**
 * Aparece cuando la cara sobre la que vive la cota mira lo suficiente a la
 * cámara. Medir el ancho sobre un frente casi de perfil dibuja una flecha de dos
 * píxeles con un número al lado que no se entiende a qué apunta. El margen entre
 * los dos umbrales evita que titile al cruzar el límite.
 */
const fade = (facing: number) => smoothstep(facing, 0.28, 0.62)

/**
 * El primer fotograma es el póster: lo que se ve antes de que nadie toque nada.
 * Ahí la máquina va limpia y las cotas entran al empezar a scrollear, que es
 * cuando el visitante pasa de mirar a leer.
 */
const gate = (progress: number) => smoothstep(progress, 0.02, 0.09)
