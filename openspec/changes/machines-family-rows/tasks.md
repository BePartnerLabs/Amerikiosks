# Tasks

Orden por dependencia, no por tamaño. Nada de esto está empezado.

El paso 0 no depende de los demás y conviene que vaya primero, pero no bloquea
escribir el código: el diseño degrada solo sin él.

## 0. El recorte de los assets — producción, a mano, sin código

Solo se puede hacer en prod: el entorno local tiene R2 de solo lectura. Es
destructivo y **no se deshace con un rollback de código** — se recupera
volviendo a subir desde el Shared Folder de Drive.

- [ ] 0.1 Recortar el `thumbnail` de **Alpha** en `/admin`, quitando la
      transparencia lateral. Nada más todavía.
- [ ] 0.2 **Verificar la escena pinneada de `/machines`** (`machineLineup`, que
      consume el mismo archivo a 720px). Es lo que más riesgo tiene de
      descuadrarse. Después el switcher de `/machines/[family]`.
- [ ] 0.3 Si la escena aguanta, recortar Gamma, Delta, Zeta y Kappa. Si no,
      parar y decidir — el bloque sale igual, sin volado.
- [ ] 0.4 Anotar en `docs/post-release-admin.md` qué se recortó y cuándo.

## 1. El bloque, sin volado

Que funcione y se vea bien con los assets como estén.

- [ ] 1.1 `src/blocks/MachineFamilyRows/config.ts` — encabezado (eyebrow,
      heading, intro), `countEyebrow` y `soonLabel` localizados con default.
      Sin campos de datos: las familias se resuelven en el Server.
- [ ] 1.2 `Server.tsx` — resuelve las familias con la Local API y cuenta los
      modelos publicados por familia. El conteo se cuenta, no se tipea.
- [ ] 1.3 `Component.tsx` — cinco filas: imagen, badge, nombre, tagline, CTA.
      Flex con `gap`, no márgenes por elemento.
- [ ] 1.4 **Delta derivado**: `modelCount === 0` → `soonLabel` + CTA neutro;
      `> 0` → «N modelos» + «Ver la línea». Con test de los dos caminos.
- [ ] 1.5 `styles.css` — pasa `validate-ds-tokens.mjs`. Sin literales, sin
      `--ak-*` como propiedad directa dentro de `.bp-*`.
- [ ] 1.6 La imagen pide **~250px** a `getBestMediaUrl`, con comentario de por
      qué no 350: cae en `square` (500×500) y anula el recorte.
- [ ] 1.7 Registrar el bloque en el `layout` de `Pages`.
- [ ] 1.8 `generate:types` y `generate:importmap`.
- [ ] 1.9 `payload migrate:create`. Revisar que solo cree las tablas del bloque
      nuevo y no toque nada más.

## 2. El volado

Separado a propósito: si el paso 0 no prospera, esto no sale y el bloque igual
sirve.

- [ ] 2.1 Render absoluto anclado a la fila, `bottom: 0`, ancho fijo mayor que
      la máquina más ancha (aspecto 0.66) para que `contain` quede limitado por
      alto.
- [ ] 2.2 Altura `calc(100% + volado)` — contra la fila real, no contra un alto
      asumido. La fila es `min-height` y crece con su texto.
- [ ] 2.3 El gap entre filas con piso de `volado + aire`, como variable
      derivada. Con test o comentario: si el gap queda corto, la máquina
      aterriza sobre el card anterior.
- [ ] 2.4 `drop-shadow` y `translateY` en hover, siguiendo `ak-model-card`.
- [ ] 2.5 Teléfono: decidir si el volado se apaga por debajo de cierto ancho.
      Está abierto en el diseño.

## 3. Definition of Done

- [ ] 3.1 `README.md` desde `_template.md`.
- [ ] 3.2 Capturas desktop 1280×800 y mobile 375×812, con contenido real.
- [ ] 3.3 Checklist, y fila en `docs/blocks/README.md`.
- [ ] 3.4 Viñeta en `docs/CLIENT-MANUAL.md`.

## 4. Ensayo de la migración

- [ ] 4.1 Round-trip contra el restore de producción que ya está en local:
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
