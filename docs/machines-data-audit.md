---
title: La data de máquinas y familias, contra las fichas del fabricante
read_when: Se prepara el visado del cliente de /machines, o se va a cargar o corregir specs de una máquina.
enforced_by: nada — es una comparación puntual, no una regla
lifespan: temporal — borrar cuando los huecos estén cerrados y las fichas cargadas
---

# La data de máquinas, contra las fichas

Comparación hecha el **2026-09-14** entre la base de datos (restore de
producción) y las fichas del fabricante extraídas en
`Shared Folder/Fichas Extraidas/`, que a su vez salen de los PDF de
`Shared Folder/Maquinas por modelo/`.

> **No abras los PDF.** Todo su contenido está transcrito en markdown en
> `Shared Folder/Fichas Extraidas/`, y ese directorio tiene un `_LEEME.md` que
> dice qué documento manda cuando dos se contradicen. Leer un PDF cuesta
> órdenes de magnitud más y no aporta nada que no esté ahí.

**El estado general es bueno.** Las cinco familias están completas y traducidas:
nombre, tagline, descripción y cuatro características con título y descripción
en los dos idiomas, más las tres imágenes (`thumbnail`, `rowImage`,
`heroLineupImage`). Ocho de las diez máquinas tienen seis specs cargadas en los
dos idiomas y ninguna cifra inventada — donde la ficha no dice un número, la
base tampoco lo dice.

Lo que sigue es lo que falta o no coincide.

---

# Actualización 2026-09-14: cinco brochures nuevos

El cliente mandó cinco brochures rediseñados, guardados en
`Shared Folder/Brochures nuevos 2026-09/`: **Alpha Hot Food, Gamma 10, Gamma
Double, Sigma Frozen y Zeta 2**. Son posteriores a las fichas técnicas y **las
contradicen en varios números**, así que pasan a ser la fuente de verdad para
esos cinco productos. Los otros seis siguen gobernados por su ficha.

Esto cambia tres cosas de fondo, antes de entrar en los números.

## 0.a Hay una familia nueva: Sigma

**Sigma Frozen no existe en la base.** Es una sexta familia, clase congelado, y
es el único gabinete del catálogo que baja a **−25 °C** — un congelador de
verdad, no un enfriador. No es una variante de nada: tiene su propia mecánica
(cintas transportadoras y espirales mezcladas en la misma repisa, plataforma
elevadora de caída cero) y su propio mercado (helado, comida preparada
congelada, hielo).

| | Sigma Frozen |
|---|---|
| Dimensiones | 78" × 56" × 37.5" · **93" con topper** |
| Peso | 926 lbs / 420 kg |
| Repisas | 7 ajustables, hasta 8 facings por repisa |
| Selecciones | 54 · 400 a 700 unidades |
| Pantalla | 21.5" |
| Eléctrico | 110 V, 60 Hz, circuito dedicado 15 A |
| Temperatura | hasta −25 °C de serie |
| De serie | aislamiento anti-hormigas, doble cerradura, cámaras interna y externa, altavoces |
| Opcionales | topper iluminado, módulo de efectivo, paquete ADA |

Crear la familia y su primer modelo es trabajo de `/admin`, no de código: el
bloque de filas la va a tomar sola. Lo que sí hay que confirmar con el cliente
es **si Sigma entra en el visado o queda para después**.

## 0.b La Gamma Double ya tiene ficha — el hueco se cerró

Era el primer pendiente de este documento. El brochure trae todo:

| | Gamma Double |
|---|---|
| Dimensiones | 78" × **113"** × 39" · **93" con topper** |
| Peso | **3.000 lbs / 1.360 kg** |
| Repisas | 14 ajustables (7 por gabinete) |
| Facings | hasta 240 · 1.200 a 3.000 unidades |
| Pantalla | 21.5", una sola para los dos gabinetes |
| Eléctrico | 110 V, 60 Hz, circuito dedicado 15 A |
| Instalación | los dos gabinetes se envían por separado y se unen en sitio; 113" de pared libre |

Ojo con el nombre: el brochure dice **«Gamma Double»**, no «Gamma 13 Double»,
que es como se llama el documento en la base. Hay que decidir cuál gana.

**La Kappa 13 Double sigue sin ficha.** Es el único hueco de origen que queda.

## 0.c Alpha deja de ser dos modelos

El brochure nuevo es **un solo producto, «Alpha Hot Food»**, y sus números no
coinciden con ninguno de los dos que hay en la base:

