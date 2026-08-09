# La página de máquina como bloques — diseño

> El cliente ordena las secciones de cada modelo sin que ningún dato se mueva:
> los bloques leen los campos del propio documento en vez de contenerlos.

## Contexto

`src/app/(frontend)/[locale]/machines/[family]/[slug]/page.tsx` tiene el orden clavado en código: `MachineHero` → `Highlights` → `Capabilities` → `DimensionDiagrams` → galería → relacionadas. Cada sección lee un campo de nivel superior de `machines`.

La colección tiene **diecisiete campos planos y ninguna pestaña**, frente a `Pages`, que separa Hero, Content y SEO. Y lleva un `useRotationHero: checkbox` que elige entre dos variantes de hero — un booleano que no escala: la tercera variante pide un tercer booleano y una condición que las excluya entre sí.

El spike `spike/rotation-frames-70` (commit local `958d000`) dejó funcionando el hero de scroll-scrub por fotogramas y su diseño de secuencias en `openspec/changes/machine-frame-sequences/design.md`. Ese hero es el detonante de este cambio: es la variante que convierte el booleano en un problema.

## La decisión de fondo

**Los bloques son selectores de presentación, no contenedores de contenido.**

Un bloque como `machineCapabilities` no tiene campos de datos. Recibe la máquina desde el renderer y lee `machine.capabilities`. Como mucho lleva campos de *presentación* — un override de eyebrow, una variante — y si el campo está vacío, no renderiza nada.

Es el mismo patrón que `machineFamily`, que lee el documento de familia por relación en vez de re-teclear su contenido. Aquí es más directo todavía: el bloque lee **su propio documento padre**, así que no hace falta ni el campo de relación.

### Por qué los datos no se mudan al layout

No es prudencia, es que **otras páginas los leen**:

- `SpecsCompare`, en la página de familia, cruza los `specs` de todos los modelos de la línea para construir la tabla comparativa.
- `machineModels` los emite como `PropertyValue` dentro del JSON-LD de `Product`.

Un dato dentro de un array de bloques deja de ser consultable. La tabla comparativa se moriría, y el JSON-LD que acabamos de añadir se quedaría sin specs.

La línea es esa: **lo estructurado se queda como campo, lo narrativo se vuelve bloque.**

## Pestañas

Mismo patrón que `Pages`. Los campos **no cambian de nombre ni de sitio en la base de datos** — solo se agrupan visualmente.

| Pestaña | Contenido |
|---|---|
| **Hero** | El hero y su rotación. Aquí muere `useRotationHero`. |
| **Machine details** | `specs`, `dimensions`, `capabilities`, `dimensionDiagrams`, `gallery`, `highlights`, `tags`, `brochure`. |
| **Content** | El `layout` nuevo, ordenable. |
| **SEO** | El `meta` que ya existe. |

## El respaldo, y por qué sigue valiendo la pena aunque las páginas estén ocultas

Las diez máquinas existentes tendrán el `layout` **vacío** el día del despliegue. Si la página se renderizara solo desde el `layout`, quedarían en blanco hasta que alguien las compusiera a mano.

**Hoy `/machines` está detrás de `GATED_PATHS`**, así que un visitante sin sesión de Payload es redirigido a la raíz: en blanco o no, el público no las ve. Eso rebaja el riesgo de "diez páginas rotas en producción" a "diez páginas rotas para el cliente y para nosotros". Menos grave, pero es exactamente el momento en que el cliente entra a revisar contenido y se encuentra la página vacía sin saber por qué.

Y el gate es temporal por definición — `gatedPaths.ts` dice que oculta "copy que el cliente todavía no ha aprobado". El día que se levante, el respaldo tiene que estar puesto o esas páginas salen vacías al público. Ponerlo ahora cuesta poco; recordarlo el día del lanzamiento es apostar.

**Si `layout` está vacío, la página renderiza el orden fijo de hoy.** Sin migración, reversible, y cada máquina se convierte cuando alguien la toca. El precio es que los dos caminos conviven un tiempo, y hay que aceptarlo: el código de la ruta actual no se borra en este cambio.

**Lo que el gate sí cambia es el orden de trabajo.** Con las páginas ocultas se puede desplegar el sistema de bloques y componer las diez máquinas con calma, comprobando cada una, antes de que nadie de fuera las vea. Eso hace la migración de los diez `layout` menos urgente todavía — y la convierte en algo que se hace **antes** de levantar el gate, no después.

## El juego de bloques

Propios de `machines`, **no los de `Pages`**. Un `cardGrid` o un `formBlock` en la página de un modelo no tiene sentido, y ofrecerlos es invitar a componer páginas que luego nadie mantiene.

