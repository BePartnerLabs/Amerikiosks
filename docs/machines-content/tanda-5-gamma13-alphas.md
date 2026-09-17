# Tanda 5 — Gamma 13, Alpha 13 y Alpha 10

Última tanda de fichas. Cierra las diez máquinas.

Mismas reglas. `id`s incluidos. **Dos decisiones te las dejo abiertas**, las dos al principio porque
cambian lo que se carga.

---

# ⚠ Decisión A — El horno: ¿50 segundos o 2–3 minutos?

**El sitio se contradice a sí mismo hoy, y nadie lo había anotado.**

| Dónde | Qué dice |
|---|---|
| Home (página aprobada por el cliente) | **«about 50 seconds»** |
| Ficha de Alpha 10, highlight 1 y spec 4 | «2-3 minutes» |
| Ficha de Alpha 13, highlight 1 y spec 4 | «2-3 minutes» |
| Brochure nuevo Alpha Hot Food | **«~50 segundos»**, ciclo de horneado 360° |

O sea: la home que el cliente revisó promete 50 segundos y las fichas de producto prometen entre dos
y tres minutos — **entre tres y cuatro veces más**. Un cliente que compara las dos páginas no sabe
cuál creer, y un venue que decide por tiempo de espera está leyendo el número equivocado en la página
donde más importa.

**En Alpha 13 lo corrijo** a ~50 segundos: es reescritura completa contra el brochure nuevo, que es la
fuente que manda.

**En Alpha 10 lo dejo en 2–3 minutos**, porque me pediste higiene sin tocar cifras. Pero anotá que
puede no ser un error de copia: la Alpha 10 es un equipo distinto de verdad —5.200 W contra 4.500 W,
17 niveles contra 7, pantalla de 49"— así que podría tener un ciclo propio. **O el número viejo está
mal en las dos, o la Alpha 10 es más lenta y eso es un dato de venta.** Cualquiera de las dos hay que
confirmarla; hoy no lo sabe nadie.

# ⚠ Decisión B — Gamma 13: aplicar la regla a medias publica una combinación que no existe

Tu regla dice que manda la comparativa, con las unidades de Gamma 13 congeladas. Aplicada literal, la
ficha queda diciendo **140 selecciones y 800–1.800 unidades**, y ese par **no está en ningún
documento**: la comparativa dice 140 con 800–1.200, la base y la ficha vieja dicen 120 con 800–1.800.

No son dos datos independientes: **selecciones y unidades describen lo mismo**, la capacidad, y salen
de la misma fila. Si desconfiamos de una, la otra queda igual de bajo sospecha.

Y el riesgo no es simétrico. Congelaste las unidades para no **subdeclarar**, que cuesta ventas. Pero
la combinación 140 + 800–1.800 es la que más probablemente **sobredeclara**, y sobredeclarar es peor:
es prometer capacidad que la máquina puede no tener. Es la misma clase de problema que la cerradura
de la Zeta 2, solo que en números.

**Mi recomendación: cambiar solo el alto y congelar las dos cifras de capacidad.** El alto (77" → 78")
está confirmado en cuatro fuentes y no lo discute nadie. Las otras dos van juntas a la pregunta al
cliente.

**Escribí la ficha con 120**, que es la versión conservadora. Si preferís la regla literal, cambiá
`120` por `140` en el highlight 2 y en la spec 3 — el resto del texto no depende de esa cifra.

---

# 1. Gamma 13 — `machines.id = 21`

Además de las cifras, su `highlights_heading` es **idéntico al de la familia Gamma** («Built for
scale. Designed for any location.»). Mismo problema que Kappa 13: padre e hijo con la misma frase.

## 1.1 Campos simples

