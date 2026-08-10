// Lleva capturas de bloques a un formato unico para el selector de /admin.
//
// El problema que resuelve: las miniaturas existentes conviven en tres
// relaciones de aspecto distintas (1.42:1, 1.80:1, 2.52:1) porque cada una se
// recorto a la altura de su contenido. En la cuadricula del selector eso se lee
// como inacabado, aunque cada imagen por separado este bien.
//
// La captura se escala para caber con margen y el resto se rellena con el color
// que ya tiene la captura en su borde. Para fondos planos —que es lo que tienen
// estos bloques— el resultado es indistinguible de extender el fondo a mano, es
// determinista y no depende de ninguna API de imagen.
//
//   node scripts/normalize-block-previews.mjs <entrada.png> <salida.png>
//   node scripts/normalize-block-previews.mjs --dir <carpeta>   (in situ)

import { readdir } from 'node:fs/promises'
import { basename, join } from 'node:path'
import sharp from 'sharp'

const RATIO = 16 / 9
const WIDTH = 1600
const HEIGHT = Math.round(WIDTH / RATIO)
const PADDING = 0.94 // cuanto del lienzo ocupa la captura

/** Color del borde de la imagen, que es el fondo con el que se rellena. */
const edgeColor = async (input) => {
  // Una franja de 1px del borde superior izquierdo: en estas capturas el bloque
  // siempre arranca con su propio fondo, nunca con contenido pegado al canto.
  const { data } = await sharp(input)
    .extract({ left: 2, top: 2, width: 8, height: 8 })
    .raw()
    .toBuffer({ resolveWithObject: true })
  const px = data.length / 8 / 8
  let r = 0
  let g = 0
  let b = 0
  for (let i = 0; i < data.length; i += px) {
    r += data[i]
    g += data[i + 1]
    b += data[i + 2]
  }
  const n = data.length / px
  return { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n), alpha: 1 }
}

const normalize = async (inputPath, outputPath) => {
  const background = await edgeColor(inputPath)
  const scaled = await sharp(inputPath)
    .resize(Math.round(WIDTH * PADDING), Math.round(HEIGHT * PADDING), {
      fit: 'inside',
      withoutEnlargement: false,
    })
    .toBuffer()
  await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background } })
    .composite([{ input: scaled, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(outputPath)
  const { size } = await sharp(outputPath).metadata()
  console.log(
    `  ${basename(outputPath).padEnd(28)} ${WIDTH}x${HEIGHT}  fondo rgb(${background.r},${background.g},${background.b})  ${Math.round((size ?? 0) / 1024)} KB`,
  )
}

const [a, b] = process.argv.slice(2)
if (a === '--dir') {
  const files = (await readdir(b)).filter((f) => f.endsWith('.png'))
  console.log(`${files.length} imagenes -> ${WIDTH}x${HEIGHT} (16:9)`)
  for (const f of files) {
    const p = join(b, f)
    const tmp = `${p}.tmp.png`
    await normalize(p, tmp)
    await sharp(tmp)
      .toFile(p)
      .catch(async () => {
        const { rename } = await import('node:fs/promises')
        await rename(tmp, p)
      })
  }
} else {
  await normalize(a, b)
}