- `machineHero` — el hero. Variante zoom+fade o rotación por fotogramas. Sustituye a `useRotationHero`.
- `machineHighlights`, `machineCapabilities`, `machineGallery`, `machineDimensions` — leen su campo homónimo.
- `machineSpecs` — la ficha técnica.
- `relatedMachines` — el bloque que ya existe al final de la página.
- `cta` — reutilizado de `Pages`, porque una llamada a la acción sí es contenido libre.

## Las secuencias de fotogramas

El diseño está escrito en `openspec/changes/machine-frame-sequences/design.md` y **no se re-decide aquí**. Lo que este cambio hereda:

- Una secuencia es una **carpeta de Media** referenciada por un puntero, no un array de 70 filas que un editor ordena a mano.
- Carpetas **inmutables versionadas** (`alpha-10-spin-v1`, `-v2`): Payload renombra al colisionar, las URLs por convención no llevan el cache tag `?v=`, y sobrescribir mata el rollback.
- El escenario va sobre **navy** — las máquinas son recortes blancos sobre transparencia y desaparecen sobre claro. Mismo hallazgo que registró `MachinesLanding/styles.css` y que volvió a aparecer anoche con las tarjetas de modelo.
- El canvas dibuja `contain`, no `cover`.

**El bloqueo de peso está resuelto** — ver la medición más abajo. La rotación deja de ir detrás de la variante actual.

### Dónde viven los fotogramas — decidido

**Una carpeta por máquina en R2, con la versión en la ruta:** `gamma-12/v0.1/frame-001.webp`.

**La versión en la ruta sustituye al cache tag.** Las URLs por convención no pasan por `getMediaUrl` y no llevan `?v=`, así que sobrescribir dejaría al edge sirviendo una animación con la mitad de los fotogramas viejos y la mitad nuevos — un fallo intermitente, dependiente de región, imposible de reproducir en local. Con la versión en la ruta, los fotogramas nuevos viven en URLs que el CDN nunca ha visto. La inmutabilidad la da la ruta, no un parámetro.

**Numeración `v0.1` hasta que haya una secuencia estable, y `v1` a partir de ahí.** Refleja lo que son los primeros renders —iteraciones sobre encuadre y velocidad de giro, no versiones de producción— y permite probar varias antes de salir a producción sin quemar `v1` en el primer intento.

**`v1`, no un hash.** El hash da direccionamiento por contenido y deduplicación, y aquí no hay nada que deduplicar: una persona sube una secuencia. A cambio se pierde lo único que importa al abrir el bucket a las once de la noche, que es saber cuál es la última.

**Ni colección propia ni interfaz de subida.** `scripts/build-frame-sequence.mjs` convierte y renombra, alguien sube la carpeta a R2, y en `/admin` solo se apunta. Quien exporta desde Blender es un diseñador en su equipo, no un editor en `/admin`.

#### Los campos del bloque

Dos, y el segundo es el que evita el fallo silencioso:

- **`sequencePath`** (texto) — el prefijo completo, `gamma-12/v0.1`. **No se deriva del `slug`**: el slug es editable, así que renombrar una máquina rompería la referencia sin aviso y dejaría la página publicada sin fotogramas. Y una máquina puede tener más de una secuencia (un giro y una apertura de puerta).
- **`frameCount`** (número) — cuántos fotogramas hay.

El conteo es un campo y no algo que el componente descubra, por dos razones. **No hay forma barata de listar una carpeta de R2 desde el cliente** — habría que consultar la API de S3 en cada render, o mantener un índice. Y un conteo declarado convierte un fotograma que falta en **un hueco visible en la animación**, no en un final prematuro que nadie nota.

La alternativa —un `sequence.json` dentro de la carpeta, que el script ya escribe— evitaría teclear el número, a cambio de una petición extra antes de poder dibujar nada. Queda anotada por si el conteo a mano resulta molesto en la práctica.

**El hook de validación** compara ambos: si `frameCount` cambia pero `sequencePath` no, alguien sobrescribió una versión en vez de crear la siguiente, y ahí es donde vuelve el problema del CDN. Es el descuido más probable y el único que produce un fallo que no se ve en local.

### El peso ya no es un bloqueo — medido 2026-08-09

Con 60 fotogramas reales de un Gamma:

| | por fotograma | secuencia |
|---|---|---|
| PNG 1600px (lo que exporta Blender) | ~1.050 KB | 60 MB |
| WebP 1600px q90, alfa intacto | **24 KB de media, 39 KB el peor** | **1,4 MB** |

Entre 40× y 90× más pequeño. El presupuesto de 500 KB por fotograma que este documento fijaba queda superado por un factor de doce, y **deja de condicionar el número de fotogramas**: 60 pasos caben de sobra y recortar a 36 ya no compra nada.

La razón es que los renders son recortes sobre transparencia — fondo vacío, una máquina, color plano. PNG guarda eso pésimo y WebP lo aplasta.

