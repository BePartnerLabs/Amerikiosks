# Revisión de diseño de las filas — decisiones cerradas

> Complementa `design.md`. Donde este documento contradice al otro, manda este:
> `design.md` se escribió antes de saber que el cliente puede producir un asset
> nuevo, y dos de sus restricciones se caen con eso.

---

## 1. La repetición entre el lineup y las filas

**Decidido: split por registro.** Aprobado por el usuario.

Hoy los dos bloques muestran las mismas tres cadenas por familia, uno debajo del
otro:

| | `machineLineup` (escena pinneada) | `machineFamilyRows` (filas) |
|---|---|---|
| eyebrow | `family.name` | badge de conteo |
| título | `featured.title` | `family.name` |
| texto | `featured.description` | `featured.title` + `featured.description` |

No es un parecido: es la misma llamada a `featuredHighlight(family)` en los dos
`Server.tsx`. La fila termina leyéndose como el índice de texto de lo que acabás
de scrollear.

### El dato que decide

Los dos campos existen y están escritos en registros distintos. Medido contra la
base restaurada, en `es`:

| Campo | Ejemplo (Alpha) | Largo | Registro |
|---|---|---|---|
| `tagline` | «Comidas recién calentadas, preparadas bajo demanda mediante tecnología de calentamiento avanzada para entornos de servicios de alimentación.» | ~20 palabras | Posicionamiento: **para qué es** esta familia |
| `highlights.featured` | «Calentamiento rápido 360°» / «El módulo de microondas/horno integrado calienta la comida en ~50 segundos.» | 3 + 12 palabras | Capacidad concreta, con número |

Cada formato pide uno de los dos. La escena pinneada es tipografía grande sobre
un render oscuro, con una familia por vez y todo el tiempo del scroll: aguanta —
y necesita— un párrafo de posicionamiento. La fila es densa, comparativa y hay
cinco juntas: lo que sirve ahí es el dato duro que distingue una familia de la de
al lado.

### Qué cambia

**`MachineLineup`**, por familia:

- `<h2>` → `family.name`
- `<p>` → `family.tagline`
- **el eyebrow se va.** Hoy lleva `family.name`; con el nombre promovido a `h2`,
  un eyebrow repitiéndolo sería exactamente el bug que estamos arreglando.

Se gana además jerarquía: cinco `h2` que son nombres de familia describen la
página mejor que cinco `h2` que son nombres de característica.

**`MachineFamilyRows`**: no cambia. Se queda con la característica destacada.

### Consecuencias que hay que mirar

- `MachineLineup/Server.tsx:68` mete `family.featured?.title` como `description`
  del `ItemList` de schema.org. Pasa a `tagline`, que es más apto para ese campo.
- `featuredHighlight` queda con **un solo consumidor**. La utilidad se queda —
  la lógica de fallback a `items[0]` vale aislarla y testearla —, pero su
  docstring dice *«Shared because two blocks on /machines make the same choice»*
  y eso deja de ser verdad. Reescribirla o queda documentando un acuerdo que ya
  no existe.
- El `tagline` también es el blurb de la card de `ModelLines` en el home. Es
  repetición **entre páginas**, y es deseable: la línea con la que se presenta
  una familia debería ser la misma en todos lados. El problema era la adyacencia,
  nunca la reutilización.
- `MachineLineup/Server.tsx` no tiene `select` — trae el documento entero a
  `depth: 1`, así que `tagline` ya viene. No hace falta agregar nada; y si
  alguien le pone un `select` alguna vez, `tagline` tiene que estar en la lista.

---

## 2. El volado

**Decidido: sí hay volado, con un asset nuevo — no recortando el que existe.**

El usuario señaló que el volado **ya funciona** en las cards de `MachineModels`,
al pie de la misma página, y ofreció producir la máquina recortada a ras.

### Por qué ahí funciona y acá no

No es CSS. Es el asset:

