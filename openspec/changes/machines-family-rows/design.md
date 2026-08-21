# Las familias de `/machines`, en filas — diseño

## Contexto

`/machines` es la página 8 y hoy la arman siete bloques. Verificado contra la base
restaurada de producción, no contra el código:

| Orden | Bloque | Qué hace |
|---|---|---|
| 1 | `machineLineup` | Escena oscura pinneada: la máquina sube y gira mientras el scroll recorre **las cinco familias** |
| 2–6 | `machineFamily` ×5 | Una sección por familia, cada una con una grilla bento de hasta cinco tiles |
| 7 | `machineModels` | Carousel con los nueve modelos publicados, planos |

Las cinco familias, con su conteo real de modelos publicados: Alpha 2, Gamma 3,
Delta 0, Zeta 1, Kappa 3.

El problema no es la altura de la página, aunque sea el síntoma que se ve. Es que
**el eje «familia» aparece dos veces**: la escena pinneada ya recorre las cinco
familias antes de que empiecen las cinco secciones que las repiten. El propio
`machineModels` lo dice en su docstring, y es la razón por la que ese carousel es
plano en vez de agrupado:

> *Flat rather than grouped by family: each family already has its own section
> above this one, with its own link.*

## La decisión de fondo

Las cinco secciones `machineFamily` se reemplazan por **un bloque nuevo con las
cinco familias en filas compactas**, una imagen por familia. La escena pinneada y
el carousel de modelos se quedan como están.

### Por qué filas y no carousel

Un carousel de familias fue la primera propuesta y se descartó. Habría sido el
tercer navegador de máquinas en la misma página y el segundo con eje familia,
justo debajo de una escena que ya recorre las familias — y habría dejado dos
carousels consecutivos, invalidando el argumento con el que `machineModels`
justifica ser plano.

Las filas resuelven la altura sin agregar un eje.

### Por qué no se toca `/machines/[family]`

Se evaluó extraer un componente compartido para usar el mismo formato de fila en
las características de la página de familia. Se descartó **por ahora**: esa
página no está en alcance y sus características no corren riesgo — hoy ya se
renderizan ahí con `FamilyHighlights`. Sacarlas de `/machines` no deja hueco, solo
deja de duplicarlas.

Con un solo consumidor, el markup vive dentro del bloque. La abstracción se
extrae cuando exista el segundo caso de uso y se sepa de verdad qué comparten.

## El bloque

Recibe todas las familias, como ya hace `machineLineup`. Casi no lleva contenido
propio: nombre, tagline, thumbnail y conteo salen de la colección
`machine-families`.

Campos: encabezado (eyebrow, heading, intro), `countEyebrow` y `soonLabel`
—ambos texto localizado con default, siguiendo la convención de las etiquetas de
`machineFamily`— y las perillas de presentación.

### Delta se resuelve solo

Delta no tiene modelos publicados. El estado se **deriva de `modelCount === 0`**,
nunca se tipea. Es la convención que el bloque actual ya documenta en
`showModelCount`:

> *The number is counted from the machines collection, never typed, so it cannot
> fall out of sync.*

- `modelCount === 0` → badge `soonLabel` («Próximamente») y CTA neutro.
- `modelCount > 0` → badge «N modelos» y CTA «Ver la línea».

El día que publiquen el primer modelo de Delta el badge se da vuelta solo. Nadie
tiene que acordarse de entrar a `/admin` a sacar un cartel.

**El CTA entra igual a la familia.** `/machines/delta` no es una página vacía:
`FamilyHero`, `FamilyHighlights` (Delta tiene sus cuatro características) e
`InstallationsGallery` renderizan; los dos que quedarían huecos ya se apagan
solos — `SpecsCompare` retorna `null` con menos de dos modelos con specs, y
`ModelsCarousel` retorna `null` con cero. Lo que el CTA no puede decir es «Ver la
línea», que promete modelos.

## El volado

La máquina se sale del card por arriba. No es un efecto nuevo: es la mecánica que
`machineModels` ya usa en las `ak-model-card` de la misma página, con su propio
comentario explicándola.

El truco es que el ancho de la caja sea **fijo y más ancho que la máquina más
ancha**: con `object-fit: contain` una caja ancha deja el render limitado por
ancho, se achica y queda entero adentro. Una caja cuyo alto es el límite hace que
la máquina lo llene y el volado sea real.

Dos reglas que se derivan y no se escriben a mano:

- **La altura del render se mide contra la fila real** (`calc(100% + volado)`), no
  contra un alto asumido. La fila es `min-height` y crece con su texto; un número
  fijo se lo come.
- **El espacio entre filas nunca puede ser menor que el volado.** La máquina se
  mete hacia arriba: si el gap es menor, aterriza sobre el card anterior en vez
  de en el hueco. El gap se calcula con un piso de `volado + aire`. Es el mismo
  acoplamiento que `machineModels` documenta entre `--_models-overhang` y el
  padding de su track.

## La trampa de `square`

`getBestMediaUrl` devuelve **la primera size cuyo ancho alcance el target**, en el
orden `thumbnail` (300) → `square` (**500×500**) → `small` (600) → …