**Consecuencia para la validación:** el hook útil no vigila un límite que nadie va a rozar. Tiene que **rechazar PNG y exigir WebP**, porque el fallo real será que alguien suba la carpeta sin convertir. El script ya aborta si el render no trae alfa.

## Borradores y vista previa: ya están, y eso simplifica el cambio

`Machines` ya tiene `versions: { drafts: true, maxPerDoc: 50 }` sin autosave —el guardado es explícito, "Save draft"— más `livePreview` y `preview`, ambos resolviendo por `generateMachinePreviewPath`. O sea, el flujo de borrador, vista previa y publicación **existe y no hay que construirlo**.

Lo que hereda el `layout` por ser un campo más del documento:

- **Componer bloques es un borrador** hasta que alguien publique. Es exactamente lo que hace falta para la fase de contenido: las diez máquinas se pueden armar y revisar sin que la versión publicada cambie.
- **La vista previa ya apunta a la ruta correcta**, así que enseña la página compuesta desde el `layout` en cuanto el renderer lo lea.
- **Hay historial**: 50 versiones por documento, así que un layout que se estropeó se revierte sin tocar la base.

**Comprobado, y esto importa:** las diez máquinas tienen su fila en `_machines_v` con `latest = true`. El aviso de `src/collections/CLAUDE.md` —activar `drafts` sobre una colección con documentos existentes sin rellenar las versiones hace que **desaparezcan de `/admin`**, como pasó con las 20 brands— **no aplica aquí**, porque los drafts ya estaban activos cuando se creó el contenido. Añadir un campo no reabre ese riesgo.

Un detalle a vigilar en la fase de contenido: con `drafts: true`, el frontend consulta con `draft: false` y lee la tabla principal. Una máquina compuesta pero **sin publicar** seguirá renderizando su versión publicada — es decir, el respaldo al orden fijo. Correcto, pero es lo que hará pensar "compuse el layout y no se ve".

### El gate y los borradores se solapan, pero no son lo mismo

Tentador concluir que con borradores sobra `GATED_PATHS=/machines`. No del todo, y la diferencia importa.

`gatedPaths.ts` dice que oculta "copy que el cliente todavía no ha aprobado". Eso **es** lo que hace el estado de borrador, con mejor granularidad: por documento en vez de por prefijo de path, y sin necesitar un redespliegue para cambiarlo — el gate es una variable de entorno porque corre en middleware y leer un global costaría una consulta por request.

Pero hoy el contenido está **publicado**: nueve de las diez máquinas y las cinco familias. O sea, el gate no está tapando borradores; está tapando contenido publicado que todavía no se quiere enseñar. Su trabajo real no es aprobación de contenido, es **un interruptor de lanzamiento** para una sección entera.

Dicho de otro modo: los borradores responden "¿está aprobado este documento?", el gate responde "¿lanzamos ya esta sección?". Se parecen mientras la respuesta a las dos sea no.

**Consecuencia práctica para este cambio:** despublicar las nueve máquinas para componer sus layouts sería usar la herramienta equivocada — dejaría la sección rota para cualquiera con sesión y no aportaría nada que el gate no dé ya. Se componen los layouts en borrador **sobre documentos publicados**, se revisan con la vista previa, y se publican cuando estén. El gate se levanta al final, una vez.

Retirar el gate es una decisión de lanzamiento, no técnica, y no forma parte de este cambio.

## Qué no se rompe

- **`SpecsCompare` y el JSON-LD de `Product`** siguen leyendo campos. Es la razón de todo el diseño.
- **`/machines/[family]/[slug]` sigue siendo ruta de código**, no un documento de `Pages`. Esto no reabre esa discusión.
- **Sin `generateStaticParams`** — es lo que tumbó `/machines/[family]` en producción una vez.
- **`GATED_PATHS=/machines` sigue ocultando la sección.** La comprobación es por prefijo de path, así que es indiferente a cómo se componga la página — pero conviene afirmarlo con un test en vez de suponerlo.
- **Los datos no se tocan.** Ninguna migración de contenido en este cambio; la única migración es la del campo `layout` nuevo.

## No elegido

- **Conversión completa con migración de datos.** Mueve `specs` fuera de donde otras páginas lo leen.
- **Aditivo, con el `layout` solo al final.** No resuelve el problema del hero, que es el que originó todo.
- **Reusar el juego de bloques de `Pages`.** Ofrece formularios y grillas de tarjetas en la página de un producto.

## Abierto

- **Presupuesto de peso por fotograma.** Bloquea la rotación, no el resto.
- **Colección propia para secuencias** frente a carpetas en `Media`.
- **Quién renombra los archivos**: Blender escribe `10001.png`, la convención quiere `frame-001.png`.
- **Cuándo se retira el respaldo** y se migran los diez `layout`. La respuesta por defecto es "antes de levantar `GATED_PATHS`", no después.