| | `MachineModels` (funciona) | `machine-families.thumbnail` (no) |
|---|---|---|
| Archivo | render de modelo, 2640×3300 | 1920×1920 |
| Aspecto | 0.80, la máquina llena el cuadro | 1.00 de lienzo; la máquina ocupa **29–53%** del ancho |
| Resultado | `contain` limitado por alto → vuela | `contain` limitado por ancho → entra entera |

La mecánica que `MachineModels` documenta es correcta y se copia tal cual. Lo
único que le falta a las filas es un archivo con la máquina a ras.

### El asset va en un campo nuevo, no encima de `thumbnail`

`design.md` planteaba recortar `thumbnail` desde `/admin`. Con un asset nuevo del
cliente esa vía queda descartada, y con ella **los tres riesgos que la rodeaban**:

- ya no es destructivo — `thumbnail` no se toca;
- ya no le mueve el encuadre a la escena pinneada, que consume `thumbnail` a
  720px con su animación calibrada;
- ya no depende de producción — un archivo nuevo se sube cuando esté.

Cuesta un campo nuevo en `machine-families` y su migración aditiva. `design.md`
decía «No se agregan campos»; esa restricción existía **solo** para no tener que
recortar en producción, así que se cae con el motivo que la sostenía.

**Nombre propuesto:** `rowImage`. Ya hay `thumbnail`, `hoverThumbnail` y
`heroLineupImage`; el nombre tiene que decir dónde se usa, no cómo se ve.

**Fallback:** si una familia no tiene `rowImage`, la fila usa `thumbnail` y esa
fila no tiene volado. El bloque sale antes que los archivos. La contra, dicha
claro: una lista mezclada se ve despareja mientras dure, porque la máquina sin
recortar se renderiza visiblemente más chica que sus vecinas.

### Spec del archivo, para pasarle al cliente

- **Uno por familia.** No reemplaza ningún archivo existente.
- **PNG con transparencia** (RGBA).
- **Recortado a ras en los cuatro lados**: cero margen transparente. El borde de
  abajo es el que se apoya en la base del card — si sobra un píxel, el volado se
  descalibra.
- **Vertical, aspecto natural de cada máquina.** No forzar un lienzo común: Zeta
  es angosta y Kappa ancha, y que se vean así es correcto. El rango esperable es
  0.35–0.75 (ancho ÷ alto).
- **Lado largo ≥ 1600px**, para que `small` (600) y `medium` (900) sean bajadas
  reales y no ampliaciones.
- **Misma cámara que los thumbnails actuales** — frontal o tres cuartos, igual
  que la escena de arriba. Si cambia el punto de vista, la página parece dos
  sesiones de fotos distintas.
- **Sin sombra de piso quemada en el PNG.** El CSS aplica su propio
  `drop-shadow`; una sombra incluida se duplica y además rompe el recorte a ras,
  porque la sombra se extiende más allá de la máquina.

---

## 3. Geometría de la fila

Los números salen de la restricción de `contain`, no del gusto: para que el
volado sea real, la caja tiene que ser **más ancha** que `aspecto × alto`, y ahí
el alto pasa a ser el límite.

| Variable | Valor | De dónde sale |
|---|---|---|
| `min-height` de la fila | `11rem` | sin cambio |
| Volado | `2.5rem` | 22% del alto de la fila — la misma proporción que `MachineModels` usa (4rem sobre 18rem) |
| Alto de la caja | `calc(100% + 2.5rem)` | contra la fila real, no contra un alto asumido: la fila es `min-height` y crece con su texto |
| Ancho de la caja | `11.5rem` | `0.85 × 13.5rem`. El 0.85 es el mismo margen que `MachineModels` deja sobre su aspecto real, y cubre hasta una máquina de aspecto 0.85 — la más ancha hoy es Kappa con 0.66 |
| `gap` de la lista | `3rem` | **piso duro: volado + aire.** La máquina se mete hacia arriba; con un gap menor aterriza sobre el card anterior en vez de en el hueco |

El bloque crece ~8rem en total (5 filas + 4 gaps de 3rem en vez de 1rem). Es el
precio del gesto, y el gesto es el mismo que cierra la página abajo.

