# Contenido de las fichas de máquina — nota de traspaso

Escrito el 2026-09-16 por la sesión de contenido. **Al 2026-09-16 no se cargó nada**: las cinco
tandas están escritas y sin aplicar.

Si arrancás en frío, esto alcanza para cargar todo sin leer los mensajes de nadie.

## Qué hay acá

Contenido EN + ES de **las diez máquinas** y de la familia Sigma, más el kit de serie. Cada tanda
trae, por campo, el valor en los dos idiomas, la ruta exacta y el `id` de cada ítem de array.

No es solo traducción: también corrige inglés roto que estaba publicado, cifras desactualizadas
contra los brochures de 2026-09, y una característica de producto que no existe.

## Orden de carga

Las tandas son independientes entre sí — se pueden cargar en cualquier orden y por separado. Si hay
que elegir, este orden pone primero lo que hoy publica algo **incorrecto**:

| # | Archivo | Qué carga |
|---|---|---|
| 1 | `tanda-3-datos-incorrectos.md` | **Zeta 2**, Gamma 10, familia Sigma |
| 2 | `tanda-5-gamma13-alphas.md` | Gamma 13, Alpha 13, Alpha 10 |
| 3 | `tanda-4-delta-kappas.md` | Delta 7, Kappa 13, Kappa Showcase |
| 4 | `tanda-1-doubles.md` | Gamma Double, Kappa Double, **kit de serie** |
| 5 | `tanda-2-sigma.md` | Sigma Frozen |

**Zeta 2 va primero de todo.** Su ficha publica hoy una capability que dice «Electronic lock for
enhanced security», y la comparativa del fabricante dice que la Zeta 2 es la única de la línea que
lleva **solo cerradura con llave**. El sitio promete hardware de seguridad que la máquina no trae.

## La regla que rompe cosas si se olvida

**Al escribir un locale hay que mandar el `id` de cada ítem del array.** Sin el `id`, Payload borra
el otro idioma y responde `200 OK`. Por eso cada tabla de estas tandas lleva el `id` en la primera
columna.

Los `id` salieron de la base local restaurada el 2026-09-16. **Sigma no tiene `id`s** porque ese
restore es anterior a que existiera: sus ítems hay que crearlos o empatarlos por `_order`.

Donde la cantidad de ítems baja —casi todas las máquinas, al sacarles el kit de serie— cada tanda
dice qué `id` reusar y cuáles borrar.

## Decisiones tomadas, para que nadie las reabra

| Decisión | Qué se resolvió | Por qué |
|---|---|---|
| **Registro en español** | `tú`, nunca `usted` | Decidido por uso: el home aprobado no tiene una sola forma de usted. En `voice-and-tone.md` |
| **Mayúsculas en español** | Mayúscula inicial sola, nunca Title Case | El Title Case en español no tiene regla estable: cada «de», «y», «en» es un juicio, y a 150 cadenas garantiza inconsistencia. Excepciones: nombres propios, nombres de modelo, y *Partnership* / *Branding* |
| **Gamma 13, capacidad** | **120 selecciones y 800–1.800 unidades**, las dos congeladas | Selecciones y unidades salen de la misma fila y describen lo mismo. Cambiar una sola produce un par que no afirma ningún documento |
| **Vocabulario** | `Selections` / `Selecciones` para el total. Para la medida por fila, «productos por repisa» en español; *facings* se conserva en inglés | «Facings únicos» dejaba *facings* sin traducir, y el documento nuevo renombró el concepto |
| **Kit de serie** | Escrito una sola vez, en `tanda-1` | 70% del cuerpo repetido en diez páginas es contenido casi duplicado. Dónde se renderiza lo decide front; el texto no cambia según dónde viva |
| **CTA de la familia Sigma** | Plural: «Explora nuestros modelos Sigma» | Zeta también tiene un solo modelo y usa plural. El singular en Sigma sola crearía una inconsistencia nueva |
| **`hero_eyebrow` de Sigma en ES** | «Retail congelado» | Gamma y Kappa comparten «Próxima generación», el mismo genérico repetido. Es un defecto a no propagar, no un patrón |
| **Peso de Kappa Showcase** | Se publica `1.900 lbs / 862 kg` | Una conversión de unidades es aritmética, no un dato inventado. Nueve máquinas muestran kg y una no se lee como incompleta |
| **Alpha 10** | Solo higiene del inglés, sin copy nueva ni cifras nuevas | Puede estar fuera de catálogo. Si se fusiona con Alpha 13, no se tiró trabajo |

## Lo que se borra a propósito

No es texto sin traducir: es **inglés malo publicado**. Un texto malo traducido sigue siendo malo en
dos idiomas.

