---
title: El visado, y por qué se decidió cada cosa
read_when: Se prepara la sesión de visado con el cliente, o se toma una decisión sobre /machines que habrá que defender ahí.
enforced_by: nada — se mantiene a mano, una entrada por decisión
lifespan: vive mientras haya visados pendientes; cada sección se cierra cuando el cliente valida
---

# El visado

**Qué es**: una sesión con el cliente donde se le muestra el trabajo terminado y
él lo mira. No es una aprobación formal con consecuencias contractuales, y no es
una puerta que congele el alcance.

**Cómo se trabaja de acá hasta esa sesión**: se implementa según el criterio de
quien dirige el proyecto, sin pedirle permiso al cliente para cada decisión. La
validación la lleva él a la reunión.

**Qué obliga**: que cada decisión tenga escrito **por qué** se tomó, para poder
defenderla en esa sesión. Un «nos pareció mejor» no se sostiene frente a un
cliente que pregunta; «lo decidimos por esto, y la alternativa tenía este costo»
sí.

Por eso este documento no es una lista de tareas sino un **registro de
decisiones**. Cada entrada contesta tres cosas: qué se decidió, por qué, y qué
responder si el cliente empuja en la dirección contraria.

## Lo que este documento NO es

- No es el Definition of Done. Ese dice cuándo un bloque está terminado; este
  dice por qué está hecho como está. Ver
  [`definition-of-done.md`](./definition-of-done.md).
- No es un registro de lo que falta. Eso vive en
  [`post-release-admin.md`](../post-release-admin.md) y en
  [`machines-data-audit.md`](../machines-data-audit.md).
- No sustituye al `design.md` de cada cambio. Ahí va el diseño técnico; acá va
  el argumento que se le da al cliente.

---

# Visado 1 — `/machines` y sus dos niveles

Alcance: `/machines`, `/machines/[family]`, `/machines/[family]/[slug]`, en los
dos idiomas.

## El carrusel de familias no entra

**Decidido**: `machineFamilyCarousel` no se coloca en `/machines`. El bloque
existe y queda disponible.

**Por qué**: con las filas de familia y sus características principales la
página ya se lee completa. Un índice arriba del detalle repite la misma
información a dos profundidades, y los dos solo se sostienen mientras estén a
profundidades distintas.

**Si el cliente lo pide**: sigue siendo una buena idea **para el home**, donde no
compite con las filas. El bloque ya está construido, así que moverlo ahí es
colocarlo, no desarrollarlo.

**Corolario**: el `eyebrow` de las filas se queda cargado. La instrucción de
vaciarlo aplicaba solo si el carrusel entraba — dos eyebrows seguidos se leen
como dos secciones inconexas.

## Las pestañas de la ficha de máquina en `/admin`

**Decidido**: tres pestañas — Hero, Detalles de la máquina, SEO — con `name`,
`slug` y `family` **fuera** de las pestañas.

**Por qué**: eran diecinueve campos planos en una sola columna. `family` es
requerido y decide la URL; un campo obligatorio escondido detrás de una pestaña
es un guardado que falla donde el editor no está mirando.

**Por qué no hay pestaña Content**: su único campo sería el `layout` de bloques,
que es otra tarea. Una pestaña vacía es una pestaña que el cliente abre y no
entiende.

**Por qué `brochure` está en Hero y no en Detalles**: parece un adjunto, pero lo
que hace es mostrar u ocultar el botón de descarga del hero. El editor que
quiere sacar ese botón lo busca donde vive el botón.

**Costo para el cliente**: ninguno. `migrate:create` no detecta cambios de
esquema — los campos no cambiaron de nombre ni de sitio en la base, sólo se
agruparon en la interfaz. Verificado con `pg_dump` de las 25 tablas `machines*`:
datos y esquema idénticos antes y después.

## El español de `/machines` estaba vacío, no en inglés

**Encontrado**: los bloques se crearon con el selector en `en`, así que la fila
del locale `es` **nunca existió** y Payload caía al idioma de respaldo. La página
en español publicaba «3 models in line», «Coming soon» y «See machine».

**Por qué no se vio antes**: en `/admin` los campos se ven llenos, porque el
respaldo se renderiza. No hay ningún aviso.

