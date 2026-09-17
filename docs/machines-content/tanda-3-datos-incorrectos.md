# Tanda 3 — Zeta 2, Gamma 10 y la familia Sigma

Priorizada por tu criterio nuevo: **primero lo que publica datos incorrectos**, no lo que publica
inglés. Zeta 2 y Gamma 10 son los dos peores casos del catálogo y los dos tienen brochure transcrito.

Mismas reglas que las tandas anteriores. Ninguna cifra inventada.

**Los `id`s van incluidos.** Donde la cantidad de ítems cambia lo digo explícito: reusar los `id`
existentes por `_order` y borrar los sobrantes.

---

# 1. Zeta 2 — `machines.id = 27` · **la ficha más incorrecta del catálogo**

Publica hoy **cuatro datos equivocados**, y uno de ellos es una afirmación sobre el hardware de
seguridad que la máquina no tiene:

| Dato | Publica hoy | Correcto | Dónde |
|---|---|---|---|
| Profundidad | 12.6" | **13"** | `tagline`, spec 1 |
| Selecciones | 10 | **15** | highlight 3, spec 3 |
| Alto | una sola altura, la de pared | **dos configuraciones: 39.5" y 74"** | spec 1 |
| Cerradura | «Electronic lock for enhanced security» | **solo cerradura con llave** | capability 7 |

Lo de la cerradura es el peor: la comparativa dice que **la Zeta 2 es la única de la línea que lleva
solo cerradura con llave**, sin la electrónica. Hoy la ficha promete una cerradura electrónica que la
máquina no trae. Un venue que la elige por seguridad está comprando algo que no existe.

Y lo del alto no es un número mal escrito sino un dato incompleto que engaña: la ficha publica los
39.5" de la unidad de pared, que es justamente la altura que **no** aplica cuando la máquina va en el
piso, donde son 74".

## 1.1 Campos simples — `machines_locales`

| campo | EN | ES |
|---|---|---|
| `tagline` | Wall-mounted or floor-standing, 13" deep, 32" screen | De pared o de pie, 13" de fondo, pantalla de 32" |
| `hero_eyebrow` | ZETA SERIES | SERIE ZETA |
| `highlights_eyebrow` | WHY ZETA 2 | POR QUÉ ZETA 2 |
| `highlights_heading` | A store where there's no room for one. | Una tienda donde no cabe una tienda. |
| `capabilities_heading` | No compressor. No drainage. No build-out. | Sin compresor. Sin drenaje. Sin obra. |
| `cta_label` | Contact Sales | Contactar a ventas |

`highlights_heading` es el titular del propio brochure. `capabilities_heading` reemplaza a «Built for
scale. Designed for ease.», que hoy comparten **cinco máquinas distintas**.

## 1.2 `highlights.items` — 4 ítems, `id`s existentes, 1:1 por orden

| `id` | `_order` | title EN | description EN |
|---|---|---|---|
| `6a6654364b1f630004570076` | 1 | Two ways to install | Bolt it to the wall at 39.5", or stand it on its rolling base at 74". The base is built to your site. |
| `6a6654364b1f630004570077` | 2 | 15 selections, 80 to 150 units | Five shelves. A curated assortment, not a supermarket. |
| `6a6654364b1f630004570078` | 3 | 32" vertical screen | The largest in the catalog. It sells the product, then runs your campaign between sales. |
| `6a6654364b1f630004570079` | 4 | ADA compliant as standard | Accessible reach and interaction, with no add-on to quote. |

| `id` | `_order` | title ES | description ES |
|---|---|---|---|
| `6a6654364b1f630004570076` | 1 | Dos formas de instalarla | Atornillada a la pared son 39.5". Sobre su base rodante, 74". La base se fabrica a la medida del sitio. |
| `6a6654364b1f630004570077` | 2 | 15 selecciones, de 80 a 150 unidades | Cinco repisas. Un surtido curado, no un supermercado. |
| `6a6654364b1f630004570078` | 3 | Pantalla vertical de 32" | La más grande del catálogo. Vende el producto y, entre venta y venta, corre tu campaña. |
| `6a6654364b1f630004570079` | 4 | Cumple ADA de serie | Alcance e interacción accesibles, sin add-on que cotizar. |