| | Base: Alpha 10 | Base: Alpha 13 | Brochure nuevo |
|---|---|---|---|
| Ancho | 57.63" | 72.5" | **68"** |
| Pantalla | 49" | 21.5" | 21.5" |
| Capacidad | 90–160 boxes | «7 shelves» | **84 unidades, 28 selecciones** |
| Peso | — | — | **1.389 lbs / 630 kg** |
| Eléctrico | 220 V, 23 A, 5200 W | 220 V, 21 A, 4500 W | **220 V, 50 Hz, 21 A, 4500 W** |

Lo eléctrico y la pantalla son los de la Alpha 13; el ancho no es el de ninguna
de las dos. La lectura más probable es que **el brochure reemplaza a la Alpha 13
y la Alpha 10 salió del catálogo** — pero es una lectura, no un dato, y hay que
confirmarla antes de borrar un modelo del sitio.

Esto también resuelve el conflicto de capacidad de la Alpha 10 que reportaba
la sección 2 de abajo: si el modelo ya no existe, la pregunta se cae sola.

## 0.d Números que cambiaron respecto de las fichas viejas

| Dato | Ficha vieja / base | Brochure nuevo |
|---|---|---|
| Gamma 10 — alto | 77" | **78"** |
| Gamma 10 — facings | 78 | **120** |
| Gamma 10 — repisas | 6 (ampliable a 8) | **7 ajustables** |
| Zeta 2 — facings | 10 | **15** |
| Zeta 2 — profundidad | 12.6" | **13"** (unidad de pared) |
| Zeta 2 — refrigeración | «add-on opcional» | **ambiente, sin refrigeración** |
| Zeta 2 — ADA | add-on | **de serie** |

Y una corrección a lo que decía antes este documento: el alto total con topper
**no es 92"**. Los cuatro brochures que lo mencionan coinciden en **93"** — el
topper suma 15" sobre los 78" estándar. Es el número que decide si la máquina
pasa por una puerta, y ahora está confirmado en cuatro fuentes.

## 0.e Dos cosas nuevas que ninguna ficha decía

- **La Zeta 2 se instala de dos maneras, con dos alturas distintas**: colgada de
  la pared son 39.5" × 27.5" × 13" y no ocupa piso; de pie sobre su base son
  **74"** de alto. La base se fabrica a medida del sitio. El sitio publica hoy
  una sola altura, la de la unidad suelta, que es la que *no* aplica cuando va
  en el piso.
- **Nayax aparece nombrado** como plataforma de pago integrada en los cinco
  brochures. Hoy la base dice «Tarjetas, Apple Pay, Google Pay» sin nombrar al
  proveedor.

## 0.f Lo que falta para completar el juego

No hay brochure nuevo de **Gamma 13, Kappa 13, Kappa Showcase, Delta 7 ni Kappa
13 Double**. Si la tanda de rediseño va a cubrir el catálogo entero, conviene
pedir los que faltan antes de cargar nada: mezclar brochures nuevos con fichas
viejas deja la tabla comparativa midiendo cosas distintas — el alto de 78" de
los nuevos contra el de 77" de los viejos, por ejemplo.

---

## 1. Las dos variantes Double no tienen datos, y no es un olvido

`gamma-13-double` y `kappa-13-double` tienen **cero specs, cero capacidades y
sin dimensiones**. La causa está en el origen: sus carpetas en
`Maquinas por modelo/` **no traen PDF de ficha técnica**, solo renders. Las
fichas extraídas lo dicen con todas las letras — «no se fabrican
especificaciones para esta variante».

Eso es lo correcto y hay que sostenerlo: son variantes master+slave, y sus
dimensiones combinadas, peso total y requerimientos eléctricos del par **no se
deducen** duplicando los de la unidad base.

**Hay que pedírselo al cliente.** Es el único hueco que no se puede cerrar de
este lado.

## 2. Un conflicto real de capacidad en la Alpha 10

| Fuente | Capacidad |
|---|---|
| Base de datos | `90–160 boxes` |
| Ficha | `Capacidad total: 68 items`, con 17 niveles |

No son la misma cifra ni la misma unidad. Uno de los dos está mal y hay que
resolverlo antes del visado: publicar una capacidad que la ficha contradice es
justo el tipo de dato que un operador verifica.

## 3. La Alpha 13 llama «capacidad» a la cantidad de repisas