| campo | EN | ES |
|---|---|---|
| `tagline` | 72" wide, 120 selections, fully modular | 72" de ancho, 120 selecciones, totalmente modular |
| `hero_eyebrow` | GAMMA SERIES | SERIE GAMMA |
| `highlights_eyebrow` | WHY GAMMA 13 | POR QUÉ GAMMA 13 |
| `highlights_heading` | The biggest single cabinet we make. | El gabinete más grande que hacemos en una sola pieza. |
| `capabilities_heading` | Modular from the first shelf up. | Modular desde la primera repisa. |
| `cta_label` | Contact Sales | Contactar a ventas |

`highlights_heading` la distingue de la Gamma Double sin contradecirla: la Double es más grande, pero
son dos gabinetes.

## 1.2 `highlights.items` — 4, `id`s existentes, 1:1

| `id` | `_order` | title EN | description EN |
|---|---|---|---|
| `6a66542f4b1f63000457003a` | 1 | 72 inches of single cabinet | The widest one-piece Gamma. Where a Double won't fit, this will. |
| `6a66542f4b1f63000457003b` | 2 | 120 selections, 800 to 1,800 units | Adjustable shelving, extendable from six shelves to eight. |
| `6a66542f4b1f63000457003c` | 3 | Pusher lanes and a gantry lift | Adjustable channels take wider products, and nothing free-falls to a bin. |
| `6a66542f4b1f63000457003d` | 4 | Refrigeration when you need it | An option that holds 4°C to 25°C, added at order. |

| `id` | `_order` | title ES | description ES |
|---|---|---|---|
| `6a66542f4b1f63000457003a` | 1 | 72 pulgadas en una sola pieza | La Gamma de una pieza más ancha. Donde no entra una Double, entra esta. |
| `6a66542f4b1f63000457003b` | 2 | 120 selecciones, de 800 a 1.800 unidades | Estantería ajustable, de seis repisas a ocho. |
| `6a66542f4b1f63000457003c` | 3 | Carriles empujadores y carro elevador | Los canales ajustables aceptan productos más anchos, y nada cae al fondo. |
| `6a66542f4b1f63000457003d` | 4 | Refrigeración cuando la necesites | Opcional, sostiene de 4 °C a 25 °C y se agrega al pedido. |

## 1.3 `capabilities.items` — **de 9 a 5**: reusar `id` 1–5, borrar 6–9

| `id` | `_order` | text EN | text ES |
|---|---|---|---|
| `6a66542f4b1f63000457003e` | 1 | Six adjustable shelves, extendable to eight | Seis repisas ajustables, ampliables a ocho |
| `6a66542f4b1f63000457003f` | 2 | Adjustable channels for wider products | Canales ajustables para productos más anchos |
| `6a66542f4b1f630004570040` | 3 | Gantry lift — no free fall to the bin | Carro elevador — sin caída libre al fondo |
| `6a66542f4b1f630004570041` | 4 | Anti-pinch automatic pickup door | Puerta de retiro automática anti-pinzamiento |
| `6a66542f4b1f630004570042` | 5 | Optional refrigeration holds 4°C to 25°C | Refrigeración opcional: de 4 °C a 25 °C |

**Borrar**: `…43`, `…44`, `…45`, `…46`.

## 1.4 `specs` — 6 existentes, 1:1

| `id` | `_order` | label EN | value EN | label ES | value ES |
|---|---|---|---|---|---|
| `6a665535f11ace00048c3b05` | 1 | Dimensions (H×W×D) | 78" × 72" × 39" | Dimensiones (Alto×Ancho×Profundidad) | 78" × 72" × 39" |
| `6a665535f11ace00048c3b06` | 2 | Storage capacity | 800–1,800 units | Capacidad de almacenamiento | 800–1.800 unidades |
| `6a665535f11ace00048c3b07` | 3 | Selections | 120 | Selecciones | 120 |
| `6a665535f11ace00048c3b08` | 4 | Power | Dedicated 110V outlet / 15 amps | Alimentación | Toma dedicada 110V / 15 amps |
| `6a665535f11ace00048c3b09` | 5 | Refrigeration | Optional — 4°C to 25°C | Refrigeración | Opcional — 4 °C a 25 °C |
| `6a665535f11ace00048c3b0a` | 6 | Payment methods | Nayax: cards, Apple Pay, Google Pay | Métodos de pago | Nayax: tarjetas, Apple Pay, Google Pay |

