# Tanda 4 — Delta 7, Kappa 13, Kappa Showcase

Los tres publican cifras mal y **ninguno tiene brochure transcrito**. Fuente: su fila de la
comparativa para lo que ella da, su ficha vieja para peso, repisas y opcionales.

Mismas reglas. Ninguna cifra inventada. `id`s incluidos.

---

## Corrección a lo que te dije en la tanda 3

Te dije que el separador de miles inglés estaba «en las ocho máquinas». **No: está en tres lugares.**
Lo medí con una consulta en vez de estimarlo:

| Dónde | Valor `es` hoy | Corregido |
|---|---|---|
| `gamma-10` spec 2 | `624–1,170 unidades` | `624–1.170 unidades` ← ya va en la tanda 3 |
| `gamma-13` spec 2 | `800–1,800 unidades` | `800–1.800 unidades` |
| `kappa-showcase-blanco` spec 2 | `1,900 lbs` | `1.900 lbs` |

Los otros dos aciertos de la consulta eran highlights que todavía están en inglés, así que se
corrigen solos al reescribirlos. **No hace falta una pasada aparte**: con `gamma-13` spec 2 y
`kappa-showcase` spec 2 queda cerrado. El de Kappa Showcase va incluido abajo.

Ojo con `gamma-13`: el separador se corrige, **la cifra no**. Queda `800–1.800`, que es la que está
congelada esperando al cliente.

---

# 1. Delta 7 — `machines.id = 23`

| Dato | Publica hoy | Correcto (comparativa) |
|---|---|---|
| Selecciones | 42 | **54** |
| Tipo de carril | solo empuje directo | **empujador + espiral** |
| Refrigeración | «Sí, para productos sensibles a temperatura» | **opcional** |

## 1.1 Campos simples

| campo | EN | ES |
|---|---|---|
| `tagline` | 34" deep, 54 selections, 10" screen | 34" de fondo, 54 selecciones, pantalla de 10" |
| `hero_eyebrow` | DELTA SERIES | SERIE DELTA |
| `highlights_eyebrow` | WHY DELTA 7 | POR QUÉ DELTA 7 |
| `highlights_heading` | The shallowest cabinet in the line. | El gabinete menos profundo de la línea. |
| `capabilities_heading` | Five inches shallower. Same catalog. | Cinco pulgadas menos de fondo. El mismo catálogo. |
| `cta_label` | Contact Sales | Contactar a ventas |

## 1.2 `highlights.items` — 4, `id`s existentes, 1:1

| `id` | `_order` | title EN | description EN |
|---|---|---|---|
| `6a6654324b1f63000457004b` | 1 | 34 inches deep | Five inches shallower than a Gamma. It clears corridors a full-width cabinet blocks. |
| `6a6654324b1f63000457004c` | 2 | 54 selections, 336 to 630 units | Six adjustable shelves, extendable to seven. |
| `6a6654324b1f63000457004d` | 3 | Pusher and spiral lanes | Boxed goods and hanging packs dispense from the same cabinet. |
| `6a6654324b1f63000457004e` | 4 | Built-in speakers | Audio cues at the sale, campaigns between them. |

| `id` | `_order` | title ES | description ES |
|---|---|---|---|
| `6a6654324b1f63000457004b` | 1 | 34 pulgadas de fondo | Cinco menos que una Gamma. Pasa por corredores donde un gabinete de ancho completo estorba. |
| `6a6654324b1f63000457004c` | 2 | 54 selecciones, de 336 a 630 unidades | Seis repisas ajustables, ampliables a siete. |
| `6a6654324b1f63000457004d` | 3 | Carriles empujadores y de espiral | Cajas y productos colgantes salen del mismo gabinete. |
| `6a6654324b1f63000457004e` | 4 | Altavoces integrados | Avisos durante la venta, campañas entre una y otra. |

## 1.3 `capabilities.items` — **de 10 a 5**: reusar `id` 1–5, borrar 6–10

| `id` | `_order` | text EN | text ES |
|---|---|---|---|
| `6a6654324b1f63000457004f` | 1 | Six adjustable shelves, extendable to seven | Seis repisas ajustables, ampliables a siete |
| `6a6654324b1f630004570050` | 2 | Pusher and spiral lanes in the same cabinet | Carriles empujadores y de espiral en el mismo gabinete |
| `6a6654324b1f630004570051` | 3 | Vertical zero-drop lift | Elevador vertical de caída cero |
| `6a6654324b1f630004570052` | 4 | Built-in speakers | Altavoces integrados |
| `6a6654324b1f630004570053` | 5 | Optional refrigeration, cash module and ADA package | Refrigeración, módulo de efectivo y paquete ADA opcionales |

