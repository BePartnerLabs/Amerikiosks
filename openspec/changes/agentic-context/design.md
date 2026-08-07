# Contexto agéntico — diseño

## El problema en una frase

El conocimiento operativo del proyecto existe, pero no donde alguien lo encuentra cuando lo necesita — y lo que sí estaba escrito había crecido hasta estorbar.

## Por qué `docs/` plano y no un árbol espejo

La alternativa considerada fue un `additional-context/` replicando el árbol de código: `additional-context/blocks/MachineLineup/patterns.md`, y así. Se descartó por dos razones.

**Se desincroniza en cuanto se mueve un archivo.** Un espejo es una segunda jerarquía que hay que mantener a mano, y este repo ya demostró que no mantiene las que tiene: la tabla de completitud de `src/CLAUDE.md` contradecía a `docs/blocks/README.md` en todas sus filas, y le faltaban tres bloques.

**El mecanismo de carga por proximidad ya existe.** Claude Code carga el `CLAUDE.md` de una carpeta al tocar archivos de ella. Eso ya da "solo lo que aplica" sin construir nada. Lo que faltaba no era una jerarquía nueva, sino que cada archivo se ganara su sitio.

Así que: documentos planos en `docs/`, enlazados desde el `CLAUDE.md` más cercano. Enlazar y no inlinear es lo que hace que solo se lea el que aplica.

## Tres carpetas, tres categorías

| Carpeta | Qué contiene | Prueba para entrar |
|---|---|---|
| `docs/patterns/` | Lo aprendido aquí | ¿Costó tiempo real y el porqué no se deduce del código? |
| `docs/business/` | Para quién es el producto y qué es "terminado" | ¿Cambia lo que se construye, no solo cómo? |
| `docs/payload/` | Referencia vendorizada de Payload | ¿Es cierto en cualquier proyecto Payload? |

**La separación entre la primera y la tercera es el punto.** Mezclar "cómo funcionan los hooks de Payload" con "el hook que borró 20 brands" entierra el segundo. Un índice de quince entradas donde trece son referencia genérica hace que nadie lea las dos que importan.

## Cada documento en su archivo, con frontmatter

```yaml
---
title: React Compiler
read_when: Touching a client component, or the compiler silently stops memoising one.
enforced_by: scripts/validate-react-compiler.mjs
---
```

`read_when` es la columna que importa. Un título dice qué es un documento; solo `read_when` dice si hay que abrirlo *ahora*. Es lo que permite que un agente cargue un archivo y no la carpeta.

`enforced_by` es disciplina, no metadata: obliga a responder "¿esto lo puede cazar una herramienta?" al escribir. Cuando la respuesta es sí, la herramienta *es* la documentación y el documento sobra. `payload-localized-arrays.md` responde honestamente *"nothing — runtime shape, not syntax"*.

Los archivos vendorizados ya traían `title` y `description`, así que el generador usa `description` como respaldo.

## Índices generados, no escritos

Un índice que nadie regenera se lee como autoritativo y miente en silencio. `docs/blocks/README.md` es la prueba viva.

`scripts/generate-context-index.mjs` deriva las tablas del frontmatter, entre marcadores, dejando intacta la prosa. Se engancha en dos sitios a propósito: `lint-staged` regenera y re-stagea en el commit —auto-arreglo donde se comete el error—, y CI corre `--check` —verificación donde no se puede saltar con `--no-verify`—. Ninguno de los dos basta solo.

Se descartó `prebuild`: el build es caro, casi nunca se corre en local, y un índice desactualizado sobreviviría días.

## El caso que originó todo

`babel-plugin-react-compiler` lee un AST de Babel 7. Bajo `@babel/core` 8 reporta una cascada de `AssignmentPattern` — uno por cada prop destructurado con valor por defecto. Once archivos "violando un antipatrón" que no existía, y un refactor transversal a punto de empezar sobre código sano.

Ese hecho —qué versión de Babel usar para diagnosticar— no cabía en ningún sitio del repo. Ahora está en `docs/patterns/react-compiler.md` y comentado en el propio validador, con la instrucción explícita de no subir a 8 esperando un no-op.

## Poda: qué se quitó y por qué

- **`AGENTS.md`** (1141 líneas): cero menciones al proyecto, 69% de líneas idénticas a `docs/payload/`, y sus últimas 99 líneas indexaban a mano una carpeta que se puede listar. Sus cinco patrones aplicables ya estaban digeridos en `CLAUDE.md`.
- **`src/Header/CLAUDE.md` y `src/Footer/CLAUDE.md`** (7 y 8 líneas): sus `README.md` son superconjuntos estrictos, y se cargaban en cada edición de esas carpetas para aportar cero.
- **La tabla de estado de `src/CLAUDE.md`**: contradecía al índice que ella misma llamaba "full index".
- **La regla de puntuación y las reglas de CSS del DS en `src/blocks/CLAUDE.md`**: pasan a punteros. La DoD y `validate-ds-tokens.mjs` son sus fuentes únicas.

El criterio, aplicable a la próxima poda: **un `CLAUDE.md` se carga solo, así que cuesta tokens en cada sesión que toque su carpeta, se aproveche o no.** Tiene que ganarse cada línea.

## Lo que queda abierto

- El gotcha de `generateStaticParams` sigue duplicado entre `CLAUDE.md` y `src/app/(frontend)/CLAUDE.md`. Debería ser el siguiente `docs/patterns/`.
- `docs/blocks/README.md` sigue escribiéndose a mano y sigue desactualizado. Debería derivarse del `Completeness:` de cada README.
- La voz de marca y las audiencias son preguntas, no respuestas. Se cierran con el cliente.
- Los dos bails de `Form/Component.tsx` siguen sin aislar.