## 1.3 `capabilities.items` — 9 existentes, 9 nuevos, 1:1 por orden

| `id` | `_order` | text EN | text ES |
|---|---|---|---|
| `6a6654364b1f63000457007a` | 1 | Mounts on a wall or stands on its rolling base | Se monta en pared o se apoya sobre su base rodante |
| `6a6654364b1f63000457007b` | 2 | 32" vertical touchscreen — the largest in the line | Pantalla táctil vertical de 32" — la más grande de la línea |
| `6a6654364b1f63000457007c` | 3 | Runs advertising between sales | Corre publicidad entre venta y venta |
| `6a6654364b1f63000457007d` | 4 | Direct-push spiral slots — one unit per turn | Slots de espiral empujadora — una unidad por vuelta |
| `6a6654364b1f63000457007e` | 5 | No compressor: no drainage, no site work | Sin compresor: sin drenaje ni obra de sitio |
| `6a6654364b1f63000457007f` | 6 | ADA compliant as standard | Cumple ADA de serie |
| `6a6654364b1f630004570080` | 7 | Built-in speakers | Altavoces integrados |
| `6a6654364b1f630004570081` | 8 | Internal camera | Cámara interna |
| `6a6654364b1f630004570082` | 9 | Key service lock | Cerradura de servicio con llave |

**El ítem 9 es la corrección importante**: reemplaza a «Electronic lock for enhanced security».

Lo que sale en esta pasada y por qué: «Fully automatic system» (no dice nada en una máquina
automática), «All-steel fuselage for durability» (*fuselage* es el casco de un avión), «Android
system» (detalle interno, no valor para quien compra) y la cerradura electrónica (falsa).

**Ojo**: la Zeta 2 lleva **cámara interna solamente**, no interna y externa. Si el kit de serie
declara «cámaras interna y externa», esta es una de las dos excepciones que hay que anotar.

## 1.4 `specs` — 6 existentes 1:1, más una séptima a crear

| `id` | `_order` | label EN | value EN | label ES | value ES |
|---|---|---|---|---|---|
| `6a6655408dce8a00046f7e89` | 1 | Dimensions (H×W×D) | Wall: 39.5" × 27.5" × 13" · Floor: 74" × 27.5" × 27.5" | Dimensiones (Alto×Ancho×Profundidad) | Pared: 39.5" × 27.5" × 13" · Piso: 74" × 27.5" × 27.5" |
| `6a6655408dce8a00046f7e8a` | 2 | Storage capacity | 80–150 units | Capacidad de almacenamiento | 80–150 unidades |
| `6a6655408dce8a00046f7e8b` | 3 | Selections | 15 | Selecciones | 15 |
| `6a6655408dce8a00046f7e8c` | 4 | Touchscreen | 32" vertical | Pantalla táctil | 32" vertical |
| `6a6655408dce8a00046f7e8d` | 5 | Mounting | Wall or rolling base | Montaje | Pared o base rodante |
| `6a6655408dce8a00046f7e8e` | 6 | Power | Dedicated 110V outlet / 15 amps | Alimentación | Toma dedicada 110V / 15 amps |
| *(crear)* | 7 | Weight | 230 lbs / 104 kg | Peso | 230 lbs / 104 kg |

La spec 1 mete las dos configuraciones en un solo campo porque no hay otro lugar donde ponerlas. Es
un apaño, no una solución — la solución sería que `specs` admitiera una variante por configuración.

---

# 2. Gamma 10 — `machines.id = 20`

Publica los números de la ficha vieja. El error grande es el de selecciones: **78 contra 120 reales,
o sea que la ficha subdeclara la capacidad del modelo en un 35%**. Eso no ahuyenta a un comprador por
desconfianza, lo ahuyenta por parecer chica.

| Dato | Publica hoy | Correcto |
|---|---|---|
| Alto | 77" | **78"** |
| Selecciones | 78 | **120** |
| Repisas | 6, ampliable a 8 | **7 ajustables** |