**Borrar**: `…54`, `…55`, `…56`, `…57`, `…58`.

## 1.4 `specs` — 6 existentes 1:1, más una séptima a crear

| `id` | `_order` | label EN | value EN | label ES | value ES |
|---|---|---|---|---|---|
| `6a665538f11ace00048c3b0b` | 1 | Dimensions (H×W×D) | 77" × 47" × 34" | Dimensiones (Alto×Ancho×Profundidad) | 77" × 47" × 34" |
| `6a665538f11ace00048c3b0c` | 2 | Storage capacity | 336–630 units | Capacidad de almacenamiento | 336–630 unidades |
| `6a665538f11ace00048c3b0d` | 3 | Selections | 54 | Selecciones | 54 |
| `6a665538f11ace00048c3b0e` | 4 | Touchscreen | 10" | Pantalla táctil | 10" |
| `6a665538f11ace00048c3b0f` | 5 | Refrigeration | Optional | Refrigeración | Opcional |
| `6a665538f11ace00048c3b10` | 6 | Power | Dedicated 110V outlet / 15 amps | Alimentación | Toma dedicada 110V / 15 amps |
| *(crear)* | 7 | Weight | 850 lbs / 385 kg | Peso | 850 lbs / 385 kg |

---

# 2. Kappa 13 — `machines.id = 24`

Cambios chicos de cifra, pero **su `highlights_heading` es idéntico al de la familia Kappa**
(«Refrigerated. Visible. Premium.»). Padre e hijo diciendo la misma frase: el modelo no agrega nada
al entrar. Lo cambié.

Y acá es donde sale el **«Anti-ant design»** escrito como corresponde.

## 2.1 Campos simples

| campo | EN | ES |
|---|---|---|
| `tagline` | 70 selections, refrigerated 4°C to 25°C | 70 selecciones, refrigerada de 4 °C a 25 °C |
| `hero_eyebrow` | KAPPA SERIES | SERIE KAPPA |
| `highlights_eyebrow` | WHY KAPPA 13 | POR QUÉ KAPPA 13 |
| `highlights_heading` | Bottles, cans and fresh food. One cabinet. | Botellas, latas y comida fresca. Un solo gabinete. |
| `capabilities_heading` | Sealed cold, from load to sale. | Frío sellado, de la carga a la venta. |
| `cta_label` | Contact Sales | Contactar a ventas |

## 2.2 `highlights.items` — 4, `id`s existentes, 1:1

| `id` | `_order` | title EN | description EN |
|---|---|---|---|
| `6a6654334b1f630004570059` | 1 | 70 selections, 420 to 560 units | Seven shelves of beverages and fresh packs. |
| `6a6654334b1f63000457005a` | 2 | Holds 4°C to 25°C | One range covers chilled drinks and ambient snacks in the same cabinet. |
| `6a6654334b1f63000457005b` | 3 | Pusher and spiral lanes | Bottles, cans and boxed items dispense without jamming. |
| `6a6654334b1f63000457005c` | 4 | Sealed, insulated bay | The refrigeration and isolation system keeps pests out of the food. |

| `id` | `_order` | title ES | description ES |
|---|---|---|---|
| `6a6654334b1f630004570059` | 1 | 70 selecciones, de 420 a 560 unidades | Siete repisas de bebidas y productos frescos. |
| `6a6654334b1f63000457005a` | 2 | Sostiene de 4 °C a 25 °C | Un solo rango cubre bebidas frías y snacks a temperatura ambiente. |
| `6a6654334b1f63000457005b` | 3 | Carriles empujadores y de espiral | Botellas, latas y cajas salen sin trabarse. |
| `6a6654334b1f63000457005c` | 4 | Bahía sellada y aislada | El sistema de refrigeración y aislamiento mantiene las plagas fuera de la comida. |

El ítem 4 reemplaza a «Anti-ant design». Misma redacción que la Sigma, que es la que el brochure
nuevo usa.

## 2.3 `capabilities.items` — **de 9 a 5**: reusar `id` 1–5, borrar 6–9

