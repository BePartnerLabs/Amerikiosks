# Tanda 2 — Sigma Frozen

Contenido EN + ES listo para cargar. Mismas reglas que la tanda 1
(`docs/business/voice-and-tone.md`, mayúscula inicial sola en español, ninguna cifra inventada).

**Fuente**: `BROCHURE-2026-09-SIGMA-FROZEN.md`, completo. No queda nada sin cubrir.

**Escrita de cero**, como pediste. No miré tus textos de trabajo.

**Sin `id`s**: mi restore local es anterior a que existiera Sigma, así que no tengo los de los ítems
de array. Los campos simples van sobre `machines.id = 28`; los ítems de highlights, capabilities y
specs hay que crearlos o, si ya los creaste, empatarlos por `_order`.

---

# Sigma Frozen — `machines.id = 28`, slug `sigma-frozen`

## 1. Campos simples — tabla `machines_locales`

| campo | EN | ES |
|---|---|---|
| `name` | Sigma Frozen | Sigma Frozen |
| `tagline` | True −25°C, 54 selections, standard outlet | −25 °C de verdad, 54 selecciones, toma común |
| `hero_eyebrow` | SIGMA SERIES | SERIE SIGMA |
| `highlights_eyebrow` | WHY SIGMA FROZEN | POR QUÉ SIGMA FROZEN |
| `highlights_heading` | Twenty-five below. Anywhere you have an outlet. | Veinticinco bajo cero. Donde haya un enchufe. |
| `capabilities_heading` | A real freezer. Not a cooler. | Un congelador de verdad. No un enfriador. |
| `cta_label` | Contact Sales | Contactar a ventas |

`highlights_heading` es el titular del propio brochure. `capabilities_heading` sale de su resumen
(«un congelador de verdad, no un enfriador») — es la frase que separa a Sigma del resto del catálogo
y por eso la subí a heading en vez de enterrarla en un bullet.

El `tagline` carga el argumento comercial completo: congela de verdad **y** no necesita instalación
especial. Es lo que un venue pregunta primero.

## 2. `highlights.items`

| `_order` | title EN | description EN |
|---|---|---|
| 1 | Holds −25°C | The only cabinet in the line that truly freezes. Ice cream, proteins, prepared meals. |
| 2 | 54 selections, 400 to 700 units | Seven adjustable shelves, up to eight facings each. |
| 3 | Belts and spirals on the same shelf | Dual-motor lanes handle tubs, bars and bagged ice from one row. |
| 4 | Zero fall to the bay | A lift platform sets each item down beside the glass. Cones and tubs arrive whole. |

| `_order` | title ES | description ES |
|---|---|---|
| 1 | Sostiene −25 °C | El único gabinete de la línea que congela de verdad. Helado, proteínas, comida preparada. |
| 2 | 54 selecciones, de 400 a 700 unidades | Siete repisas ajustables, hasta ocho productos por repisa. |
| 3 | Cinta y espiral en la misma repisa | Carriles de doble motor: tinas, barras y hielo en bolsa desde una misma fila. |
| 4 | Caída cero hasta la entrega | Una plataforma elevadora deposita cada artículo junto al vidrio. Los conos y las tinas llegan enteros. |

## 3. `capabilities.items` — solo lo distintivo, el kit va aparte

| `_order` | text EN | text ES |
|---|---|---|
| 1 | Freezes to −25°C as standard | Congela hasta −25 °C de serie |
| 2 | Dual-motor lanes: belt and spiral mixed on the same shelf | Carriles de doble motor: cinta y espiral mezcladas en la misma repisa |
| 3 | Lift platform delivers beside the glass — zero fall | Plataforma elevadora que entrega junto al vidrio — caída cero |
| 4 | Sealed, insulated bay keeps pests out | Bahía sellada y aislada, a prueba de plagas |
| 5 | Seven adjustable shelves in an insulated all-steel cabinet | Siete repisas ajustables en gabinete de acero aislado |
| 6 | Built-in speakers | Altavoces integrados |
| 7 | Optional illuminated topper — 93" total, removable | Topper iluminado opcional: 93" en total, desmontable |

El ítem 4 es el que en el resto del catálogo está escrito como **«anti-ant design»**. Así es como se
dice en inglés: el brochure describe una bahía sellada y aislada, que es lo que hace, y es lo que hay
que usar también cuando reescribamos Kappa 13 y Kappa Double.

## 4. `specs`

| `_order` | label EN | value EN | label ES | value ES |
|---|---|---|---|---|
| 1 | Dimensions (H×W×D) | 78" × 56" × 37.5" | Dimensiones (Alto×Ancho×Profundidad) | 78" × 56" × 37.5" |
| 2 | Storage capacity | 400–700 units | Capacidad de almacenamiento | 400–700 unidades |
| 3 | Selections | 54 | Selecciones | 54 |
| 4 | Temperature range | Down to −25°C | Rango de temperatura | Hasta −25 °C |
| 5 | Weight | 926 lbs / 420 kg | Peso | 926 lbs / 420 kg |
| 6 | Power | Dedicated 110V outlet / 15 amps | Alimentación | Toma dedicada 110V / 15 amps |
| 7 | Payment methods | Nayax: cards, Apple Pay, Google Pay | Métodos de pago | Nayax: tarjetas, Apple Pay, Google Pay |

---

# Tres cosas para vos

## 1. La ventilación trasera no tiene dónde vivir

El brochure dice que Sigma **necesita espacio de ventilación en la parte trasera** para la unidad de
congelado. Es el único modelo del catálogo con una restricción de colocación, y es exactamente el
dato que decide si entra o no en un lobby contra una pared.

No lo metí en `capabilities` porque no es una capacidad, es un requisito — y meterlo ahí lo disfraza.
Tampoco encaja en `specs`, que son datos del equipo. **Necesita un campo o un bloque de requisitos de
instalación que hoy no existe.** Lo dejo marcado: si se pierde, un venue se entera cuando llega la
máquina.

## 2. «Facings» no siempre quiere decir lo mismo, y eso afecta mi recomendación de la tanda 1

En la tanda 1 propuse migrar `Facings únicos` a `Selecciones` en las diez máquinas. Sigue en pie,
pero encontré un matiz: el brochure de Sigma usa **las dos cosas a la vez** — «Selecciones: 54» y
«Facings por repisa: hasta 8». No son sinónimos ahí: selecciones son productos distintos en total,
facings por repisa son posiciones en una fila.

Entonces la regla queda: **`Selections` / `Selecciones` para el total** (que es lo que va en specs), y
cuando haya que hablar de la medida por repisa, en español **«productos por repisa»**, nunca
«facings por repisa». En inglés *facings* se queda, que ahí sí es la palabra.

## 3. Contradicción menor en tus instrucciones, no la resolví solo

En tu primer mensaje decís **«las seis familias están perfectas, no las toques»** y dos párrafos más
abajo que la familia `sigma` (id 6) la creaste vos **«con textos de trabajo, no definitivos»** y que
la revise con el mismo criterio que el resto.

Escribí solo la máquina. Si la familia Sigma también es texto de trabajo, decímelo y te la mando en
la tanda siguiente — son pocos campos y ya tengo el brochure leído.