`square` es un recorte forzado a cuadrado. Pedir 250 cae en `thumbnail` y respeta
el aspecto; pedir 350 cae en `square` y vuelve a meter la máquina en un cuadrado,
anulando el recorte. Con el ancho de 13rem del diseño el target correcto es ~250.

Es una trampa de un solo número y falla en silencio. Va con comentario en el
código.

## Los assets: precondición de contenido, no de código

Los cinco thumbnails son PNG de 1920×1920 donde la máquina ocupa una fracción del
ancho. Medido sobre los archivos reales:

| Familia | Contenido real | Ocupa | Aspecto |
|---|---|---|---|
| Alpha | 935×1564 | 49% | 0.60 |
| Gamma | 961×1547 | 50% | 0.62 |
| Delta | 781×1533 | 41% | 0.51 |
| Zeta | 555×1507 | **29%** | 0.37 |
| Kappa | 1016×1533 | 53% | 0.66 |

`heroLineupImage` apunta a los mismos cinco archivos. **Con estos assets el volado
no existe**: la máquina nunca llega al borde.

La solución no necesita re-exportar desde Blender. El recorte de Payload ya está
habilitado (`crop` es `@default true` en los tipos instalados; `Media.ts` no lo
desactiva), así que se recorta desde `/admin`.

**Tres cosas que hay que saber antes de hacerlo:**

1. **Es destructivo.** En `generateFileData.js`, con `cropData` presente el buffer
   recortado reemplaza el archivo y las sizes se generan desde esa versión.
   Payload no guarda el original. **Un rollback de código no lo deshace**: se
   recupera volviendo a subir desde el Shared Folder de Drive.
2. **No está aislado.** `machine-families.thumbnail` tiene tres consumidores:
   `MachineLineup/Server.tsx` a 720px —**la escena pinneada de esta misma
   página**—, `ModelLinesRow` a 200px, y `MachineFamily/Server.tsx` a 520px, que
   deja de importar. El recorte le cambia el encuadre a la escena pinneada, que
   está calibrada contra el margen que hoy tienen esos archivos. **Es lo primero
   que hay que mirar**, no las filas.
3. **Solo se puede hacer en producción.** El entorno local tiene R2 de solo
   lectura. No es una migración, es contenido: no hay nada que ensayar.

Por eso el recorte va **antes y por separado**, una familia primero. Es
reversible desde Drive, no toca código, y no hay ventana de mantenimiento de por
medio.

**El diseño degrada solo.** Si el bloque sale antes del recorte, con el cuadrado
el `contain` queda limitado por ancho, la máquina entra entera y no hay volado.
Feo, no roto.

## Qué no se rompe

- `machineLineup` y `machineModels` se quedan, sin tocar.
- La ruta `/machines/[family]` no se toca.
- `machineFamily` **queda registrado, sin usar**. Borrar su config implica una
  migración destructiva sobre `pages_blocks_machine_family`, su `_locales` y las
  `_pages_v_*`. Dejarlo cuesta cero y es reversible.
- Sus cinco instancias guardan solo `family_id`, `show_model_count` y cuatro
  etiquetas localizadas. Todo el contenido real vive en `machine-families`:
  sacarlas no pierde nada.
- No se agregan campos a `machine-families`. `thumbnail` ya existe.

## Migración

Una, y solo de esquema: las tablas del bloque nuevo. El precedente es
`20260806_012848_machine_family_block.ts`, que creó cuatro
(`pages_blocks_*`, `pages_blocks_*_locales`, `_pages_v_blocks_*`,
`_pages_v_blocks_*_locales`).

El orden en el deploy no es opcional: **el release corre la migración y recién
después se puede colocar el bloque en `/admin`**, porque hasta que las tablas no
existan no aparece para elegir. `deploy.yml` cierra `/admin` mientras corre; la
ventana para el ajuste manual es cuando el release termina.

Hay un restore de producción corriendo en local, así que el round-trip
(`migrate` → `migrate:down` → `migrate`) se hace contra datos reales y su
resultado va escrito en el PR. Si no, la rama termina en `preview/<feature>`.

## No elegido

- **Carousel de familias.** Tercer navegador, segundo con eje familia. Ver arriba.
- **Familias como único eje**, eliminando `machineModels`. Hoy los nueve modelos
  están a un clic desde `/machines`; pasarían a dos.
- **Componente compartido con la página de familia.** Prematuro con un solo
  consumidor.
- **Compensar el margen de los assets por CSS**, escalando y recortando. El
  aspecto real varía entre 0.37 y 0.66 según la familia, así que habría que
  calibrar una por una — y se rompe la primera vez que suban una máquina nueva.

## Abierto

- Los acentos por familia salen del array `ACCENTS` de `ModelsCarousel`. En cinco
  filas juntas pesan más que en el home. Puede que convenga un solo acento.
- El volado en teléfono no está resuelto: la fila pasa a imagen de 96px al
  costado con el CTA afuera a lo ancho, y ahí el volado no se sostiene.