| `id` | `_order` | text EN | text ES |
|---|---|---|---|
| `6a6654334b1f63000457005d` | 1 | Refrigerated 4°C to 25°C | Refrigeración de 4 °C a 25 °C |
| `6a6654334b1f63000457005e` | 2 | Sealed, insulated bay keeps pests out | Bahía sellada y aislada, a prueba de plagas |
| `6a6654334b1f63000457005f` | 3 | Pusher and spiral lanes in the same cabinet | Carriles empujadores y de espiral en el mismo gabinete |
| `6a6654334b1f630004570060` | 4 | Seven shelves, adjustable up to 70 selections | Siete repisas, ajustables hasta 70 selecciones |
| `6a6654334b1f630004570061` | 5 | Vertical zero-drop lift | Elevador vertical de caída cero |

**Borrar**: `…62`, `…63`, `…64`, `…65`.

## 2.4 `specs` — 6 existentes 1:1, más una séptima a crear

| `id` | `_order` | label EN | value EN | label ES | value ES |
|---|---|---|---|---|---|
| `6a66553bf11ace00048c3b11` | 1 | Dimensions (H×W×D) | 77" × 61" × 39" | Dimensiones (Alto×Ancho×Profundidad) | 77" × 61" × 39" |
| `6a66553bf11ace00048c3b12` | 2 | Storage capacity | 420–560 units | Capacidad de almacenamiento | 420–560 unidades |
| `6a66553bf11ace00048c3b13` | 3 | Selections | 70 | Selecciones | 70 |
| `6a66553bf11ace00048c3b14` | 4 | Touchscreen | 21.5" | Pantalla táctil | 21.5" |
| `6a66553bf11ace00048c3b15` | 5 | Temperature range | 4°C – 25°C | Rango de temperatura | 4 °C – 25 °C |
| `6a66553bf11ace00048c3b16` | 6 | Payment methods | Nayax: cards, Apple Pay, Google Pay | Métodos de pago | Nayax: tarjetas, Apple Pay, Google Pay |
| *(crear)* | 7 | Weight | 882 lbs / 400 kg | Peso | 882 lbs / 400 kg |

La spec 3 pasa de «Ajustable, hasta 70» a `70`: la comparativa la da plana. La 5 se renombra de
«Rango de refrigeración» a «Rango de temperatura», para que las cuatro máquinas con temperatura
—Alpha, Kappa 13, Kappa Double, Kappa Showcase y Sigma— usen la misma etiqueta y se puedan comparar.

---

# 3. Kappa Showcase — `machines.id = 26`

Dos cosas importantes acá, una corrección y una respuesta.

**Corrección**: la pantalla. El sitio y la ficha vieja dicen **22"**; la comparativa dice **21.5"**.
Aplico la comparativa por la regla que fijaste, pero **marcalo**: es el único caso de esta tanda
donde dos documentos del cliente se contradicen entre sí y no es el sitio el que está desactualizado.
Vale confirmarlo.

**Respuesta**: la comparativa **da el rango de temperatura, 4 °C a 25 °C**. Eso cierra el punto 3 de
«lo que hay que preguntarle al cliente» de `machines-data-audit.md`, que estaba abierto porque la
ficha vieja listaba «temperature control» sin cifra. Una pregunta menos para el cliente.

## 3.1 Campos simples

| campo | EN | ES |
|---|---|---|
| `tagline` | 12 lit display bays, 70 selections, refrigerated | 12 bahías iluminadas, 70 selecciones, refrigerada |
| `hero_eyebrow` | KAPPA SERIES | SERIE KAPPA |
| `highlights_eyebrow` | WHY KAPPA SHOWCASE | POR QUÉ KAPPA SHOWCASE |
| `highlights_heading` | See it. Want it. Own it. | Lo ves. Lo quieres. Es tuyo. |
| `capabilities_heading` | Show the real product, not a photo. | Muestra el producto real, no una foto. |
| `cta_label` | Contact Sales | Contactar a ventas |

`highlights_heading` en inglés se queda como está: es corto, es declarativo y es el único del
catálogo que no se parece a ningún otro. El `capabilities_heading` sí cambia — «Automated retail
experience.» es descriptivo, que es justo lo que la voz no hace.

## 3.2 `highlights.items` — 4, `id`s existentes, 1:1

| `id` | `_order` | title EN | description EN |
|---|---|---|---|
| `6a6654354b1f63000457006a` | 1 | 12 illuminated display bays | Circular front bays hold the real product, lit, before anyone buys. |
| `6a6654354b1f63000457006b` | 2 | 70 selections, 420 to 560 units | Seven floors of ten lanes behind the display. |
| `6a6654354b1f63000457006c` | 3 | Refrigerated 4°C to 25°C | Fresh product on display stays sellable all day. |
| `6a6654354b1f63000457006d` | 4 | Open 24/7 | No staff, no closing time. |