Spec 1: **solo cambia el alto**, 77" → 78". Spec 2: solo el separador. Spec 3: solo la etiqueta.
No hay peso: Gamma 13 no tiene brochure nuevo y su ficha vieja no lo da.

---

# 2. Alpha 13 — `machines.id = 19` · reescritura completa

Contra `BROCHURE-2026-09-ALPHA-HOT-FOOD.md`. **Sin dar por hecha la fusión**: el texto no dice ni
sugiere que sea la única Alpha del catálogo.

**El ancho no se toca.** La base dice 72.5" y el brochure dice 68", que no coincide con ninguna de
las dos Alpha. Es el único número del brochure que no empata con nada, así que queda como está y va a
la pregunta al cliente.

## 2.1 Campos simples

| campo | EN | ES |
|---|---|---|
| `tagline` | Cold in, hot out, about 50 seconds | Entra frío, sale caliente, en unos 50 segundos |
| `hero_eyebrow` | ALPHA SERIES | SERIE ALPHA |
| `highlights_eyebrow` | WHY ALPHA 13 | POR QUÉ ALPHA 13 |
| `highlights_heading` | Cold storage in. Hot meal out. Fifty seconds. | Entra del frío. Sale caliente. Cincuenta segundos. |
| `capabilities_heading` | The cold chain holds until the oven starts. | La cadena de frío aguanta hasta que arranca el horno. |
| `cta_label` | Contact Sales | Contactar a ventas |

`highlights_heading` es el titular del propio brochure.

**`hero_eyebrow` cambia de «NEXT GENERATION» a «ALPHA SERIES».** Las dos Alpha son las únicas del
catálogo que no nombran su serie: Gamma dice GAMMA SERIES, Kappa dice KAPPA SERIES, Delta y Zeta
igual. «NEXT GENERATION» además es de la familia de frases que la voz no usa.

## 2.2 `highlights.items` — 4, `id`s existentes, 1:1

| `id` | `_order` | title EN | description EN |
|---|---|---|---|
| `6a66542d4b1f63000457001e` | 1 | About fifty seconds | The 360° oven runs that product's own profile, 220°C to 360°C, and hands it over ready to eat. |
| `6a66542d4b1f63000457001f` | 2 | Refrigerated until the oven starts | Product sits at 4°C to 25°C on seven shelves, loaded straight from the cold chain. |
| `6a66542d4b1f630004570020` | 3 | A heating profile per product | Pizza, burgers, wraps and bakery each get their own, so texture and taste hold. |
| `6a66542d4b1f630004570021` | 4 | 28 selections, up to 84 items | Conveyor lanes move each one to the lift. Nothing is pushed off an edge. |

| `id` | `_order` | title ES | description ES |
|---|---|---|---|
| `6a66542d4b1f63000457001e` | 1 | Unos cincuenta segundos | El horno 360° corre el perfil de ese producto, de 220 °C a 360 °C, y lo entrega listo para comer. |
| `6a66542d4b1f63000457001f` | 2 | Refrigerado hasta que arranca el horno | El producto está entre 4 °C y 25 °C en siete repisas, cargado directo desde la cadena de frío. |
| `6a66542d4b1f630004570020` | 3 | Un perfil de calentamiento por producto | Pizza, hamburguesas, wraps y horneados tienen el suyo, así la textura y el sabor aguantan. |
| `6a66542d4b1f630004570021` | 4 | 28 selecciones, hasta 84 artículos | Los carriles de cinta llevan cada uno al elevador. Nada se empuja por un borde. |

## 2.3 `capabilities.items` — **de 11 a 6**: reusar `id` 1–6, borrar 7–11