- **«All-steel fuselage»**, en 7 máquinas — *fuselage* es el casco de un avión. Reemplazado por
  «insulated all-steel cabinet».
- **«Anti-ant design»**, en 3 — calco literal. La redacción correcta, que el brochure nuevo usa, es
  «sealed, insulated bay keeps pests out».
- **«Fully automatic system»** — no dice nada en una máquina automática.
- **«Clear windows» / «Luxury clear windows» / «Luxury windows»** — tres redacciones de lo mismo.
- **«Android system»** en Zeta 2 — detalle interno, no valor para quien compra.
- **«Electronic lock for enhanced security»** en Zeta 2 — **falso**, la máquina no lo trae.

## Las cuatro preguntas abiertas al cliente

Ninguna bloquea la carga: el contenido está escrito de forma que ninguna depende de la respuesta.

1. **El ciclo del horno de las Alpha.** La home dice «about 50 seconds», las fichas dicen 2–3
   minutos, el brochure nuevo dice ~50 segundos. Alpha 13 ya va corregida; **Alpha 10 queda en 2–3
   minutos a propósito**, porque es un equipo distinto (5.200 W contra 4.500 W, 17 niveles contra 7)
   y podría tener un ciclo propio. Si lo tiene, es información de venta, no un error.
2. **Capacidad de Gamma 13.** 120 selecciones / 800–1.800 unidades (lo publicado) contra 140 /
   800–1.200 (comparativa). Se preguntan **las dos juntas**, no solo las unidades.
3. **Ancho de Alpha 13.** 72.5" en la base contra 68" en el brochure nuevo. Es el único número del
   brochure que no empata con ninguna de las dos Alpha. No se tocó.
4. **Pantalla de Kappa Showcase.** 22" en el sitio y en la ficha vieja, 21.5" en la comparativa. Es
   el único caso donde **dos documentos del cliente se contradicen entre sí** en vez de que el sitio
   esté desactualizado. Se aplicó 21.5" por la regla vigente, pero conviene confirmarlo.

Y una que se cerró en el camino: **el rango de temperatura de la Kappa Showcase es 4 °C a 25 °C**, que
la comparativa sí da. Estaba abierta en `machines-data-audit.md`.

## Huecos que no son de contenido

- **La ventilación trasera de Sigma no tiene dónde vivir.** Es el único modelo con una restricción de
  colocación, y decide si entra contra una pared en un lobby. No es capacidad ni spec: **falta un
  campo de requisitos de instalación**. Mientras tanto el dato vive en
  `Shared Folder/Fichas Extraidas/BROCHURE-2026-09-SIGMA-FROZEN.md`.
- **Las dos configuraciones de la Zeta 2 entran a la fuerza en un solo campo.** La spec de
  dimensiones dice «Pared: … · Piso: …» porque no hay otro lugar. Es un apaño; la solución sería que
  `specs` admitiera una variante por configuración.
- **Ninguna Alpha publica su alimentación**, y son las únicas del catálogo que no son de 110 V.
  Alpha 13 ya la lleva en esta tanda. Para Alpha 10 la fila está escrita y sin incluir, en
  `tanda-5`, porque agregarla se sale de la higiene que se le pidió.
- **Tres excepciones al kit de serie** hay que anotarlas donde se renderice, o el bloque miente:
  la pantalla de 21.5" no es universal (Zeta 2 lleva 32", Delta 7 lleva 10", Alpha 10 lleva 49");
  la Zeta 2 lleva **solo** cerradura con llave; y la Zeta 2 lleva **cámara interna solamente**.

## Renames pendientes de aprobación del usuario

Los textos de `tanda-1` asumen **«Gamma Double»** y **«Kappa Double»**, sin el `13`. Si `name`
todavía dice «Gamma 13 Double», hay que corregirlo en los dos locales: el nombre aparece dentro de
varios textos. **Los slugs no se tocan** (`gamma-13-double`, `kappa-13-double`) — cambiarlos rompe
URLs publicadas y es decisión de release.

Sin resolver: la comparativa llama **«Kappa Showcase»** a secas, y en la base es «Kappa Showcase
Blanco». «Blanco» viene del nombre de una carpeta del Shared Folder, no de un documento del
fabricante.

## Lo que NO está hecho

**Los `meta.title` y `meta.description`.** Ninguna de las cinco familias ni de las diez máquinas
tiene metadatos, en ningún idioma — son ~60 cadenas. Es trabajo de la sesión de contenido y está
pendiente a propósito: se cortó para dejar las diez fichas cerradas con una frontera limpia.

El detalle está en `docs/machines-data-audit.md`, sección 9.