**Qué se hizo**: se escribieron los siete textos del bloque de filas y los tres
del carrusel de modelos, mandando el `id` de cada bloque — omitirlo borra el otro
idioma y responde `200 OK`.

> ### ⚠️ PENDIENTE EN PRODUCCIÓN — 2026-09-17
>
> **Esa reparación se hizo sobre la base local y nunca llegó a producción.** El
> script `scripts/fill-machines-es-locale.ts` se niega a correr si
> `DATABASE_URI` no apunta a localhost, que es correcto — pero significa que lo
> arreglado fue una copia, no el sitio.
>
> Lo destapó el dump del 2026-09-17: en `/es/maquinas` las filas siguen diciendo
> «Our lines», «Every line, and what each one does best» y «2 models in line», y
> el carrusel «The range» y «See machine».
>
> **El patrón dice exactamente dónde está el problema**: lo que sale de la
> colección `machine-families` está en español —el CTA por familia, «Explora
> nuestros modelos Alpha»— y lo que sale de los **campos del bloque** está en
> inglés. Y el chip de clase de venta es lo único traducido de esas filas,
> porque es el único texto que viene de `messages/es.json` y no del CMS.
>
> Ojo con una confusión fácil: el «See machine» del carrusel **no** es el
> respaldo de next-intl. `es.json` tiene «Ver la máquina» y nunca se usa, porque
> el `ctaLabel` del bloque le gana. El defecto está en la fila del locale `es`
> del bloque, no en los mensajes.
>
> Se corrige cargando los diez textos en el `/admin` de producción. Los valores
> están en [`post-release-admin.md`](../post-release-admin.md), §6.2.

**Verificado — en local, no en producción**: `1 modelo en la línea` en singular
para Zeta, que tiene un solo modelo, y cero cadenas en inglés en el barrido de
la página.

## Publicar las páginas en borrador es decisión de lanzamiento

**Encontrado**: `/machines` daba 404 porque el documento está en borrador. La
última versión publicada es anterior a que existiera el bloque de filas: todo el
trabajo estaba cargado y sin publicar. No es solo esa página — **diez de
veinticuatro** están en borrador, incluido el cluster de audiencias entero.

**Decidido**: se publican **en local** para poder revisarlas. En producción no
se toca.

**Por qué**: qué se publica y cuándo es una decisión de lanzamiento, no técnica.
Publicar el cluster de audiencias pone frente a visitantes páginas que nadie
aprobó.

## Los datos de las máquinas contra los brochures

**Estado**: las cinco familias están completas y traducidas; ocho de diez
máquinas tienen seis specs en los dos idiomas. **Ninguna cifra inventada**:
donde la ficha no da un número, la base tampoco.

**Lo que hay que llevar a la sesión como pregunta, no como problema**: el
catálogo nuevo del cliente tiene diez modelos que **no son los mismos diez** que
tiene el sitio. Alpha 10 y Alpha 13 se fusionaron en un «Alpha Hot Food», apareció
**Sigma Frozen** —familia nueva, clase congelado— y los dobles perdieron el `13`
del nombre.

Y hay cifras que no coinciden. La que más pesa: **Gamma 13 figura con 800 a 1.200
unidades en la comparativa nueva y con 800 a 1.800 en el sitio y en la ficha
vieja**. No es un redondeo, es un techo distinto. Publicar menos capacidad de la
real cuesta ventas; publicar más de la real cuesta una devolución.

El detalle completo está en [`machines-data-audit.md`](../machines-data-audit.md).

## El hero rotatorio de Kappa 13 se ve sin cotas

**Estado**: los 90 fotogramas están en R2 y el hero gira. El `anchors.json` da
404, así que las cotas no se dibujan. El `catch` se lo traga sin error visible.

**Por qué no se puede resolver de este lado**: el `anchors.json` se genera
midiendo las mallas de la escena de Blender y descartando el topper por altura.
De las imágenes no sale: una silueta da cuatro números y el overlay necesita
ocho puntos proyectados. Está pedido al animador.

**Si el cliente pregunta**: la animación funciona; lo que falta son las cotas
sobre ella, y dependen de un archivo que produce quien tiene la escena 3D.

