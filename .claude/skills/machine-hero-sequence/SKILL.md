---
name: machine-hero-sequence
description: Renderizar la secuencia de fotogramas de una máquina en Blender y publicarla en R2 — recorrido de cámara, zoom, anclajes de cota, conversión a WebP y campos de /admin. Usar al preparar el hero rotatorio de un modelo nuevo, al re-renderizar uno existente, o al tocar scripts/blender/machine-sequence.py.
---

# Turntable de máquinas

Cómo pasar de un FBX del fabricante a un hero que gira con el scroll. El circuito
está cerrado de punta a punta y verificado contra el bucket real; lo de abajo es
el camino que ya funcionó, no una propuesta.

**Fuente de la escena:** `~/template-turntable.blend`, y es el **único** archivo
de plantilla que debe existir. **No** uses `~/Gamma 13.blend` — es la versión
vieja (focal 50, sin shift, y el `Empty` con keyframes de Location, que es justo
el fallo que descentra el giro). Si aparece un `template-turntable-<algo>.blend`,
es basura de una prueba: consolídalo y bórralo, porque dos plantillas que se
parecen acaban rindiendo secuencias con iluminación distinta.

Dos cosas viven guardadas dentro de ese archivo y conviene saberlo antes de
tocarlo:

- **El HDRI está empaquetado** (`file.pack_all()`), no enlazado. Antes colgaba de
  `//Downloads/brown_photostudio_02_4k.exr` y **desapareció al vaciarse la
  carpeta de descargas**. El síntoma no dice nada: Blender pinta el mundo de
  magenta, y como el mundo es la luz, sale la máquina entera rosa. Si algún día
  vuelve a pasar, el archivo es de Poly Haven (CC0) y hay que volver a
  empaquetarlo, no solo reponerlo.
- **`TextPlus001` —la capa del «LOGO HERE»— está apagada** en render y viewport.
  Es el marcador del fabricante y no debe salir en el sitio. Nada lo reemplaza:
  el topper va liso, sin panel emisivo ni ningún objeto delante.

## El comando

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b ~/template-turntable.blend \
  --python scripts/blender/machine-sequence.py -- \
  --frames 90 --sweep-deg 140 --center-deg 47.5 --zoom 85:130 --hold 0.45 \
  --shift-peak 0.16 \
  --out ~/Documents/<modelo>/v0.02 \
  --anchors ~/Documents/<modelo>-anchors.json
```

**`--shift-peak` no es opcional aunque lo parezca.** Sin él el zoom corta la
máquina por arriba —se mete debajo del header— y deja un hueco abajo. 0,16 es el
valor barrido y elegido para la Gamma 13; se mueve con la misma curva que la
focal, así que encuadre y zoom llegan juntos al pico.

Corre headless y **no guarda el `.blend`**: dos corridas con parámetros distintos
no se pisan y nadie hereda el rango de fotogramas de la anterior.

| Flag | Qué hace |
|---|---|
| `--frames` | Cuántos fotogramas renderizar |
| `--sweep-deg` | Cuánto gira en total. 360 = vuelta entera |
| `--center-deg` | Qué ángulo cae en el medio del recorrido — **el único valor que hay que medir por modelo** |
| `--start-deg` | Ángulo del primer fotograma; lo pisa `--center-deg` |
| `--zoom A:B` | Focal inicial y focal del pico |
| `--hold` | Fracción del recorrido quieta en el pico |
| `--peak-frame` | Fotograma del pico; por defecto el del medio |
| `--peek 1,20,45` | Renderiza solo esos fotogramas, a una carpeta hermana |
| `--width` | Resolución cuadrada; para pruebas, 360 o 500 |
| `--shift-peak` | `shift_y` de cámara en el pico; sube el encuadre para que el zoom no corte por arriba |
| `--anchors FILE` | Exporta los anclajes de cota proyectados |
| `--body-top` | Altura en metros donde acaba el gabinete; lo de arriba es topper |
| `--key-light` | `on` por defecto |
| `--dry-run` | No renderiza — para sacar solo los anclajes en 10 segundos |

## Los tres pasos por modelo

### 1. Encontrar el frente

`--center-deg` es el ángulo al que las compuertas y la pantalla miran a la
cámara, y **cambia con cada FBX**. No lo adivines: renderiza un contact sheet
barato y míralo.

```bash
... -- --frames 90 --out ~/Documents/<modelo>/v0.01 --peek 1,12,23,34,46,57,68,79 --width 500
```

Sale en una carpeta `<modelo>-peek`, y el script imprime a cuántos grados
corresponde cada fotograma. En la Gamma 13 el frente cayó a **47,5°**.

El pico del zoom va sobre el frente porque es donde está el producto, la pantalla
y la compuerta. Sobre la espalda es chapa lisa y el zoom no muestra nada.

### 2. Comprobar el encuadre del pico

```bash
... -- --frames 90 --sweep-deg 140 --center-deg <frente> --zoom 85:130 --hold 0.45 \
      --out ~/Documents/<modelo>/v0.01 --peek 45 --width 500
