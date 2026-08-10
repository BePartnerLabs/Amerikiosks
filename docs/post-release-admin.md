---
title: Qué hacer en /admin después del release
read_when: Acabas de publicar un release, o retomas el trabajo de máquinas en otra sesión.
enforced_by: nada — son pasos manuales, por eso están escritos
lifespan: temporal — borrar este archivo cuando todo esté hecho
---

# Qué hacer en `/admin` después del release

> **Este documento es una lista de tareas, no documentación. Bórralo cuando esté
> todo hecho.**
>
> Es una foto de un momento — qué quedó a medias el 2026-08-09 y qué hay que
> tocar a mano para terminarlo. En cuanto los bloques estén colocados y los
> textos corregidos, deja de ser cierto, y un documento que describe un estado
> que ya no existe es peor que ninguno: se lee como instrucciones vigentes.
>
> Lo que sí es permanente vive en otro sitio y **no** debe migrarse aquí: el
> flujo de secuencias está en `openspec/changes/machine-page-blocks/design.md`,
> los patrones en `docs/patterns/`, y lo que el cliente necesita saber va a
> `docs/CLIENT-MANUAL.md`. Antes de borrar, comprueba que nada de lo de abajo
> era permanente y se quedó solo aquí.

Escrito el 2026-08-09 al cerrar la sesión de los PR #238 y #239. **Nada de lo de abajo pasa solo.** El código está en `main`, pero un bloque que nadie añade a una página no se renderiza en ninguna parte, y esa es la brecha entre "mergeado" y "por qué no se ve".

## Estado al cerrar la sesión

- `main` está en `3255be9`, con los PR **#238** (bloques del landing de máquinas) y **#239** (contexto agéntico, validadores, secuencias de fotogramas) dentro.
- **Cuatro migraciones nuevas**, todas aditivas y **ya ensayadas** contra un restore real de producción: `migrate` → `migrate:down` → `migrate`, sin pérdida de datos (10 máquinas antes y después). El requisito de ensayo del `CLAUDE.md` está cubierto; **no hace falta pasar por `preview/**`** por este motivo.
- El sitio de producción **no ha cambiado todavía**: nada se despliega hasta publicar un release, y ningún bloque nuevo está colocado en ninguna página.

## 1. Bloques nuevos disponibles, ninguno colocado

Tres bloques entraron en el selector de `Pages` y están sin usar:

| Bloque | Qué hace | Campos que pide |
|---|---|---|
| **Machine Lineup** | La escena oscura fijada, recorriendo las cinco familias con scroll | `intro` (opcional) |
| **Machine Family** | Una familia completa | `family` (relación), rótulos, `showModelCount` |
| **Machine Models** | Todos los modelos en un carrusel plano | `eyebrow`, `heading`, `ctaLabel`, `family` (opcional) |

**No reemplazan a `/machines`**, que sigue siendo una ruta de código con su orden fijo. Para estrenarlos hay que crear una página y componerla. El diseño de esa conversión está en `openspec/changes/machines-landing-as-page/design.md`, con una decisión abierta: cómo se localiza el slug (`machines`/`maquinas`) mientras sus hijos siguen resolviéndose por `pathnames` de next-intl.

**Al crear la página**: los dos locales **en la misma sesión**. Es el gotcha de arrays localizados de `docs/patterns/payload-localized-arrays.md` — escribir en un locale sin devolver los `id` borra el contenido del otro.

## 2. Marcar la característica destacada de cada familia

`machine-families → highlights → items` tiene un checkbox **`featured`** nuevo. Marca **uno por familia**: es el que muestra el bloque `Machine Lineup` al recorrerlas.

Si no marcas ninguna, usa la primera del array — así ninguna familia desaparece del recorrido. No es un error, pero la elección la está haciendo el orden, no tú.

Son cinco familias: `alpha`, `delta`, `gamma`, `kappa`, `zeta`.

## 3. Secuencias de rotación por fotogramas

