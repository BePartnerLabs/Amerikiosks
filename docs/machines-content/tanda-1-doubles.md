# Tanda 1 — Gamma Double y Kappa Double

Contenido EN + ES listo para cargar. Escrito por la sesión de contenido, no cargado por ella.

**Reglas aplicadas** (de `docs/business/voice-and-tone.md`): «nosotros» en verbo, «tú» al lector,
afirmación corta + prueba con cifra debajo, sin coberturas, títulos declarativos.
El español no traduce la estructura inglesa: dice menos.
**Mayúscula inicial sola en español**, nunca Title Case.

**Fuentes**: `BROCHURE-2026-09-GAMMA-DOUBLE.md` para Gamma Double (completo) ·
`BROCHURE-2026-09-COMPARATIVA.md` para Kappa Double (solo su fila; el brochure existe sin transcribir).

**Ninguna cifra inventada.** Donde la fuente no da el número, el campo no existe — ver «Lo que falta» al final.

---

## Nota previa sobre el nombre

Los textos asumen que el rename ya está hecho en producción: **Gamma Double** y **Kappa Double**,
sin el `13`. Si `machines_locales.name` todavía dice «Gamma 13 Double» / «Kappa 13 Double», hay que
corregirlo en los dos locales — el nombre aparece dentro de varios de los textos de abajo.

Los slugs **no** se tocan (`gamma-13-double`, `kappa-13-double`): cambiarlos rompe URLs publicadas
y es decisión de release, no de contenido.

---

# 1. Gamma Double — `machines.id = 22`, slug `gamma-13-double`

## 1.1 Campos simples — tabla `machines_locales`

| campo | EN | ES |
|---|---|---|
| `name` | Gamma Double | Gamma Double |
| `tagline` | 113" wide, 240 selections, one screen | 113" de vidrio, 240 selecciones, una sola pantalla |
| `hero_eyebrow` | GAMMA SERIES | SERIE GAMMA |
| `highlights_eyebrow` | WHY GAMMA DOUBLE | POR QUÉ GAMMA DOUBLE |
| `highlights_heading` | Twice the store. One screen. | El doble de tienda. Una sola pantalla. |
| `capabilities_heading` | Two cabinets. One transaction. | Dos gabinetes. Una sola compra. |
| `cta_label` | Contact Sales | Contactar a ventas |

`highlights_heading` en inglés es el titular del propio brochure del cliente — no lo inventé.

## 1.2 `highlights.items` — tablas `machines_highlights_items` / `_locales`

Los cuatro ítems ya existen. **Mandar el `id` de cada uno** o se borra el otro idioma.

| `id` | `_order` | title EN | description EN |
|---|---|---|---|
| `6a6654314b1f630004570047` | 1 | One store, two cabinets | Master and slave share one screen, one cart, one pickup door — across 113" of glass. |
| `6a6654314b1f630004570048` | 2 | Up to 240 selections | 14 adjustable shelves hold 1,200 to 3,000 units. |
| `6a6654314b1f630004570049` | 3 | Nothing drops | A single gantry crosses the full 113" and lowers each item. Glass and boxed electronics arrive intact. |
| `6a6654314b1f63000457004a` | 4 | Two categories, one sale | Run ambient on one side, a second category on the other. Still one transaction. |

| `id` | `_order` | title ES | description ES |
|---|---|---|---|
| `6a6654314b1f630004570047` | 1 | Una tienda, dos gabinetes | Master y slave comparten pantalla, carro y puerta de retiro. 113" de vidrio. |
| `6a6654314b1f630004570048` | 2 | Hasta 240 selecciones | 14 repisas ajustables, de 1.200 a 3.000 unidades. |
| `6a6654314b1f630004570049` | 3 | Nada se cae | Un solo carro recorre los 113" y baja cada artículo. Sin caída libre. |
| `6a6654314b1f63000457004a` | 4 | Dos categorías, una sola venta | Ambiente de un lado, otra categoría del otro. Se cobra junto. |

## 1.3 `capabilities.items` — **hay que crearlos, hoy son cero**

Solo lo que distingue a este modelo. El kit de serie va aparte (sección 3).