```

Que recorte un poco en el pico es aceptable — es lo que convierte el plano
general en plano de producto. Que se salga tanto que no se reconozca la máquina,
no: a 130 mm y 180° solo se veía una esquina. Si pasa, baja el pico.

**No hagas 360°.** Las dos puntas caen en el perfil estrecho, que es mal póster
inicial y mal cierre. 140° centrados en el frente empiezan y acaban en 3/4 con
volumen.

### 3. Preview antes de renderizar en alta

Renderizar los 90 a 1600 px son ~16 minutos; a 360 px son ~11. Mira el
movimiento primero:

```bash
... --out ~/Documents/preview/v0.01 --width 360 --anchors /tmp/anchors.json
node scripts/blender/build-preview.mjs ~/Documents/preview /tmp/anchors.json ~/Documents/preview.html
```

Sale una página autocontenida (~0,5 MB) con scroll-scrub y las cotas dibujadas
encima. Se abre sin servidor.

## Publicar

```bash
node scripts/build-frame-sequence.mjs ~/Documents/<modelo> ~/Documents/<modelo>-upload --width 1200 --quality 80
cp ~/Documents/<modelo>-anchors.json ~/Documents/<modelo>-upload/anchors.json
```

Sube esa carpeta a R2 (`website-8h349ieouv`) **en la raíz del bucket**, no bajo el
prefijo de Payload, como `<carpeta>/v0.0N/`, con
`Cache-Control: public, max-age=31536000, immutable`.

Y en `/admin`, sobre la máquina, **los dos campos en la misma edición** — el hook
`validateFrameSequence` rechaza cambiar el conteo dejando la misma carpeta:

```
useRotationHero  ✓
sequencePath     <carpeta>/v0.0N
frameCount       <N>
```

**Carpeta nueva por cada versión. Nunca sobrescribir.** Estas URLs no llevan
cache tag, así que reemplazar los archivos deja al CDN sirviendo media animación
vieja y media nueva, distinto según la región e imposible de reproducir en local.

**1200 px, no 1600.** A 1600 con calidad 90 la secuencia da 4,8 MB, más del doble
del objetivo; a 1200 con calidad 80 da 2,3 MB y a tamaño de pantalla no se
distingue — el canvas del hero mide ~700 px.

## Las cotas

`--anchors` escribe, fotograma por fotograma, dónde cae cada esquina del gabinete
dentro de la imagen, en coordenadas 0..1 con origen arriba a la izquierda: listas
para `left: x*100%`. Con eso el sitio dibuja las cotas en SVG sobre el canvas y
quedan clavadas a la geometría durante el giro y el zoom.

**No hornees las cotas en el render** (ni con MeasureIt ni con MeasureIt-ARCH,
que existen y son gratis). El texto horneado no se traduce, no conmuta entre
pulgadas y milímetros, no lo lee un lector de pantalla, no lo indexa Google, y
cada corrección de un número obliga a re-renderizar la secuencia entera. Esos
plugins sí son la herramienta correcta para las **vistas ortográficas estáticas**
de la ficha técnica, que son otra pieza.

Dos reglas que ya costaron una equivocación:

- **Los anclajes salen de la malla medida, no de la ficha.** El modelo puede no
  estar centrado en X — en la Gamma 13 el centro cae en −0,171, y una caja ideal
  armada con los milímetros de la ficha deja las cotas corridas 17 cm.
- **El número que se muestra es el de la ficha, no el medido.** El modelo trae
  tolerancias de CAD; la ficha es lo que el operador va a medir contra su puerta.
  Ubicar con lo medido y rotular con la ficha es deliberado.

El script también exporta un `facing` por fotograma y por cota: cuánto mira a la
cámara la cara sobre la que vive esa medida. Es lo que decide cuándo aparece y
cuándo se va, en vez de un tiempo inventado.

## Trampas verificadas

**Blender 5.2 usa slotted actions.** `action.fcurves` viene vacío o no existe, y
un bucle sobre él **falla en silencio**: no da error, simplemente no encuentra
nada y el script parece funcionar sin haber tocado ninguna curva. Las fcurves
cuelgan de `action.layers[].strips[].channelbags[].fcurves`. Usa el helper
`fcurves_of()` del script.

**La vuelta entera cierra en N+1, un arco parcial en N.** El fotograma N+1
repetiría al primero, así que dejarlo fuera del render es lo que hace que el
salto del último al primero mida igual que cualquier otro paso. Un arco parcial
no vuelve sobre sí mismo y sus dos puntas son posiciones que sí queremos ver.

**El giro va en Linear, el zoom en Bezier.** Atado al scroll, un giro con Bezier
acelera y frena: el dedo se mueve parejo y la máquina no. El zoom sí quiere
easing, con handles auto-clamped para que la meseta quede plana de verdad.

**La luz `KEY` estaba excluida del render en el template** y nadie lo vio hasta
que se comparó. La secuencia `gamma-12/v0.01` salió iluminada solo con FILL, RIM,
interior y HDRI. El script la enciende por defecto; si re-renderizas un modelo
antiguo, la iluminación va a cambiar y hay que rehacer también los demás para que
casen.

**El `Empty` no puede tener keyframes de Location.** Si los tiene, el centrado se
revierte en cada refresh y el giro se ve como un bamboleo. El script avisa por
consola cuando los encuentra, pero no los borra.

**El suelo va en CSS, no en el render.** Un Plane con Shadow Catcher no funciona
en EEVEE — es de Cycles. En el template el Plane está excluido del render.

## Coste

~11 s por fotograma a 1600 px con vidrio transparente. 90 fotogramas ≈ 16
minutos por modelo. Quince modelos son unas 4 horas de máquina, así que conviene
lanzarlos en tanda y no de a uno mientras esperas.

Las cotas importan más en la ficha del modelo que en el hero de la home: en el
hero vendes la sensación, en la ficha el operador está decidiendo si le entra por
la puerta. Un recorrido más corto — 45 fotogramas y 60° alrededor del frente —
alcanza para que las tres cotas aparezcan y baja el render a la mitad.
