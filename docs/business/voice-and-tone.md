---
title: Voice and tone
read_when: Writing any copy that ships — block defaults, labels, error messages, meta descriptions, or translating a page into Spanish.
enforced_by: nothing — but the rules below are read off approved copy, not invented
---

# Voice and tone

**La fuente es el home, no este documento.** El home en inglés es la página que
el cliente revisó y aprobó, así que lo que sigue no es una voz propuesta: es la
voz que ya está en producción, leída de ahí y escrita para poder repetirla.

Eso resuelve la objeción que tenía este archivo cuando era un esqueleto —
inventar una voz le da autoridad a una decisión que nadie tomó. Acá no se
inventa nada: se describe lo aprobado.

Lo que el home **no** contesta queda abajo, marcado como pregunta abierta.

## Quién habla y a quién

| | |
|---|---|
| La empresa | **«nosotros»**, en verbo. *We design, deploy, and operate…* · *Diseñamos, implementamos y operamos…* |
| El lector | **«tú»**, nunca usted. *Grow Your Brand* · *Haz crecer tu marca* · *tu cliente*, *tu competidor* |

**El registro en español es `tú`, y está decidido por uso**: el home publicado
dice «Haz crecer tu marca», «donde tu cliente ya está», «Sin que muevas un
dedo». No hay una sola forma de *usted* en la página aprobada.

## Cómo se arma una frase

**Afirmación corta, prueba concreta debajo.** Es el patrón de todo el home:

> **We put your brand where it matters most.**
> Airports, hotels, stadiums: where your customer already is, and your
> competitors can't reach.

La primera línea es una promesa en una oración. La segunda la aterriza con
lugares, números o nombres. Nunca se deja la promesa sola.

**Los números cargan el argumento**: `10+ años`, `1000+ kioscos`, `30+ estados`,
`12M+ transacciones`. Y en producto: «2–3 min», «90–160 cajas», «hasta −25 °C».
Una afirmación sin cifra se lee como relleno.

**Sin cobertura.** No hay «puede ayudarte a», «una de las mejores», «buscamos».
El home aprobado dice *«your competitors can't reach»* y *«Sin que muevas un
dedo»*. Si una frase necesita un matiz para ser cierta, se cambia la frase, no
se le agrega el matiz.

**Los títulos son imperativos o declarativos, no descriptivos.** *Grow Your
Brand. Transform Your Space.* — no «Soluciones de retail automatizado».

## El español no es una traducción literal

Es la diferencia más importante de este documento, y sale de comparar las dos
versiones del mismo bloque:

| EN | ES publicado |
|---|---|
| Turnkey Operations · *We take care of everything.* · *From deployment to daily operations, our team manages every detail so you can focus on growing your business.* | Operación llave en mano · **«Instalación, inventario, mantenimiento, soporte. Sin que muevas un dedo.»** |

El español **no dice lo mismo con otras palabras: dice menos y pega más
fuerte**. Cambia una subordinada larga por una enumeración de cuatro sustantivos
y un remate de cinco palabras.

**Entonces, al traducir: se traduce la intención, no la estructura.** Una
traducción literal que conserve el ritmo inglés va a sonar más débil que el
original, no igual.

**Extranjerismos que el cliente ya usa y se conservan**: *Partnership*,
*Branding*. No se traducen.

## Mayúsculas en español: mayúscula inicial sola — **decidido**

Nunca Title Case. El home aprobado mezcla las dos formas —«Años de Experiencia
en la Industria» junto a «Marcas globales y nacionales confían en nosotros»— y
esa mezcla **es la evidencia a favor de la regla, no en contra**: la página tiene
las dos porque el Title Case no tiene una regla estable en español.

Dos razones, y la segunda pesa más:

1. La norma ortográfica del español capitaliza la primera palabra y los nombres
   propios. El Title Case es estructura del inglés, y este documento ya dice que
   el español no hereda la estructura del inglés.
2. **El Title Case en español obliga a un juicio por cadena.** ¿«de» va en
   mayúscula? ¿«y»? ¿«en»? Multiplicado por cientos de cadenas y varios editores
   a lo largo del tiempo, produce inconsistencia garantizada. La mayúscula
   inicial tiene una sola regla y cero juicios.

**Excepciones**: nombres propios, los nombres de modelo (Gamma Double), y los
extranjerismos que el cliente conserva — *Partnership*, *Branding*.

**Si el cliente empuja** con «pero en inglés va así»: la marca es consistente en
**voz**, no en ortografía. Nadie lee los dos idiomas en paralelo, y un lector
hispanohablante lee el Title Case como artefacto de traducción.

**Corolario para rótulos de botón**: en español van en **infinitivo** —«Saber
más», «Ver la máquina», «Descargar el folleto»—, no en imperativo. El imperativo
`tú` es para titulares y prosa («Haz crecer tu marca»). Es lo que ya hace el
sitio; queda escrito para que no se reabra.

## Preguntas que el home no contesta
- **Qué altura técnica va en la ficha de máquina.** El home es comercial; las
  specs dicen «Refrigeración 4 °C – 25 °C». Nadie definió si esa altura es la
  correcta para un gerente de local o si es lenguaje de ficha que solo va en la
  página del modelo.
- **Qué no se dice nunca.** Suele ser más útil que lo que sí se dice.
  «Innovador», «soluciones», «de vanguardia» son los candidatos obvios, pero es
  una pregunta para el cliente.
- **Las tres audiencias.** El sitio le habla a marcas, locales y agencias. El
  home les habla a todos con la misma voz; si tienen vocabularios distintos, eso
  no está resuelto. Ver [`audiences.md`](./audiences.md).

## Dónde se usa

Defaults de campos de bloque, `docs/CLIENT-MANUAL.md`, meta titles y
descriptions, y la pregunta de AIO/GEO del
[`definition-of-done.md`](./definition-of-done.md) — un bloque que «contesta una
pregunta» tiene que contestarla en la voz de la marca.

Y, ahora mismo, la traducción al español del contenido de las diez máquinas:
~150 cadenas que hoy se publican en inglés en `/es/maquinas/…`.