El ancho de la caja baja de `13rem` a `11.5rem`, así que el texto gana lugar.

### Sin volado en móvil

Debajo de `46rem` la caja pasa a `6rem` y la fila deja de tener `min-height`. Un
volado de 2.5rem sobre una máquina de 96px chocaría con la línea del badge y se
comería el gap. **El volado va a `0` en la container query** — así ninguna otra
regla necesita condicional — y la máquina se apoya a ras de la base de su caja.

El volado es un gesto de desktop. Abajo de 46rem la fila es para escanear.

### La trampa de `square`, corregida

`getBestMediaUrl` devuelve la primera size que cubre el target:
`thumbnail` (300) → `square` (**500×500, recorte cuadrado forzado**) → `small`
(600) → …

`design.md` la describe como un techo de 300 y por eso `ROW_IMAGE_WIDTH` es 250.
En realidad **es un pozo, no un techo**: la única zona venenosa es 301–500. Pedir
501–600 cae en `small`, que respeta el aspecto.

Con la caja en `11.5rem` (184px) el target correcto pasa a ser **550 → `small`
(600px)**. A 250 se caía en `thumbnail` (300px), que para una máquina que ahora
sobresale del card y es lo primero que se mira queda blanda en pantallas 2x.

Lo que se paga es ancho de banda de origen y CPU de resize, no bytes del
usuario: `next/image` reoptimiza igual y el peso que baja el visitante lo fija
`sizes`, no el `src`. Es exactamente el trade que documenta el docstring de
`getBestMediaUrl`.

**El comentario de `ROW_IMAGE_WIDTH` hay que reescribirlo**, no solo cambiar el
número: hoy explica una regla equivocada, y es la clase de comentario que hace
que el próximo lo «arregle» de vuelta a 350.

---

## 4. El CTA de la fila

**Decidido: `bp-btn--outline` en `normal`, `bp-btn--ghost` en `soon`.**

Hoy dice `bp-btn--secondary`, que el DS documenta pero el `frontend.css`
vendorizado de este repo **no define**. Los modificadores que existen acá son
`--primary`, `--outline`, `--outline-solid`, `--ghost` y `--dark`; el `.bp-btn`
base ya es el botón lleno con `--bp-primary`. O sea que hoy las cinco filas
rematan en **cinco botones primarios llenos**, apilados.

No se porta `--secondary`. El peso que falta ya existe:

- **Toda la fila es el link.** El botón es una señal de afordancia, no el blanco
  del clic; no necesita peso primario.
- Cinco outlines se leen como cinco opciones equivalentes — que es lo que son,
  elegís una familia. Cinco botones llenos se leen como cinco pedidos urgentes, y
  compiten con la acción primaria real de la página.
- `--ghost` se queda para `soon`: sigue un escalón por debajo, pero ahora el
  escalón es chico y honesto en vez de un salto desde un botón lleno. Su `::after`
  con la flecha refuerza que esa fila **sigue entrando** a la familia, que es
  justamente lo que `design.md` argumenta.

Los colores se fijan con los canales Level 2 del DS desde el bloque
(`--outline-color`, `--ghost-color`, `--ghost-arrow-color`), nunca tocando el CSS
del componente.

---

## 5. Cerrado sin cambios

**Acentos: uno solo, el que ya está.** El `styles.css` implementado usa
`--ak-accent` para todas las filas y así se queda. El array `ACCENTS` es un
recurso de *carousel* — cards adyacentes, una visible por vez. Cinco acentos en
una pila vertical convierten una lista de comparación en una carta de colores, y
el ojo empieza a buscar qué significa el violeta.

**El estado `soon` no cambia de geometría.** La diferencia entre `normal` y
`soon` es copy y peso del CTA, nada más. La máquina de Delta vuela igual que las
otras: la familia existe, solo que todavía no tiene modelos publicados. Apagarla
o achicarla se leería como «rota», no como «pronto».

---

## Fuera de alcance

`/machines/[family]` no se toca. Confirmado por el usuario: «no hemos llegado
allí».