## El color de las familias dice qué vendés, no en qué orden están cargadas

**Decidido**: el acento de cada familia deja de salir de su posición en un array
y pasa a salir de su **clase de venta** — las cinco filas con las que el cliente
organiza su propia hoja comparativa. Cinco tonos: congelado azul, refrigerado
cian, ambiente de alto volumen verde, comida caliente naranja, espacio chico
violeta. Cuando dos familias comparten fila, un paso de rampa las separa: hoy
solo pasa con Zeta y Delta, que son el mismo violeta a dos profundidades.

La especificación completa —tonos, contrastes medidos, derivación en `oklch` y
las cuatro pantallas donde se aplica— está publicada como artifact:
<https://claude.ai/code/artifact/d7a6025f-c6b6-4004-b5a2-3dc9cbf623a8>

**Por qué**:

1. **El color trabaja o no está.** Seis tonos decorativos ayudan a distinguir
   tarjetas y nada más. Atados a la clase le contestan al visitante la pregunta
   con la que llega —«¿esta máquina sirve para lo que yo vendo?»— antes de que
   lea una ficha. Es además la instrucción textual del cliente en
   `BROCHURE-2026-09-COMPARATIVA.md`: «empezá por lo que vendés y dónde va, no
   por un número de modelo».
2. **Un color que sale de la posición es un color que el cliente puede romper.**
   Reordenar familias en `/admin` es una acción legítima y sin advertencia, y
   hoy les cambia el color a todas.
3. **Los seis pastel actuales no son un punto de partida, son un bug de
   accesibilidad.** No se usan solo como fondo: en `ModelLines` son el color de
   **texto** del eyebrow y del «Explore». Medidos contra el blanco de la
   tarjeta, los seis fallan AA — el amarillo `#ffd166` da 1.44 contra un piso de
   4.5. No hay ninguno que rescatar.

**Por qué clase de venta y no temperatura pura**: por temperatura, Gamma, Delta
y Zeta son las tres «ambiente» y quedaban del mismo color — tres de seis
familias indistinguibles justo en la grilla donde se elige. Por clase de venta
son dos filas distintas y la única colisión que queda es Zeta con Delta. Cuatro
de los cinco tonos igual forman un arco de temperatura, de naranja a azul; el
violeta está **deliberadamente fuera del arco** porque «espacio chico» es un
tamaño, no una temperatura, y ni el propio cliente usa un eje único.

**Por qué naranja y no rojo para «caliente»**: `--ak-accent` es coral `#D41A3A`
y es lo único en el sitio que significa «hacé clic». El naranja de la clase
caliente es el tono más cercano al coral de los cinco, y por eso también es el
menos saturado en relación a su tono: croma 0.14 contra 0.21. El coral sigue
siendo lo más intenso de cualquier pantalla.

**Si el cliente dice «yo quiero que cada línea tenga su propio color»**: las
tiene — seis familias, seis tonos distintos en pantalla. Lo único que cambia es
de dónde sale el tono. Zeta y Delta comparten violeta porque comparten la fila
que él mismo escribió. Si aun así quiere seis tonos sin relación, el costo
concreto es que cuando entre la séptima familia hay que inventar un séptimo tono
que no choque con los otros seis ni con el coral, y esa conversación se repite
con cada alta; con clases, la séptima familia entra en una fila que ya existe.

**Si dice «hagámoslo puro por temperatura, que es más claro»**: se pierden dos
cosas. Tres familias quedan del mismo color en la pantalla de elección, y
«espacio chico» —una de las cinco puertas de entrada de su propia comparativa—
se queda sin color propio.

**Si dice «los colores de ahora ya me gustan»**: son los que viene viendo y eso
pesa, pero hay visitantes que no los leen. Lo que sí se conserva es el carácter:
los tonos nuevos mantienen el naranja, el azul, el verde y el violeta actuales;
lo que cambia es la profundidad, para que el texto se lea.

**Si pregunta «¿y si mañana quiero cambiarle el color a una familia?»**: se
cambia desde `/admin` eligiendo otra clase en una lista cerrada, no escribiendo
un color. Un selector de color libre deja entrar tonos fuera de paleta y sin
contraste, que es exactamente cómo se llegó a la situación actual.