La base publica `Storage capacity = 7 shelves`. Siete es el **número de
repisas**; la ficha da la capacidad aparte: **84 items**. La etiqueta y el valor
no concuerdan, y el dato que el comprador busca no está.

## 4. Las Alpha son de 220V y el sitio no lo dice

Es el hallazgo con más consecuencia comercial de la lista.

| Modelo | Energía según ficha |
|---|---|
| Alpha 10 | **220V / 50Hz**, 23A, 5200W |
| Alpha 13 | **220V / 50Hz**, 21A, 4500W |
| Delta 7, Gamma 10, Gamma 13, Kappa 13, Zeta 2 | 110V / 15A |
| Kappa Showcase | 110–120V, 60Hz, 20A |

Las dos Alpha **no publican energía en absoluto**, mientras que los demás
modelos sí publican su toma de 110V. Para un operador en Estados Unidos eso
decide si la máquina entra en el local o hay que tirar una línea nueva, y la
omisión deja leer por analogía que la Alpha también es de 110V. Cargarlo cuesta
un campo.

## 5. Specs que están en la ficha y no en el sitio

Ninguna es un error; es data disponible sin cargar.

| Dato | Lo publica hoy | Lo tiene la ficha de |
|---|---|---|
| **Peso** | solo Kappa Showcase (1,900 lbs) | Delta 7 (850 lbs), Gamma 10 (900), Kappa 13 (882), Gamma 13 (1,100) |
| **Pantalla táctil** | Alpha 10/13, Delta 7, Kappa 13, Zeta 2, Kappa Showcase | **Gamma 10 y Gamma 13 (21.5")** — son las dos únicas que no la publican |
| **Repisas** | ninguna | Gamma 10 y Gamma 13 (6, ampliable a 8), Delta 7 (6→7), Kappa 13 (7), Zeta 2 (5) |

## 6. El alto total con topper de la Gamma 13

**Corregido por los brochures nuevos: son 93", no 92".** Ver 0.d — los cuatro
brochures que lo mencionan coinciden en 78" estándar + 15" de topper = 93".

Es el número que decide si la máquina pasa por una puerta, y casi ningún
competidor lo publica. No está en la base. La ficha vieja daba el topper
recomendado por separado (15" × 72" × 39") y había que sumarlo, que es
exactamente por qué conviene publicarlo ya sumado.

## 7. Lo que hay que preguntarle al cliente

1. **Ficha técnica de la Gamma 13 Double y de la Kappa 13 Double** — dimensiones
   combinadas, peso total, requerimientos eléctricos del par master+slave.
2. **Capacidad real de la Alpha 10**: ¿90–160 boxes o 68 items?
3. ~~**Rango de temperatura de la Kappa Showcase.**~~ **Cerrado 2026-09-16**: la
   comparativa nueva lo da — **4 °C a 25 °C**, igual que el resto de la familia
   Kappa. La ficha vieja listaba «temperature control» sin cifra; el documento
   nuevo la trae.

   **Pero abre otra**: la pantalla de la Kappa Showcase es **22" según la ficha
   vieja y el sitio, y 21.5" según la comparativa nueva**. Es el único caso
   donde dos documentos del cliente se contradicen entre sí — no es que el sitio
   esté desactualizado. Confirmar antes de darlo por cerrado.
4. **Las animaciones que faltan.** Hoy solo la Gamma 13 tiene hero rotatorio
   (`gamma-13/v0.06`, 90 fotogramas). Las otras nueve usan imagen fija.

## 8. Dos huecos transversales

- **Ni una sola imagen de galería.** Las diez máquinas tienen `image` principal
  y ninguna entrada en `gallery`, aunque las carpetas por modelo del Shared
  Folder traen tres vistas cada una.
- **Ningún `brochure` adjunto**, pese a que existen ocho PDF de ficha técnica en
  el Shared Folder. Es una descarga que el visitante técnico busca.

## 9. SEO: cero metadatos en las quince

Ninguna de las cinco familias ni de las diez máquinas tiene `meta.title` ni
`meta.description`, en ninguno de los dos idiomas. El fallback cubre el título,
pero un título escrito para un resultado de búsqueda no es el mismo que el del
encabezado, y `meta.description` no tiene fallback.

Es trabajo de la sesión de contenido, no de dev, y no bloquea el visado — pero
sí bloquea que las páginas rindan en buscadores el día que se levante el gate.
