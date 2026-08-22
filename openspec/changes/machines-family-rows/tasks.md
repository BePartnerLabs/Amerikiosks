# Tasks

Orden por dependencia, no por tamaño. Nada de esto está empezado.

El paso 0 no depende de los demás y conviene que vaya primero, pero no bloquea
escribir el código: el diseño degrada solo sin él.

## 0. ~~El recorte de los assets~~ — DESCARTADO

**No se recorta nada.** El volado va con un render nuevo en un campo nuevo
(`rowImage`), no recortando el `thumbnail` que ya existe.

El dato que lo destrabó: el volado ya funcionaba en las cards de
`machineModels`, y la diferencia nunca fue el CSS — es que esos renders son
2640×3300 con la máquina llenando el cuadro, mientras que los thumbnails de
familia son cuadrados con la máquina al 29-53% del ancho.

Con eso se caen los tres riesgos que este paso arrastraba: no es destructivo, no
le cambia el encuadre a los otros cuatro consumidores del `thumbnail`, y no
depende de producción. Lo que pide el archivo está en
`docs/post-release-admin.md` §6.4.

## 1. El bloque, sin volado

Que funcione y se vea bien con los assets como estén.

- [x] 1.1 `src/blocks/MachineFamilyRows/config.ts` — encabezado (eyebrow,
      heading, intro), `countEyebrow` y `soonLabel` localizados con default.
      Sin campos de datos: las familias se resuelven en el Server.
- [x] 1.2 `Server.tsx` — resuelve las familias con la Local API y cuenta los
      modelos publicados por familia. El conteo se cuenta, no se tipea.
- [x] 1.3 `Component.tsx` — cinco filas: imagen, badge, nombre, tagline, CTA.
      Flex con `gap`, no márgenes por elemento.
- [x] 1.4 **Delta derivado**: `modelCount === 0` → `soonLabel` + CTA neutro;
      `> 0` → «N modelos» + «Ver la línea». Con test de los dos caminos.
- [x] 1.5 `styles.css` — pasa `validate-ds-tokens.mjs`. Sin literales, sin
      `--ak-*` como propiedad directa dentro de `.bp-*`.
- [x] 1.6 La imagen pide **550px** a `getBestMediaUrl`. `square` resultó ser un
      **pozo entre 301 y 500**, no un techo a partir de 301: por encima de 500 se
      sale limpio a `small`. El comentario original enseñaba la regla equivocada
      y se reescribió entero.
- [x] 1.7 Registrar el bloque en el `layout` de `Pages`.
- [x] 1.8 `generate:types` y `generate:importmap`.
- [x] 1.9 `payload migrate:create`. Revisar que solo cree las tablas del bloque
      nuevo y no toque nada más.

## 2. El volado

Separado a propósito: si el paso 0 no prospera, esto no sale y el bloque igual
sirve.

- [x] 2.1 Render absoluto anclado a la fila, `bottom: 0`, ancho fijo mayor que
      la máquina más ancha (aspecto 0.66) para que `contain` quede limitado por
      alto.
- [x] 2.2 Altura `calc(100% + volado)` — contra la fila real, no contra un alto
      asumido. La fila es `min-height` y crece con su texto.
- [x] 2.3 El gap entre filas con piso de `volado + aire`, como variable
      derivada. Con test o comentario: si el gap queda corto, la máquina
      aterriza sobre el card anterior.
- [x] 2.4 `drop-shadow` y `translateY` en hover, siguiendo `ak-model-card`.
- [x] 2.5 En teléfono el volado va a `0` dentro de la container query. Alcanza
      con anular la variable: todas las reglas que la usan colapsan solas.

## 3. Definition of Done

- [x] 3.1 `README.md` desde `_template.md`.
- [ ] 3.2 Capturas desktop 1280×800 y mobile 375×812, con contenido real.
- [x] 3.3 Checklist, y fila en `docs/blocks/README.md`.
- [x] 3.4 Viñeta en `docs/CLIENT-MANUAL.md`.

## 4. Ensayo de la migración

- [x] 4.1 Round-trip contra el restore de producción que ya está en local:
      `migrate` → `migrate:down` → `migrate`. Resultado escrito en el PR.
- [ ] 4.2 Si eso no se hizo, la rama termina en `preview/<feature>` antes del
      release. Una de las dos, no ninguna.

## 5. Post-release, a mano en `/admin`

El release corre la migración; hasta que las tablas no existan el bloque no
aparece para elegir. La ventana es cuando el release termina y `/admin` reabre.

- [ ] 5.1 Colocar el bloque nuevo en la página `machines`.
- [ ] 5.2 Sacar los cinco bloques `machineFamily` (órdenes 2 a 6).
- [ ] 5.3 Verificar en los dos idiomas.
- [ ] 5.4 Dejarlo escrito en `docs/post-release-admin.md` antes del release, no
      después.

## 6. Lo que queda, y de quién depende

- [ ] 6.1 **Capturas** del DoD (desktop 1280×800, mobile 375×812). Necesitan el
      bloque colocado en la página → `/admin`, tarea de Jorge.
- [ ] 6.2 **Verificación visual del volado.** Ningún test lo cubre: comprueban
      que la clase se aplica, no que la geometría se vea bien. Y hoy no se puede
      mirar, porque las cinco familias caen al respaldo plano hasta que llegue
      el primer `rowImage`.
- [ ] 6.3 **El nombre accesible de la fila.** Hoy toda la fila es un solo `<a>`,
      así que se anuncia como «Models 2 Alpha 360° rapid heating [descripción]
      Ver los modelos» — cinco de esos al tabular. El arreglo es el patrón de
      link estirado que ya usan `CardGrid` y `ModelLines`. **Es el hallazgo con
      más valor que sigue sin implementar.**
- [ ] 6.4 **Los siete textos definitivos** de `content-auditor`, y sus
      `admin.description`. Pendientes de decisión.
- [ ] 6.5 **La precedencia del CTA**: que la fila use su propia etiqueta en vez
      de la de la familia, porque a 24 caracteres le come el ancho a la columna
      del texto. Pendiente de decisión.