El circuito completo funciona y está verificado contra el bucket real.

**Para añadir una:**

```bash
node scripts/build-frame-sequence.mjs <carpeta-del-render> <carpeta-de-salida>
```

Convierte a WebP, renombra a `frame-001.webp…`, aguanta los nombres con prefijo que escribe Blender (`v0.010001.png`) y aborta si el render no trae canal alfa.

Luego sube esa carpeta a R2 (`website-8h349ieouv`) **en la raíz del bucket**, no bajo el prefijo de Payload:

```
gamma-12/v0.01/frame-001.webp
```

Y en `/admin`, sobre la máquina:

```
useRotationHero  ✓
sequencePath     gamma-12/v0.02
frameCount       90
```

Los dos campos **en la misma edición**: el hook bloquea cambiar el conteo dejando
la misma carpeta, así que guardarlos por separado falla.

**La regla que no se puede romper: carpeta nueva para cada versión.** Nunca sobrescribir. Estas URLs no llevan cache tag, así que reemplazar los archivos deja al CDN sirviendo media animación vieja y media nueva, distinto según la región, imposible de reproducir en local. Por eso la versión va en la ruta. El hook lo bloquea si cambias el conteo dejando la misma carpeta.

Numeración: `v0.01`, `v0.02`… mientras se prueba; `v1` cuando una sea la buena.

**Medido:** 60 fotogramas PNG son 60 MB; los mismos en WebP con alfa, 1,4 MB (24 KB de media). El peso dejó de ser una restricción.

Ojo, `gamma-12` no existe como máquina — los slugs son `gamma-10`, `gamma-13`, `gamma-13-double`. La carpeta y el slug no tienen por qué coincidir. Y lo que hay renderizado ahí **es la Gamma 13**: el FBX del fabricante es `Gamma13 blank.fbx` y la ficha es la de la Gamma 13. El nombre de carpeta se mantiene por ahora a propósito; renombrarlo es una decisión pendiente, no un olvido.

**Lo que hay para subir hoy** es `gamma-12/v0.02`: **90 fotogramas** con el recorrido nuevo — barrido de 140° centrado en el frente y zoom de 85 a 130 mm con meseta sobre producto y pantalla. Reemplaza a `v0.01`, que además se renderizó con la luz KEY excluida del render sin que nadie se diera cuenta. Carpeta local: `~/Documents/gamma12-v002-upload-1200/`.

Se genera con `scripts/blender/machine-sequence.py`, que corre headless sobre `~/template-turntable.blend` y **no guarda el `.blend`**:

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b ~/template-turntable.blend \
  --python scripts/blender/machine-sequence.py -- \
  --frames 90 --sweep-deg 140 --center-deg 47.5 --zoom 85:130 --hold 0.45 \
  --out ~/Documents/gamma12-v002/v0.02 --anchors ~/Documents/gamma12-v002-anchors.json