## 2.1 Campos simples — `machines_locales`

| campo | EN | ES |
|---|---|---|
| `tagline` | 51" wide, 120 selections, full Gamma capacity | 51" de ancho, 120 selecciones, capacidad Gamma completa |
| `hero_eyebrow` | GAMMA SERIES | SERIE GAMMA |
| `highlights_eyebrow` | WHY GAMMA 10 | POR QUÉ GAMMA 10 |
| `highlights_heading` | Gamma capacity. 51 inches of floor. | Capacidad Gamma. 51 pulgadas de piso. |
| `capabilities_heading` | Fits where a full-width cabinet won't. | Entra donde no entra un gabinete de ancho completo. |
| `cta_label` | Contact Sales | Contactar a ventas |

## 2.2 `highlights.items` — 4 ítems, `id`s existentes, 1:1 por orden

| `id` | `_order` | title EN | description EN |
|---|---|---|---|
| `6a66542e4b1f63000457002d` | 1 | Up to 120 selections | Seven adjustable shelves hold 624 to 1,170 units. |
| `6a66542e4b1f63000457002e` | 2 | 51 inches of floor | Full Gamma capacity in a cabinet that fits a corridor or a lobby. |
| `6a66542e4b1f63000457002f` | 3 | Nothing drops to the bin | The tray rises to the shelf, collects the item and lowers it to the door. Boxed electronics and glass arrive intact. |
| `6a66542e4b1f630004570030` | 4 | Ambient now, cold later | Refrigeration is an option that holds 4°C to 25°C when you need it. |

| `id` | `_order` | title ES | description ES |
|---|---|---|---|
| `6a66542e4b1f63000457002d` | 1 | Hasta 120 selecciones | Siete repisas ajustables, de 624 a 1.170 unidades. |
| `6a66542e4b1f63000457002e` | 2 | 51 pulgadas de piso | Capacidad Gamma completa en un gabinete que entra en un corredor o un lobby. |
| `6a66542e4b1f63000457002f` | 3 | Nada cae al fondo | La bandeja sube a la repisa, recoge el artículo y lo baja hasta la puerta. Las cajas y el vidrio llegan intactos. |
| `6a66542e4b1f630004570030` | 4 | Ambiente ahora, frío después | La refrigeración es opcional y sostiene de 4 °C a 25 °C cuando la necesites. |

## 2.3 `capabilities.items` — **de 9 a 5**: reusar los `id` 1–5, borrar los 4 restantes

| `id` | `_order` | text EN | text ES |
|---|---|---|---|
| `6a66542e4b1f630004570031` | 1 | Seven adjustable shelves with modular lanes | Siete repisas ajustables con carriles modulares |
| `6a66542e4b1f630004570032` | 2 | Gantry lift: the tray collects the item and lowers it — no free fall | Carro elevador: la bandeja recoge el artículo y lo baja — sin caída libre |
| `6a66542e4b1f630004570033` | 3 | Anti-pinch automatic pickup door | Puerta de retiro automática anti-pinzamiento |
| `6a66542e4b1f630004570034` | 4 | Optional refrigeration holds 4°C to 25°C | Refrigeración opcional: de 4 °C a 25 °C |
| `6a66542e4b1f630004570035` | 5 | Optional illuminated topper — 93" total, removable | Topper iluminado opcional: 93" en total, desmontable |

**Borrar**: `…36`, `…37`, `…38`, `…39`. Eran «Fully automatic system», «All-steel fuselage», «LED
lighting», «Clear windows», «21.5" touchscreen», «Flexible payment» y «cameras» — todo kit de serie o
inglés roto. Esta es la ficha que muestra mejor por qué separar el kit: pasa de 9 bullets a 5, y los
5 que quedan dicen algo que las otras máquinas no dicen.

## 2.4 `specs` — 6 existentes 1:1, más una séptima a crear