| `id` | `_order` | text EN | text ES |
|---|---|---|---|
| `6a66542d4b1f630004570022` | 1 | 360° microwave oven, 220°C to 360°C, about 50 seconds per item | Horno microondas 360°, de 220 °C a 360 °C, unos 50 segundos por artículo |
| `6a66542d4b1f630004570023` | 2 | Refrigerated bay holds 4°C to 25°C until heating | Bahía refrigerada de 4 °C a 25 °C hasta el momento de calentar |
| `6a66542d4b1f630004570024` | 3 | Conveyor lanes across seven adjustable shelves | Carriles de cinta en siete repisas ajustables |
| `6a66542d4b1f630004570025` | 4 | Zero-drop vertical lift platform | Plataforma elevadora vertical de caída cero |
| `6a66542d4b1f630004570026` | 5 | Heating profile adjustable per product | Perfil de calentamiento ajustable por producto |
| `6a66542d4b1f630004570027` | 6 | Requires a dedicated 220V line — the only model that is not 110V | Requiere línea dedicada de 220V — el único modelo que no es de 110V |

**Borrar**: `…28`, `…29`, `…2a`, `…2b`, `…2c`.

El ítem 6 no es un adorno: es el dato que decide si la máquina entra en el local o hay que tirar una
línea nueva. Ver la nota de abajo.

## 2.4 `specs` — 6 existentes 1:1, más tres a crear

| `id` | `_order` | label EN | value EN | label ES | value ES |
|---|---|---|---|---|---|
| `6a665531f11ace00048c3af9` | 1 | Dimensions (H×W×D) | 78" × 72.5" × 39" | Dimensiones (Alto×Ancho×Profundidad) | 78" × 72.5" × 39" |
| `6a665531f11ace00048c3afa` | 2 | Touchscreen | 21.5" | Pantalla táctil | 21.5" |
| `6a665531f11ace00048c3afb` | 3 | Storage capacity | Up to 84 items | Capacidad de almacenamiento | Hasta 84 artículos |
| `6a665531f11ace00048c3afc` | 4 | Heating cycle | About 50 seconds, 360° bake | Ciclo de calentamiento | Unos 50 segundos, horneado 360° |
| `6a665531f11ace00048c3afd` | 5 | Temperature range | 4°C – 25°C | Rango de temperatura | 4 °C – 25 °C |
| `6a665531f11ace00048c3afe` | 6 | Payment methods | Nayax: cards, Apple Pay, Google Pay | Métodos de pago | Nayax: tarjetas, Apple Pay, Google Pay |
| *(crear)* | 7 | Selections | 28 | Selecciones | 28 |
| *(crear)* | 8 | Power | Dedicated 220V / 50Hz line, 21A, 4,500W | Alimentación | Línea dedicada 220V / 50Hz, 21A, 4.500W |
| *(crear)* | 9 | Weight | 1,389 lbs / 630 kg | Peso | 1.389 lbs / 630 kg |

**La spec 3 arregla un error de tipo, no de número**: decía «7 shelves» bajo la etiqueta «Storage
capacity». Una cantidad de repisas no es una capacidad, y en la tabla comparativa esa celda quedaba
midiendo otra cosa que las demás.

---

# 3. Alpha 10 — `machines.id = 18` · solo higiene

Sin copy nueva y **sin tocar ninguna cifra**, como quedamos. Lo que cambia es el inglés roto y la
traducción, que hoy no existe.

## 3.1 Campos simples

| campo | EN | ES |
|---|---|---|
| `tagline` | 49" touch, 68 items, full 360° oven | Táctil de 49", 68 artículos, horno 360° completo |
| `hero_eyebrow` | ALPHA SERIES *(ver nota)* | SERIE ALPHA *(ver nota)* |
| `highlights_eyebrow` | WHY ALPHA 10 | POR QUÉ ALPHA 10 |
| `highlights_heading` | Hot food, express speed. | Comida caliente, a velocidad exprés. |
| `capabilities_heading` | Built for hot food. Designed for high traffic. | Hecha para comida caliente. Pensada para alto tráfico. |
| `cta_label` | Contact Sales | Contactar a ventas |