**Dónde se aplica**: las filas de familia (reemplazo directo del array), un chip
de clase nuevo —sin él el color nunca enseña su regla—, el escenario del hero de
ficha (ver la enmienda abajo), y el carrusel de modelos. En el carrusel de **familias** el color va solo en el chip:
seis tarjetas con seis nombres de colores distintos se leen como ensalada. El
foco de teclado no se tiñe nunca.

**Costo para el cliente**: dos campos nuevos en `MachineFamilies` (`salesClass`
como select cerrado, y `colorStep` con valor 0 salvo en Delta) y su migración.
Ningún dato existente cambia de nombre ni de lugar.

### Enmienda — el escenario del hero se aclara

**Qué cambió**: la primera versión de esta decisión teñía apenas un 13% del tono
sobre el navy, y lo justificaba con que los renders son máquinas blancas sobre
transparencia que se borran sobre fondo claro. **Esa premisa era falsa** — venía
de un comentario desactualizado en `src/components/MachineHero/styles.css`.

**Decidido**: el escenario del hero va **claro**. Gris muy claro arriba, el color
de la clase acumulándose en el piso del cuadro, y la intensidad la maneja el
scroll: entra mientras la máquina gira y se retira al salir. El *bloom* va de
**8% en reposo a 55% en el pico**.

**Por qué el color va en el piso y no en el medio**: probado sobre los renders
reales, un degradado con el color en la parada central lo pone exactamente donde
está la máquina, que lo tapa — el color sólo asoma como un ribete a los costados.
En el piso sí se ve, y encima hace de apoyo: la máquina queda parada en un
entorno en vez de flotar.

**Por qué el tope NO es blanco puro, sino `steel-50` (`#F3F6F7`)**: sobre blanco
puro el flanco izquierdo de la Kappa 13 —que es casi blanco— se disuelve en el
fondo y la silueta se pierde en la esquina superior. Con `steel-50`, que ya es
token de marca, el borde vuelve. A simple vista los dos son «blanco»; la
diferencia es tener silueta o no tenerla. **El efecto es dramático en la Kappa y
sutil en la Gamma**, al revés de lo esperado — razón de más para que el sistema
tolere los dos renders no llegando nunca al blanco puro.

**Por qué el pico se queda en 55% y no llega al 100%**: pasado el 40% el color ya
no compra legibilidad, y un escenario saturado de 100 vh le saca protagonismo al
coral, que es lo único de la página que significa «hacé clic».

**Consecuencia obligatoria — las cotas se invierten**. El overlay está escrito
para fondo oscuro (número blanco con halo navy, geometría en coral) y el propio
comentario lo dice: «el acento sobre el navy del escenario». Medido sobre el
escenario claro, el número blanco da **1.09 a 2.10** y el coral cae a **2.50**
sobre el piso de color, por debajo del 3:1 mínimo para un gráfico. Van en navy
(8.38 a 16.17 en las tres zonas), con halo blanco alrededor del número y sin el
`drop-shadow` de acento: un resplandor se lee sobre oscuro, no sobre claro.

**Lo que se probó y se descartó**: la sombra de contacto. Se lee como mancha
separada, y la Zeta 2 montada en pared **no tiene piso**. El piso de color hace
el trabajo de apoyo sin afirmar un suelo que a veces no existe.

**Dónde va pintado**: en el `background` de `.ak-machine-hero__sticky`, que es el
**padre** del canvas. Por construcción no puede repetir el halo que se quitó en
agosto de 2026, que era un hermano posterior en el DOM y por eso teñía la máquina
en vez de iluminar el escenario.

**Dos arrastres**: el esqueleto de carga hoy es navy, con un comentario que
explica que un esqueleto pálido destella como panel blanco sobre el escenario
oscuro — invertido el escenario, el que destella es el navy. Y la misma premisa
falsa justificaba otros navys del sitio, el escenario de `/machines` entre ellos:
**hay que mirarlos, no darlos por vencidos de arrastre**.

---

## El contenido comercial de los brochures, y los iconos que lo hacen legible