```

**Peso:** a 1600 px la secuencia da 4,8 MB, más del doble del objetivo de 2 MB. A 1200 px con calidad 80 da **2,3 MB** y a tamaño de pantalla no se distingue — el canvas del hero mide ~700 px. Por eso se sube la variante de 1200. Pesa más que la v0.01 por dos motivos reales: el zoom llena mucho más cuadro, y ahora se ve el producto a través del vidrio, que es detalle de alta frecuencia donde antes había vidrio plano.

### `anchors.json` — las cotas todavía no existen en el sitio

Junto a los fotogramas va un `anchors.json` (27 KB) que dice, fotograma por fotograma, dónde cae cada esquina del gabinete dentro de la imagen, en coordenadas 0..1 con origen arriba a la izquierda — o sea, listas para `left: x*100%`. Lo escribe el mismo script con `--anchors`, midiendo la malla, no los números de la ficha: el modelo **no está centrado en X** y una caja ideal deja las cotas corridas 17 cm.

Vive en R2 junto a los fotogramas a propósito: nace del mismo render y se invalida con la misma versión de carpeta.

**Nada en el sitio lo lee todavía.** Al subir la v0.02 vas a ver el hero girando con el zoom y **sin cotas** — eso es lo esperado, no un fallo. Falta la capa SVG sobre `RotationScrubHero` y el conmutador pulgadas/mm compartido con la tabla de specs. El prototipo funcionando está en `~/Documents/gamma13-preview.html`, generado con el armador de `scripts/blender/`.

## 3.b Cargar la ficha de la Gamma 13

Las cotas no tienen qué mostrar hasta que estos números estén en `/admin`, y son
independientes del código: se pueden cargar hoy.

Salen de `GAMMA 13 FT.pdf` (ficha del fabricante) y están **validados contra el
modelo 3D**: medido da 1995 × 1820 × 1012 mm contra 1956 × 1829 × 991 de la
ficha, menos del 2% en cada eje. Toda la diferencia restante era el topper, que
suma 431 mm de alto y vuela ~50 mm por lado.

| Campo | Valor |
|---|---|
| Dimensiones | 77" × 72" × 39" (1.956 × 1.829 × 991 mm) |
| Peso | 1.100 lbs / 499 kg |
| Estantes | 6, ampliables a 8 |
| Facings únicos | 120 |
| Capacidad | 800–1.800 según el producto |
| Pantalla | 21,5" táctil |
| Corriente | Toma dedicada 110V / 15 A |
| Merchant device | Nayax (no incluido) |
| Add-ons | Refrigeración, ADA, estante extra, módulo de efectivo, topper |

**El alto que le importa al operador es el total con topper: 2.337 mm (92").** Es
el número que decide si pasa por la puerta, y casi ningún competidor lo publica.
La ficha da el topper recomendado aparte (15" × 72" × 39").

**Publicar siempre los números de la ficha, nunca los medidos del modelo.** El
modelo trae tolerancias de CAD; la ficha es lo que el cliente publica y lo que el
operador va a medir contra su puerta. Las cotas se *ubican* con la geometría
medida y *muestran* el número de la ficha — son dos fuentes distintas a propósito.

## 4. Contenido que sigue en inglés en la página en español

Sin arreglar, y se ve:

- **«See machine»** en las tarjetas de modelo. El `defaultValue` del campo `ctaLabel` es inglés y se guardó igual en los dos locales, así que el respaldo traducido nunca se usa. Se corrige a mano en el documento en español.
- **Etiquetas de specs largas** tipo `DIMENSIONES (ALTO×ANCHO×PROFUNDIDAD)` ocupan la fila entera de datos. Están en la colección `machines`; conviene una versión corta.

## 5. El gate sigue puesto

`GATED_PATHS=/machines` oculta la sección a quien no tenga sesión de Payload. Con eso puedes componer las páginas con calma antes de que nadie las vea.

Dos cosas al respecto:

- **Levantarlo es una decisión de lanzamiento**, y necesita redespliegue: es una variable de entorno porque corre en middleware, donde leer un global costaría una consulta por request.
- **Oculta, no protege.** Comprueba que exista la cookie `payload-token`, y una cookie se fabrica a mano. Está bien para contenido no aprobado; no lo está para nada confidencial.

## Una alternativa a hacerlo a mano

Todo lo de arriba puede hacerlo Claude en una sola pasada, y en dev o en producción indistintamente. El flujo, para no reinventarlo la próxima vez:

1. **Tú te logueas** en `/admin` desde Chrome. Ese paso es tuyo: Claude no introduce credenciales.
2. **Los assets suben con Chrome**, conduciendo la interfaz de subida — es lo que no se puede hacer con una petición suelta.
3. **El resto va por `fetch` desde esa misma pestaña**, aprovechando la cookie `payload-token` que dejó tu login. La API REST de Payload acepta esa sesión, así que crear la página, colocar los bloques, marcar los `featured` y corregir los textos son unos cuantos `PATCH`.

Es bastante más rápido y menos propenso a error que teclear cinco veces lo mismo. **Con dos condiciones que no son opcionales:**

- **Cada escritura por locale devuelve el `id` de cada item del array.** Es el gotcha de `docs/patterns/payload-localized-arrays.md`: un `PATCH ...?locale=es` sin los `id` borra el contenido del otro idioma y responde `200 OK`. En producción eso es pérdida de datos silenciosa.
- **En producción, primero lee y enseña lo que va a cambiar.** El paso de aplicar se aprueba antes, no después.

Con el gate todavía puesto y los borradores activos en `machines`, hay margen para hacerlo sobre documentos publicados sin que nadie de fuera lo vea.

## Una alternativa a hacerlo a mano, y en qué orden

Todo lo de arriba puede hacerlo Claude, pero **el orden importa: los archivos van en producción, el resto en local.** La razón es que en dev la subida no funciona —los medios viven en R2 y el entorno local no escribe ahí— mientras que las peticiones sí funcionan igual en los dos sitios.

Así que la secuencia es:

**1. Lo que necesita subir un archivo, en producción.** Tú te logueas en `/admin` desde Chrome —ese paso es tuyo, Claude no introduce credenciales— y Claude conduce la interfaz de subida. Es lo único que no se puede resolver con una petición.

**2. Dump de producción y restore local.** `./scripts/dump-prod.sh` y `./scripts/restore-prod-dump.sh`, para bajar el estado con los assets ya referenciados. Y después, siempre, `node scripts/move-monday-to-sandbox.mjs --apply`: el dump trae los board ids del cliente.

**3. Todo lo demás, en local.** Crear la página, colocar los bloques, marcar los `featured`, corregir los textos en español. Eso va por `fetch` contra el `/admin` local aprovechando la cookie `payload-token` del login — la API REST de Payload acepta esa sesión.

Trabajar en local para esta parte tiene dos ventajas sobre hacerlo en producción: **se puede equivocar sin consecuencias**, y deja los scripts probados. Una vez funcionan contra la base local, aplicarlos en producción es repetir algo que ya salió bien en vez de improvisar sobre datos reales.

**Dos condiciones que no son opcionales:**

- **Cada escritura por locale devuelve el `id` de cada item del array.** Es el gotcha de [`docs/patterns/payload-localized-arrays.md`](./patterns/payload-localized-arrays.md): un `PATCH ...?locale=es` sin los `id` borra el contenido del otro idioma y responde `200 OK`. Silencioso, y en producción es pérdida de datos.
- **En producción, leer y enseñar antes de escribir.** El paso de aplicar se aprueba antes, no después.

## Lo que sigue en código, no en `/admin`

Anotado para que no se pierda entre sesiones:

- **Pestañas en `Machines`** — hoy son diecinueve campos planos en una sola columna, sin las pestañas que sí tiene `Pages`. Diseñado en `openspec/changes/machine-page-blocks/design.md`, fase 1, sin empezar. Los campos no cambiarían de nombre ni de sitio en la base.
- **`fix/restore-script-connection-guard`** — rama local sin PR. Hace que `restore-prod-dump.sh` avise de conexiones abiertas en vez de morir después del backup dejando la base intacta.
- **`spike/rotation-frames-70`** — rama local sin pushear, ya superada por lo que entró en #239.
- **Los dos bails de `Form/Component.tsx`** siguen en `EXPECTED` de `scripts/validate-react-compiler.mjs`, marcados como deuda nuestra y no como limitación del compilador.
- **`docs/blocks/README.md`** se sigue escribiendo a mano y está desactualizado; debería derivarse del `Completeness:` de cada README, como ya hace `scripts/generate-context-index.mjs` con los índices de contexto.
- **Voz de marca y audiencias** son esqueletos con preguntas en `docs/business/`, pendientes de cerrar con el cliente.