| `id` | `_order` | title ES | description ES |
|---|---|---|---|
| `6a6654354b1f63000457006a` | 1 | 12 bahías de exhibición iluminadas | Bahías circulares al frente con el producto real, iluminado, antes de comprar. |
| `6a6654354b1f63000457006b` | 2 | 70 selecciones, de 420 a 560 unidades | Siete pisos de diez carriles detrás de la exhibición. |
| `6a6654354b1f63000457006c` | 3 | Refrigerada de 4 °C a 25 °C | El producto fresco en exhibición se mantiene vendible todo el día. |
| `6a6654354b1f63000457006d` | 4 | Abierta 24/7 | Sin personal, sin hora de cierre. |

## 3.3 `capabilities.items` — **de 8 a 5**: reusar `id` 1–5, borrar 6–8

| `id` | `_order` | text EN | text ES |
|---|---|---|---|
| `6a6654354b1f63000457006e` | 1 | 12 illuminated circular display bays | 12 bahías circulares de exhibición iluminadas |
| `6a6654354b1f63000457006f` | 2 | Refrigerated 4°C to 25°C | Refrigeración de 4 °C a 25 °C |
| `6a6654354b1f630004570070` | 3 | Seven floors of ten lanes | Siete pisos de diez carriles |
| `6a6654354b1f630004570071` | 4 | Internal lift | Elevador interno |
| `6a6654354b1f630004570072` | 5 | Multi-item checkout in one transaction | Varios productos en una sola transacción |

**Borrar**: `…73`, `…74`, `…75`.

## 3.4 `specs` — 6 existentes 1:1, más una séptima a crear

| `id` | `_order` | label EN | value EN | label ES | value ES |
|---|---|---|---|---|---|
| `6a66553ef11ace00048c3b17` | 1 | Dimensions (H×W×D) | 81" × 64" × 39" | Dimensiones (Alto×Ancho×Profundidad) | 81" × 64" × 39" |
| `6a66553ef11ace00048c3b18` | 2 | Weight | 1,900 lbs / 862 kg | Peso | 1.900 lbs / 862 kg |
| `6a66553ef11ace00048c3b19` | 3 | Touchscreen | 21.5" | Pantalla táctil | 21.5" |
| `6a66553ef11ace00048c3b1a` | 4 | Selections | 70 — seven floors × ten lanes | Selecciones | 70 — siete pisos × diez carriles |
| `6a66553ef11ace00048c3b1b` | 5 | Illuminated sample bays | 12 | Bahías de muestra iluminadas | 12 |
| `6a66553ef11ace00048c3b1c` | 6 | Power | 110–120V, 60Hz, 20A dedicated circuit | Alimentación | 110–120V, 60Hz, circuito dedicado 20A |
| *(crear)* | 7 | Temperature range | 4°C – 25°C | Rango de temperatura | 4 °C – 25 °C |

La spec 2 arregla el separador en español **y** agrega el equivalente en kilos, que todas las demás
máquinas tienen y esta no. 862 kg es la conversión de 1.900 lbs, no un dato del fabricante — si
preferís no publicar una conversión propia, dejá `1.900 lbs` a secas.

---

# 4. Lo que queda

| Máquina | Qué falta | Por qué |
|---|---|---|
| Gamma 13 | Reescritura completa, **sin tocar las unidades** | Pendiente: 800–1.800 vs 800–1.200 es pregunta al cliente |
| Alpha 13 | Reescritura completa contra el brochure nuevo | — |
| Alpha 10 | Solo higiene del inglés | Puede estar fuera de catálogo |

## Un pedido de nombre, del mismo tipo que el de los Doubles

La comparativa la llama **«Kappa Showcase»**, sin «Blanco». En la base es `Kappa Showcase Blanco`, y
«Blanco» viene del nombre de la carpeta del Shared Folder, no de un documento del fabricante.

No lo cambié: es una decisión de rename como la de los Doubles, y esos los hiciste vos. Pero si el
catálogo nuevo la llama Kappa Showcase a secas, el sitio debería también — sobre todo si algún día
hay una variante en otro color, porque entonces «Blanco» pasa a ser información y hoy es ruido.