**Decidido**: lo que hoy vive solo en el PDF no entra como un bloque, entra en
**cuatro lugares**, porque son cuatro promesas que el comprador necesita en
cuatro momentos distintos.

1. **La grilla de hardware «Viene de serie»** — en el `highlights` que cada
   máquina ya tiene. Es lo único de todo este material que cambia modelo por
   modelo.
2. **La plataforma y la oferta de marca** — una sección de línea sobre navy,
   alimentada por un **global** nuevo de Payload, como `Header` y `Footer`.
   Idéntica en los diez modelos, un solo lugar de edición.
3. **Los términos comerciales** (entrega, garantía, planograma, soporte) — una
   tira arriba del CTA, en la ficha y en la familia. Misma fuente que el punto 2:
   se repite el render, no la carga.
4. **«Mandanos una muestra o sus dimensiones y te confirmamos la configuración de
   carriles»** — es el copy del CTA de la ficha, no una característica.

La especificación completa —el mapeo de los 32 iconos dibujados con su path
real, y las maquetas de los tres tratamientos— está publicada como artifact:
<https://claude.ai/code/artifact/f4de4edf-1ef6-42f4-ba4d-0c17a3f78b23>

**La regla que ordena todo esto**: **el bloque de línea lleva la promesa; el
número vive en la spec.** La sesión de contenido dejó anotado que un kit de serie
que diga «pantalla de 21.5"» miente en tres máquinas (Zeta 32", Delta 10", Alpha
10 49"), y que «doble cerradura» y «cámaras» mienten en la Zeta 2. Con esta regla
no hace falta ningún mecanismo de excepción: el bloque dice «pantalla táctil»,
«cerradura de seguridad» y «videovigilancia integrada» —cierto en las diez— y el
tamaño, el tipo de cerradura y la cantidad de cámaras salen de `specs`, que ya es
por máquina y ya está correcto.

**Dos correcciones al diagnóstico de partida**:

1. **No es que nadie eligió un icono: es que no hay dónde mostrarlo.** El campo
   existe, el picker existe y el set existe, pero `Highlights.tsx` y
   `FamilyHighlights.tsx` **nunca leen `item.icon`**. Cargar los veinte iconos
   hoy dejaría las páginas exactamente iguales. Lo que falta es una línea por
   componente — y `<Icon>` usa `fill="currentColor"`, así que el acento de la
   clase de venta entra sin tocar el componente.
2. **Los ocho iconos del brochure no son los mismos ocho en cada brochure.** El
   de Gamma abre con master + slave, que solo tiene la Double; Sigma cambia
   cuatro casillas; Zeta pone pantalla vertical, publicidad y ADA; Alpha pone el
   horno. **La grilla es del modelo, no de la línea**, y eso es lo que decide que
   viva en `highlights` y no en un bloque compartido.

**Por qué grilla y no tarjetas**: el 4×2 del brochure funciona, pero la ficha ya
tiene `Highlights` en tarjetas y `Capabilities` en tarjetas debajo. Un tercer
campo de cajas convierte la página en un archipiélago. Icono, título y una línea
separados por filetes de un pixel dan la densidad de hoja técnica, que es el
registro del brochure.

**Por qué la sección de línea va sobre navy**: no habla de esta máquina, habla de
lo que hace la empresa alrededor de cualquier máquina. El cambio de fondo lo dice
sin explicarlo, y usa la derivación `glow` que el sistema de color ya definió
para fondo oscuro. Sobre blanco, los iconos del modelo toman `ink`; sobre navy,
los de la línea toman `glow`.

**Los tres que no tienen icono honesto**, y se dicen en vez de forzarse:

- **Carril de espiral** — no existe espiral, coil ni auger en todo Material
  Symbols. `cyclone` se lee como huracán. Un solo ítem, «carriles mixtos», con
  `conveyor_belt`, y la espiral nombrada en el texto.
- **Montaje en pared o base rodante** (Zeta) — son dos tablas de dimensiones, no
  una característica. Le corresponde `Dimensions`.
- **Vista de flota** — no hay icono de flota; `devices` es lo más cercano y
  honesto.

