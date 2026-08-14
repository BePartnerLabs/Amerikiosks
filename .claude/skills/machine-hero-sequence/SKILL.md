---
name: machine-hero-sequence
description: Publicar la secuencia de fotogramas del hero rotatorio de una máquina — subida a R2, campos de /admin, y el contrato de los anclajes de cota con el frontend. Usar al estrenar el hero de un modelo, al re-renderizar uno existente, o al tocar MachineHero, buildFrameSequenceURL o buildAnchorsURL.
---

# Hero rotatorio de máquinas

El circuito está cerrado de punta a punta y verificado contra el bucket real; lo
de abajo es el camino que ya funcionó, no una propuesta.

## El render no se hace en este repo

Vive en **[`BePartnerLabs/amerikiosks-blender`](https://github.com/BePartnerLabs/amerikiosks-blender)**:
el script, la plantilla de Blender y la receta de cada modelo en `machines.json`.
Está aparte porque la plantilla pesa 66 MB y no la necesita nadie del frontend ni
ninguna corrida de CI.

```bash
git clone git@github.com:BePartnerLabs/amerikiosks-blender.git
# el README de ahí tiene el comando, los flags y las trampas de Blender
```

Lo que **sí** es de este repo: convertir a WebP, subir a R2, poner los campos en
`/admin`, y el contrato entre los anclajes y el frontend.

## Publicar

El render deja 90 PNG y un `anchors.json`. Desde aquí:

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

`sequencePath` en Payload es **la fuente de verdad de qué versión está viva**. No
se duplica en el repo de Blender: dos sitios diciendo lo mismo acaban diciendo
cosas distintas.

## Las cotas

`anchors.json` dice, fotograma por fotograma, dónde cae cada esquina del gabinete
dentro de la imagen, en coordenadas 0..1 con origen arriba a la izquierda: listas
para `left: x*100%`. `DimensionOverlay` las dibuja en SVG sobre el canvas.

Tres cosas que ya costaron una equivocación cada una:

- **La URL del `anchors.json` se resuelve en el servidor**, en
  `src/components/MachineHero/index.tsx`. `buildAnchorsURL()` necesita
  `S3_PUBLIC_URL`, que no existe en el cliente; resuelta en el navegador da 404 y
  el `catch` se lo traga, así que las cotas desaparecen **sin error visible**.
- **Los rótulos salen del campo `dimensions` de la máquina, no del JSON.** Los
  anclajes ubican; el CMS dice qué se lee. Sin ficha cargada hay flechas sin
  número. Es deliberado: se ubica con la geometría medida y se rotula con la
  ficha, porque el modelo trae tolerancias de CAD y la ficha es lo que el
  operador va a medir contra su puerta.
- **El SVG va con `preserveAspectRatio="xMidYMid meet"`.** Con `none` el viewBox
  se estira y las flechas quedan corridas y alargadas respecto al render.

El JSON trae además un `facing` por fotograma y por cota —cuánto mira a la cámara
la cara sobre la que vive esa medida— y eso es lo que decide cuándo aparece y
cuándo se va, en vez de un tiempo inventado. Todo el trazado cuelga del progreso
del scroll, nunca de una transición CSS: el usuario es el reloj.

**No hornees las cotas en el render.** El texto horneado no se traduce, no
conmuta entre pulgadas y milímetros, no lo lee un lector de pantalla, no lo indexa
Google, y corregir un número obliga a re-renderizar la secuencia entera.