**Nota sobre `hero_eyebrow`**: cambiarlo de «NEXT GENERATION» a «ALPHA SERIES» es consistencia, no
reparación de inglés, así que técnicamente se sale de la higiene. Lo dejo propuesto y decidís vos. Si
Alpha 13 lo cambia y Alpha 10 no, las dos Alpha van a mostrar eyebrows distintos en la misma familia.

Las dos cabeceras se quedan tal cual en inglés: hoy las comparte con Alpha 13, pero como Alpha 13
estrena las suyas, dejan de estar duplicadas solas.

## 3.2 `highlights.items` — 4, `id`s existentes, 1:1 · cifras intactas

| `id` | `_order` | title EN | description EN |
|---|---|---|---|
| `6a66542c4b1f63000457000f` | 1 | 360° rapid heating | The oven module heats in 2 to 3 minutes with 360° baking. |
| `6a66542c4b1f630004570010` | 2 | Refrigerated 4°C to 25°C | Precise temperature control keeps every item food-safe until it is ordered. |
| `6a66542c4b1f630004570011` | 3 | 68-item capacity | 17 shelf layers, 90 to 160 boxes. |
| `6a66542c4b1f630004570012` | 4 | 49" touchscreen | The largest display in the catalog, for a visual ordering experience. |

| `id` | `_order` | title ES | description ES |
|---|---|---|---|
| `6a66542c4b1f63000457000f` | 1 | Calentamiento rápido 360° | El módulo de horno calienta en 2 a 3 minutos con horneado 360°. |
| `6a66542c4b1f630004570010` | 2 | Refrigerado de 4 °C a 25 °C | El control preciso de temperatura mantiene cada artículo apto hasta que lo piden. |
| `6a66542c4b1f630004570011` | 3 | Capacidad de 68 artículos | 17 niveles de repisa, de 90 a 160 cajas. |
| `6a66542c4b1f630004570012` | 4 | Pantalla táctil de 49" | La pantalla más grande del catálogo, para pedir de forma visual. |

**El highlight 3 se contradice a sí mismo y lo dejo así a propósito**: dice «68 artículos» en el
título y «90 a 160 cajas» en la descripción, en la misma tarjeta. Es el conflicto de capacidad de la
Alpha 10 que el audit ya reportaba, y arreglarlo exige elegir una cifra, que es justo lo que no me
toca. Queda anotado.

## 3.3 `capabilities.items` — **de 11 a 6**: reusar `id` 1–6, borrar 7–11

| `id` | `_order` | text EN | text ES |
|---|---|---|---|
| `6a66542c4b1f630004570013` | 1 | Refrigerated 4°C to 25°C | Refrigeración de 4 °C a 25 °C |
| `6a66542c4b1f630004570014` | 2 | Insulated all-steel cabinet | Gabinete de acero aislado |
| `6a66542c4b1f630004570015` | 3 | 360° microwave heating, 2 to 3 minutes | Calentamiento microondas 360°, de 2 a 3 minutos |
| `6a66542c4b1f630004570016` | 4 | 49" touchscreen | Pantalla táctil de 49" |
| `6a66542c4b1f630004570017` | 5 | Zero-drop vertical lift | Elevador vertical de caída cero |
| `6a66542c4b1f630004570018` | 6 | Large storage, 90 to 160 boxes | Gran almacenamiento, de 90 a 160 cajas |

**Borrar**: `…19`, `…1a`, `…1b`, `…1c`, `…1d`.

Higiene aplicada: sale «All-steel fuselage» (reemplazado por «Insulated all-steel cabinet»), sale
«Fully automatic system», salen «Clear windows», «LED lighting», «Flexible payment» y «Remote
reboot», que son kit de serie. Las cifras de los ítems 3 y 6 quedan exactamente como estaban.