**Si el cliente dice «todo eso ya está en el brochure, ¿para qué repetirlo?»**:
el brochure lo lee quien ya habló con alguien; el sitio lo lee quien todavía no
escribió, y es ahí donde decide si escribe. La máquina se puede comparar con la
de un competidor mirando dos tablas; la entrega, la garantía, el planograma y el
software **no se pueden comparar**, y eso solo juega a favor si está publicado.

**Si dice «ponelo en todas las fichas, así no se pierde»**: diez copias del mismo
texto son diez lugares donde editar cuando cambie la garantía y nueve chances de
que uno quede viejo. El global se edita una vez. Lo que sí se repite a propósito
son los cuatro términos arriba del formulario, porque ahí el lugar importa.

**Si dice «usemos los ocho iconos del brochure tal cual en todas las máquinas»**:
esos ocho incluyen master + slave, que solo tiene la Double, y no incluyen el
horno, el copo de nieve ni la pantalla de 32". Copiarlos a las diez fichas
publica hardware que cuatro máquinas no traen — el mismo tipo de error que la
Zeta 2 ya tiene hoy con su cerradura electrónica.

**Costo**: **29 iconos nuevos** en `icons.ts`; tres ya están
(`precision_manufacturing`, `campaign`, `school`). Cada uno es un `<path d>`
copiado de un archivo que ya está en `node_modules` — mecánico, sin decisiones.
El set pasa de 52 a 81, y de paso gana vocabulario de hardware: los 52 actuales
son todos de sector y audiencia (`restaurant`, `school`, `stadium`), sin un solo
icono de máquina.

**Orden**: esto va **después** del sistema de color. La grilla toma `ink` y la
sección de línea toma `glow`; si los iconos entran primero, entran en coral y hay
que volver a pasar por los mismos archivos.

**Lo que no es de diseño**: el copy de plataforma, marca y servicio todavía no
existe (el kit de serie sí, en `docs/machines-content/tanda-1-doubles.md`, y hay
que reescribir tres ítems según la regla de arriba); el CTA de carriles implica un
campo de formulario donde adjuntar la muestra o escribir la medida; y el software
probablemente merece **página propia** además de la sección — inventario en vivo,
precios y planogramas remotos, reinicio, alertas y vista de flota es lo que compra
un operador con veinte máquinas, y como tira de cuatro iconos es una nota al pie.

---

# Registro de decisiones abiertas

Cosas decididas pero todavía sin implementar, o esperando una definición.

| Tema | Estado |
|---|---|
| Sistema de color de las familias | **Diseño cerrado** (ver la entrada de arriba). Falta implementarlo: los dos campos y su migración en backend, los tokens y el chip en front |
| Qué pasa con Alpha 10 y Alpha 13 | Pregunta para el cliente. **Urgente**: hoy las dos sirven el mismo PDF de descarga, y la ficha del Alpha Hot Food no describe a la Alpha 10 |
| Si Sigma entra en este visado | **Ya está creada y publicada en producción** (2026-09-16). Lo que falta para que se vea como las otras cinco: renders propios —la imagen actual sale del brochure y dice «LOGO HERE»—, brochure y galería |
| Capacidad real de Gamma 13 | Pregunta para el cliente: 800–1.800 en el sitio contra 800–1.200 en la comparativa nueva |
| Contenido comercial + iconos | **Diseño cerrado** (ver la entrada de arriba). Va después del color. Falta: el global, el copy de plataforma/marca/servicio, los 29 iconos y leer `item.icon` en los dos componentes de highlights |
| Página propia para el software | Recomendada, sin decidir. Contenido y SEO |
| Los brochures en el campo de descarga | **Hecho** — los diez cargados. Destapó que el botón «Download brochure» está en inglés duro en los dos heroes |
| El español de las fichas de máquina | ~150 cadenas en inglés en `/es/maquinas/…`. Delegado a contenido, con la voz ya derivada del home aprobado en [`voice-and-tone.md`](./voice-and-tone.md) |
| ~~Title Case en español~~ | **Cerrado**: mayúscula inicial sola, nunca Title Case. El argumento completo y qué responder si el cliente empuja están en [`voice-and-tone.md`](./voice-and-tone.md) |