| `_order` | text EN | text ES |
|---|---|---|
| 1 | Master + slave: two cabinets, one screen, one cart | Master + slave: dos gabinetes, una pantalla, un carro |
| 2 | Gantry lift across the full 113" — no free fall | Carro elevador a lo ancho de los 113" — sin caída libre |
| 3 | 14 adjustable shelves, 7 per cabinet | 14 repisas ajustables, 7 por gabinete |
| 4 | Ships as two cabinets, joined on site | Se envía en dos gabinetes y se une en sitio |
| 5 | Optional refrigeration holds 4°C to 25°C | Refrigeración opcional: de 4 °C a 25 °C |
| 6 | Optional illuminated topper — 93" total, removable | Topper iluminado opcional: 93" en total, desmontable |

## 1.4 `specs` — **hay que crearlas, hoy son cero**

| `_order` | label EN | value EN | label ES | value ES |
|---|---|---|---|---|
| 1 | Dimensions (H×W×D) | 78" × 113" × 39" | Dimensiones (Alto×Ancho×Profundidad) | 78" × 113" × 39" |
| 2 | Storage capacity | 1,200–3,000 units | Capacidad de almacenamiento | 1.200–3.000 unidades |
| 3 | Selections | 240 | Selecciones | 240 |
| 4 | Weight | 3,000 lbs / 1,360 kg | Peso | 3.000 lbs / 1.360 kg |
| 5 | Power | Dedicated 110V outlet / 15 amps | Alimentación | Toma dedicada 110V / 15 amps |
| 6 | Refrigeration | Optional — 4°C to 25°C | Refrigeración | Opcional — 4 °C a 25 °C |
| 7 | Payment methods | Nayax: cards, Apple Pay, Google Pay | Métodos de pago | Nayax: tarjetas, Apple Pay, Google Pay |

---

# 2. Kappa Double — `machines.id = 25`, slug `kappa-13-double`

Escrita contra su fila de la comparativa. **Queda más flaca que Gamma Double a propósito**: su
brochure existe pero no está transcrito, así que falta peso, repisas, eléctrico y opcionales.

## 2.1 Campos simples — tabla `machines_locales`

| campo | EN | ES |
|---|---|---|
| `name` | Kappa Double | Kappa Double |
| `tagline` | 104" wide, 140 selections, refrigerated throughout | 104" de ancho, 140 selecciones, refrigerado de punta a punta |
| `hero_eyebrow` | KAPPA SERIES | SERIE KAPPA |
| `highlights_eyebrow` | WHY KAPPA DOUBLE | POR QUÉ KAPPA DOUBLE |
| `highlights_heading` | Twice the cold. One screen. | El doble de frío. Una sola pantalla. |
| `capabilities_heading` | Two cabinets. One cold chain. | Dos gabinetes. Una sola cadena de frío. |
| `cta_label` | Contact Sales | Contactar a ventas |

## 2.2 `highlights.items` — tablas `machines_highlights_items` / `_locales`

Los cuatro ítems ya existen. **Mandar el `id`.**

| `id` | `_order` | title EN | description EN |
|---|---|---|---|
| `6a6654344b1f630004570066` | 1 | 140 selections, all refrigerated | 840 to 1,120 units held between 4°C and 25°C. |
| `6a6654344b1f630004570067` | 2 | 104" of unbroken cold | Two cabinets joined into a single refrigerated run. |
| `6a6654344b1f630004570068` | 3 | Pusher and spiral lanes | Bottles, cans and fresh packs dispense from the same machine. |
| `6a6654344b1f630004570069` | 4 | One screen for both | The 21.5" touch runs the full selection as a single store. |

| `id` | `_order` | title ES | description ES |
|---|---|---|---|
| `6a6654344b1f630004570066` | 1 | 140 selecciones, todas refrigeradas | De 840 a 1.120 unidades, entre 4 °C y 25 °C. |
| `6a6654344b1f630004570067` | 2 | 104" de frío continuo | Dos gabinetes unidos en una sola línea refrigerada. |
| `6a6654344b1f630004570068` | 3 | Carriles empujadores y de espiral | Botellas, latas y frescos salen de la misma máquina. |
| `6a6654344b1f630004570069` | 4 | Una pantalla para los dos | La táctil de 21.5" maneja todo como una sola tienda. |

## 2.3 `capabilities.items` — **hay que crearlos, hoy son cero**