## 3.4 `specs` — 6 existentes 1:1, cifras intactas

| `id` | `_order` | label EN | value EN | label ES | value ES |
|---|---|---|---|---|---|
| `6a6654e78dce8a00046f7e83` | 1 | Dimensions (H×W×D) | 78.42" × 57.63" × 40.23" | Dimensiones (Alto×Ancho×Profundidad) | 78.42" × 57.63" × 40.23" |
| `6a6654e78dce8a00046f7e84` | 2 | Touchscreen | 49" | Pantalla táctil | 49" |
| `6a6654e78dce8a00046f7e85` | 3 | Storage capacity | 90–160 boxes | Capacidad de almacenamiento | 90–160 cajas |
| `6a6654e78dce8a00046f7e86` | 4 | Heating cycle | 2–3 min, 360° bake | Ciclo de calentamiento | 2–3 min, horneado 360° |
| `6a6654e78dce8a00046f7e87` | 5 | Temperature range | 4°C – 25°C | Rango de temperatura | 4 °C – 25 °C |
| `6a6654e78dce8a00046f7e88` | 6 | Payment methods | Nayax: cards, Apple Pay, Google Pay | Métodos de pago | Nayax: tarjetas, Apple Pay, Google Pay |

Único cambio de etiqueta: «Refrigeration range» → «Temperature range», para que las seis máquinas con
temperatura usen la misma y se puedan comparar.

### Falta su alimentación, y es una omisión cara

La Alpha 10 **no tiene spec de `Power`**, igual que la Alpha 13 antes de esta tanda. Y según el audit
es de **220 V, 23 A, 5.200 W** — o sea que las dos Alpha son las únicas del catálogo que no son de
110 V.

Un operador en Estados Unidos que asume 110 V descubre el problema **cuando llega la máquina**.
Agregar la spec es llenar un hueco, no cambiar una cifra, pero se sale de la higiene estricta, así
que no la incluí en la tabla. Si querés sumarla:

| `_order` | label EN | value EN | label ES | value ES |
|---|---|---|---|---|
| 7 | Power | Dedicated 220V line, 23A, 5,200W | Alimentación | Línea dedicada 220V, 23A, 5.200W |

---

# 4. Estado final de las diez fichas

| Máquina | Estado | Qué queda abierto |
|---|---|---|
| Gamma Double | Completa | — |
| Kappa Double | Escrita, flaca | Peso, repisas, eléctrico y opcionales: falta transcribir su brochure |
| Sigma Frozen | Completa | Dónde vive el requisito de ventilación trasera |
| Zeta 2 | Completa | — |
| Gamma 10 | Completa | — |
| Delta 7 | Completa | — |
| Kappa 13 | Completa | — |
| Kappa Showcase | Completa | Pantalla 22" vs 21.5"; el «Blanco» del nombre |
| Gamma 13 | Completa | **Decisión B**: 120/800–1.800 contra 140/800–1.200 |
| Alpha 13 | Completa | Ancho 72.5" vs 68" del brochure |
| Alpha 10 | Higiene | **Decisión A**: el ciclo del horno · 68 artículos vs 90–160 cajas · falta `Power` · ¿sigue en catálogo? |

## Lo que sumé a la lista de preguntas al cliente

1. **El ciclo del horno**: 50 segundos en la home contra 2–3 minutos en las fichas. Afecta a las dos Alpha.
2. **Gamma 13**: las dos cifras de capacidad juntas, no solo las unidades.
3. **Ancho de la Alpha 13**: 72.5" en la base contra 68" en el brochure nuevo.
4. **Pantalla de la Kappa Showcase**: 22" contra 21.5" *(de la tanda 4)*.

Y una que se cerró: el rango de temperatura de la Kappa Showcase, 4 °C a 25 °C *(tanda 4)*.
