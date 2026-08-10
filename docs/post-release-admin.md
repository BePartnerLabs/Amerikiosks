---
title: Qué hacer en /admin después del release
read_when: Acabas de publicar un release, o retomas el trabajo de máquinas en otra sesión.
enforced_by: nada — son pasos manuales, por eso están escritos
---

# Qué hacer en `/admin` después del release

Escrito el 2026-08-09 al cerrar la sesión de los PR #238 y #239. **Nada de lo de abajo pasa solo.** El código está en `main`, pero un bloque que nadie añade a una página no se renderiza en ninguna parte, y esa es la brecha entre "mergeado" y "por qué no se ve".

## Estado al cerrar la sesión

- `main` está en `3255be9`, con los PR **#238** (bloques del landing de máquinas) y **#239** (contexto agéntico, validadores, secuencias de fotogramas) dentro.
- **Cuatro migraciones nuevas**, todas aditivas y **ya ensayadas** contra un restore real de producción: `migrate` → `migrate:down` → `migrate`, sin pérdida de datos (10 máquinas antes y después). El requisito de ensayo del `CLAUDE.md` está cubierto; **no hace falta pasar por `preview/**`** por este motivo.
- El sitio de producción **no ha cambiado todavía**: nada se despliega hasta publicar un release, y ningún bloque nuevo está colocado en ninguna página.

## 1. Bloques nuevos disponibles, ninguno colocado

Tres bloques entraron en el selector de `Pages` y están sin usar:

| Bloque | Qué hace | Campos que pide |
|---|---|---|
| **Machine Lineup** | La escena oscura fijada, recorriendo las cinco familias con scroll | `intro` (opcional) |
| **Machine Family** | Una familia completa | `family` (relación), rótulos, `showModelCount` |
| **Machine Models** | Todos los modelos en un carrusel plano | `eyebrow`, `heading`, `ctaLabel`, `family` (opcional) |

**No reemplazan a `/machines`**, que sigue siendo una ruta de código con su orden fijo. Para estrenarlos hay que crear una página y componerla. El diseño de esa conversión está en `openspec/changes/machines-landing-as-page/design.md`, con una decisión abierta: cómo se localiza el slug (`machines`/`maquinas`) mientras sus hijos siguen resolviéndose por `pathnames` de next-intl.

**Al crear la página**: los dos locales **en la misma sesión**. Es el gotcha de arrays localizados de `docs/patterns/payload-localized-arrays.md` — escribir en un locale sin devolver los `id` borra el contenido del otro.

## 2. Marcar la característica destacada de cada familia

`machine-families → highlights → items` tiene un checkbox **`featured`** nuevo. Marca **uno por familia**: es el que muestra el bloque `Machine Lineup` al recorrerlas.

Si no marcas ninguna, usa la primera del array — así ninguna familia desaparece del recorrido. No es un error, pero la elección la está haciendo el orden, no tú.

Son cinco familias: `alpha`, `delta`, `gamma`, `kappa`, `zeta`.

## 3. Secuencias de rotación por fotogramas

El circuito completo funciona y está verificado contra el bucket real.

**Para añadir una:**

```bash
node scripts/build-frame-sequence.mjs <carpeta-del-render> <carpeta-de-salida>
```

Convierte a WebP, renombra a `frame-001.webp…`, aguanta los nombres con prefijo que escribe Blender (`v0.010001.png`) y aborta si el render no trae canal alfa.

Luego sube esa carpeta a R2 (`website-8h349ieouv`) **en la raíz del bucket**, no bajo el prefijo de Payload:

```
gamma-12/v0.01/frame-001.webp
```

Y en `/admin`, sobre la máquina:

```
useRotationHero  ✓
sequencePath     gamma-12/v0.01
frameCount       60
```

**La regla que no se puede romper: carpeta nueva para cada versión.** Nunca sobrescribir. Estas URLs no llevan cache tag, así que reemplazar los archivos deja al CDN sirviendo media animación vieja y media nueva, distinto según la región, imposible de reproducir en local. Por eso la versión va en la ruta. El hook lo bloquea si cambias el conteo dejando la misma carpeta.

Numeración: `v0.01`, `v0.02`… mientras se prueba; `v1` cuando una sea la buena.

**Medido:** 60 fotogramas PNG son 60 MB; los mismos en WebP con alfa, 1,4 MB (24 KB de media). El peso dejó de ser una restricción.

Hoy hay **una secuencia subida**: `gamma-12/v0.01`, 60 fotogramas. Ojo, `gamma-12` no existe como máquina — los slugs son `gamma-10`, `gamma-13`, `gamma-13-double`. La carpeta y el slug no tienen por qué coincidir.

## 4. Contenido que sigue en inglés en la página en español

Sin arreglar, y se ve:

- **«See machine»** en las tarjetas de modelo. El `defaultValue` del campo `ctaLabel` es inglés y se guardó igual en los dos locales, así que el respaldo traducido nunca se usa. Se corrige a mano en el documento en español.
- **Etiquetas de specs largas** tipo `DIMENSIONES (ALTO×ANCHO×PROFUNDIDAD)` ocupan la fila entera de datos. Están en la colección `machines`; conviene una versión corta.

## 5. El gate sigue puesto

`GATED_PATHS=/machines` oculta la sección a quien no tenga sesión de Payload. Con eso puedes componer las páginas con calma antes de que nadie las vea.

Dos cosas al respecto:

- **Levantarlo es una decisión de lanzamiento**, y necesita redespliegue: es una variable de entorno porque corre en middleware, donde leer un global costaría una consulta por request.
- **Oculta, no protege.** Comprueba que exista la cookie `payload-token`, y una cookie se fabrica a mano. Está bien para contenido no aprobado; no lo está para nada confidencial.

## Lo que sigue en código, no en `/admin`

Anotado para que no se pierda entre sesiones:

- **Pestañas en `Machines`** — hoy son diecinueve campos planos en una sola columna, sin las pestañas que sí tiene `Pages`. Diseñado en `openspec/changes/machine-page-blocks/design.md`, fase 1, sin empezar. Los campos no cambiarían de nombre ni de sitio en la base.
- **`fix/restore-script-connection-guard`** — rama local sin PR. Hace que `restore-prod-dump.sh` avise de conexiones abiertas en vez de morir después del backup dejando la base intacta.
- **`spike/rotation-frames-70`** — rama local sin pushear, ya superada por lo que entró en #239.
- **Los dos bails de `Form/Component.tsx`** siguen en `EXPECTED` de `scripts/validate-react-compiler.mjs`, marcados como deuda nuestra y no como limitación del compilador.
- **`docs/blocks/README.md`** se sigue escribiendo a mano y está desactualizado; debería derivarse del `Completeness:` de cada README, como ya hace `scripts/generate-context-index.mjs` con los índices de contexto.
- **Voz de marca y audiencias** son esqueletos con preguntas en `docs/business/`, pendientes de cerrar con el cliente.