| `_order` | text EN | text ES |
|---|---|---|
| 1 | Master + slave: two cabinets, one screen | Master + slave: dos gabinetes, una pantalla |
| 2 | Refrigerated 4°C to 25°C across both cabinets | Refrigeración de 4 °C a 25 °C en los dos gabinetes |
| 3 | Pusher and spiral lanes in the same unit | Carriles empujadores y de espiral en la misma unidad |
| 4 | Ships as two cabinets, joined on site | Se envía en dos gabinetes y se une en sitio |

## 2.4 `specs` — **hay que crearlas, hoy son cero**

Cinco, no siete. Faltan peso y eléctrico porque la comparativa no los da.

| `_order` | label EN | value EN | label ES | value ES |
|---|---|---|---|---|
| 1 | Dimensions (H×W×D) | 77" × 104" × 39" | Dimensiones (Alto×Ancho×Profundidad) | 77" × 104" × 39" |
| 2 | Storage capacity | 840–1,120 units | Capacidad de almacenamiento | 840–1.120 unidades |
| 3 | Selections | 140 | Selecciones | 140 |
| 4 | Temperature range | 4°C – 25°C | Rango de temperatura | 4 °C – 25 °C |
| 5 | Payment methods | Nayax: cards, Apple Pay, Google Pay | Métodos de pago | Nayax: tarjetas, Apple Pay, Google Pay |

---

# 3. El kit de serie — se escribe una vez, no diez

Dónde se renderiza lo deciden front y el orquestador. El texto no cambia según dónde viva.
Si al final no se implementa como bloque, se pega igual en cada modelo.

**Heading**

| EN | ES |
|---|---|
| What every machine ships with | Viene de serie en toda la línea |

**Ítems**

| # | EN | ES |
|---|---|---|
| 1 | 21.5" touchscreen | Pantalla táctil de 21.5" |
| 2 | Nayax integrated payments — cards, Apple Pay, Google Pay | Pagos integrados Nayax: tarjetas, Apple Pay, Google Pay |
| 3 | Remote monitoring from the Amerikiosks platform — live inventory and sales, remote pricing, remote reboot | Monitoreo remoto desde la plataforma de Amerikiosks: inventario y ventas en vivo, precios y reinicio a distancia |
| 4 | Internal and external cameras | Cámaras interna y externa |
| 5 | Key lock plus an independent electronic lock | Cerradura con llave más cerradura electrónica independiente |
| 6 | Your brand on the crown, the cabinet and the screen | Tu marca en la corona, el gabinete y la pantalla |
| 7 | 60 to 90 day delivery, one year warranty, planogram setup and training | Entrega de 60 a 90 días, un año de garantía, planograma y capacitación |

**Dos excepciones que hay que anotar donde se renderice el kit**, o el kit miente:

- **Pantalla**: 21.5" es el estándar, pero Zeta 2 lleva 32", Delta 7 lleva 10" y Alpha 10 lleva 49".
- **Cerradura**: la Zeta 2 lleva **solo** cerradura con llave, sin la electrónica.

---

# 4. Lo que falta, y de quién depende

| Qué | De quién | Bloquea |
|---|---|---|
| Transcripción del brochure de **Kappa Double** | Quien tenga presupuesto de tokens | Peso, repisas, eléctrico y opcionales de Kappa Double. Su ficha queda incompleta hasta entonces |
| Confirmar el **rename** a Gamma Double / Kappa Double en `name`, los dos locales | Orquestador | Los textos de arriba ya lo asumen |
| Decidir **«Selections» vs «Unique facings»** en toda la línea | Orquestador / cliente | Ver abajo |

## La decisión de vocabulario que abren estas dos fichas

Las dos usan **`Selections` / `Selecciones`**, que es lo que dice el documento nuevo. Las otras ocho
máquinas dicen **`Unique facings` / `Facings únicos`**.

Dos razones para migrar las diez y no dejarlo mezclado:

1. **`Facings únicos` deja *facings* sin traducir**, que es exactamente el anglicismo que el resto de
   este trabajo está sacando.
2. Mezclar los dos términos en una tabla comparativa **hace que parezca que miden cosas distintas**,
   cuando el documento nuevo aclara que selecciones = productos distintos, o sea el mismo concepto.

No lo aplico a las otras ocho por mi cuenta: es un cambio en máquinas que no están en esta tanda.
Decime y va en la tanda siguiente.