| `id` | `_order` | label EN | value EN | label ES | value ES |
|---|---|---|---|---|---|
| `6a665533f11ace00048c3aff` | 1 | Dimensions (H×W×D) | 78" × 51" × 39" | Dimensiones (Alto×Ancho×Profundidad) | 78" × 51" × 39" |
| `6a665533f11ace00048c3b00` | 2 | Storage capacity | 624–1,170 units | Capacidad de almacenamiento | 624–1.170 unidades |
| `6a665533f11ace00048c3b01` | 3 | Selections | 120 | Selecciones | 120 |
| `6a665533f11ace00048c3b02` | 4 | Power | Dedicated 110V / 60Hz outlet, 15 amps | Alimentación | Toma dedicada 110V / 60Hz, 15 amps |
| `6a665533f11ace00048c3b03` | 5 | Refrigeration | Optional — 4°C to 25°C | Refrigeración | Opcional — 4 °C a 25 °C |
| `6a665533f11ace00048c3b04` | 6 | Payment methods | Nayax: cards, Apple Pay, Google Pay | Métodos de pago | Nayax: tarjetas, Apple Pay, Google Pay |
| *(crear)* | 7 | Weight | 900 lbs / 408 kg | Peso | 900 lbs / 408 kg |

---

# 3. Familia Sigma — `machine_families.id = 6`, slug `sigma`

Escrita de cero. Mantiene la estructura de las otras cinco familias para que la fila de `/machines`
no se vea distinta, pero el texto es nuevo.

| campo | EN | ES |
|---|---|---|
| `name` | Sigma Series | Sigma Series |
| `tagline` | The only line in the catalog that holds −25°C. A real freezer, not a cooler. | La única línea del catálogo que sostiene −25 °C. Un congelador de verdad, no un enfriador. |
| `description` | Frozen retail that runs off a standard outlet. Belt and spiral lanes mix on the same shelf, and a lift platform sets every item down beside the glass — so cones, tubs and bagged ice arrive whole. | Retail congelado que funciona con una toma común. Cinta y espiral se mezclan en la misma repisa, y una plataforma elevadora deposita cada artículo junto al vidrio: los conos, las tinas y el hielo en bolsa llegan enteros. |
| `hero_eyebrow` | Frozen Automated Retail | Retail congelado |
| `hero_heading` | The only line in the catalog that holds −25°C. A real freezer, not a cooler. | Hasta −25 °C con una toma común. De 400 a 700 unidades congeladas, sin obra de sitio. |
| `highlights_eyebrow` | WHY SIGMA | POR QUÉ SIGMA |
| `highlights_heading` | Frozen, without the build-out. | Congelado, sin obra. |
| `cta_label` | Explore our Sigma Models | Explora nuestros modelos Sigma |

Seguí la convención que ya usan Gamma y Kappa: en inglés `hero_heading` repite el `tagline`; en
español es una frase distinta con una cifra adentro. No es un descuido de ellos, es el patrón.

**Dos cosas del `cta_label`**, y elegí vos:

- Sigma tiene **un solo modelo**. «Explore our Sigma Models» en plural va a sonar raro hasta que
  haya un segundo. La alternativa en singular es **`Explore the Sigma Frozen` / `Conoce la Sigma
  Frozen`**. Dejé el plural para no romper la simetría con las otras cinco familias, pero el
  singular es más honesto hoy.
- En español, `hero_eyebrow` de Gamma y de Kappa dicen las dos **«Próxima generación»** — el mismo
  texto genérico en dos familias distintas. Le puse a Sigma «Retail congelado», que sí dice qué es.
  Si preferís simetría sobre precisión, decime y lo cambio; pero entonces tres familias van a
  compartir el mismo eyebrow en la página que las lista juntas.

---

# 4. Un problema sistemático que encontré de paso

**El separador de miles está en formato inglés dentro del español.** Las specs en `es` dicen
`624–1,170 unidades` y `800–1,800 unidades`, con coma. En español el separador de miles es el punto:
**`624–1.170`**, `800–1.800`.

Lo corregí en todo lo que toqué en esta tanda. Pero está en las specs en español de **las ocho
máquinas**, no solo en estas dos, y es una corrección mecánica que no depende de ninguna decisión.
Si querés, la incluyo completa en la tanda siguiente para las que no voy a reescribir igual.
