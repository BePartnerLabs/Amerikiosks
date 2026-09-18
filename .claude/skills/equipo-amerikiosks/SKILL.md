---
name: equipo-amerikiosks
description: Usar cuando una sesión de Amerikiosks arranca sin contexto, se cayó y volvió a abrirse, no sabe qué rol le toca, recibe un mensaje de otra sesión que no reconoce, o necesita saber a quién delegarle algo. También al preguntarse quién levanta el server, quién sube a R2, quién hace commits, o por qué otra sesión pide algo.
---

# El equipo de sesiones de Amerikiosks

Este proyecto se trabaja con **varias sesiones de Claude en paralelo**, cada una
con un rol fijo, coordinadas por un orquestador. Si estás leyendo esto porque
arrancaste en frío, lo primero que tenés que averiguar es **cuál de estas sos**.

## Cómo saber qué rol te toca

1. Mirá el nombre de tu sesión — es el que ves en `ListAgents` como "esta sesión".
2. Buscalo en la tabla de abajo.
3. Si el nombre no está en la tabla, preguntale al usuario antes de hacer nada.

**No asumas que sos el orquestador.** Es el error caro: dos sesiones delegando
se pisan, y una sesión de rol haciendo commits rompe el trabajo de otra.

## La tabla

| Sesión | Rol | Hace | No hace |
|---|---|---|---|
| `amerikioks-orchestator` *(sí, con esa grafía)* | **Orquestador** | Delega, secuencia, consolida. Git: ramas, commits, PRs | El trabajo especializado |
| `amerikiosks-designer` | **Diseño** | Mockups, `/design`, dirección visual, tokens de Figma | Código de producción |
| `amerikiosks-content-auditor` | **Contenido** | Accesibilidad, SEO, AIO/GEO, copy, voz | Implementar los cambios |
| `amerikiosks-front-dev` | **Front** | Componentes y bloques de `(frontend)` con el BPL DS | Esquema, migraciones |
| `amerikiosks-backend-dev` | **Back** | Payload (colecciones, campos, hooks, access, el route group `(payload)`), APIs bajo el patrón de repositorios, migraciones, integraciones (R2, Monday, Odoo) | Levantar o bajar el entorno, dumps de prod |
| `amerikiosks-runner` | **Runner** | Dev server, podman, dumps de prod, logs | Arreglar código |
| `amerikiosks-renderer` | **Render** | Recibe animaciones del animador, optimiza, arma la secuencia, sube a R2 | Tocar la base |

Los nombres son la dirección: se mandan mensajes con `SendMessage` usando el
nombre tal cual. Si `ListAgents` muestra un `[ref]`, agregalo solo cuando el
nombre solo no alcanza.

## Las reglas que valen para todas

- **Solo el orquestador toca git.** Ramas, commits, PRs, merges. Las demás dejan
  el trabajo en el working tree y reportan qué archivos tocaron. El working tree
  suele estar sucio con trabajo de otras sesiones: no lo limpies.
- **Las releases las publica una persona, a mano.** Un agente llega hasta el
  merge a `main` y ahí para. Mergear a `main` **no despliega nada** — el deploy
  sale de un push a `preview/**` o de un release publicado.
- **Nada de escribir en la base directamente.** Los cambios de esquema van por
  migración; el contenido administrable se toca por `/admin` o por la Local API.
- **Ningún componente llama `fetch`.** Regla de toda la organización, no de este
  repo: `fetch → ApiClient → <Domain>Repository → index`. Viven en
  `src/repositories/` (`clients/ApiClient.ts` y ocho repositorios:
  `PagesRepository`, `FormsRepository`, `ClaimsRepository`, `MondayRepository`,
  `OdooRepository`, `UsersRepository`…). El fallback seguro va en el
  repositorio, no en el componente: una lista vacía en vez de una excepción que
  tumba la página.
  **Excepción real**: la Local API de Payload no es HTTP. El frontend lee datos
  con `getPayload()` directamente, y envolverla en un repositorio agrega una
  capa que no evita ningún costo de red porque no hay red. El patrón aplica a
  `/next/*` y a servicios de terceros.
- **Una rama con migración se mergea solo si se round-trippeó contra un restore
  real de producción**, con el resultado escrito en el PR, o si pasó por
  `preview/**`. Nunca ninguna de las dos. Una base fresca no cuenta: no tiene
  contenido real que perder, así que pasa siempre.
- **Y al revés: si la rama NO agrega migración, no corras el round-trip.**
  `migrate:down` revierte la última migración *existente*, que es de otro: toca
  datos y no prueba nada tuyo. Lo que va al PR es «sin migración;
  `migrate:create` no detecta cambios de esquema».
- **Después de un cambio de esquema, el orden es `pnpm generate:types` y
  *después* `pnpm generate:importmap`.** Y `migrate:create` no se corre mientras
  la base se está restaurando — el error que tira no explica nada.
- **Si te falta algo que es de otro rol, pedíselo al orquestador.** No lo
  resuelvas por tu cuenta aunque puedas.

## Las tres trampas del entorno local

Las tres muerden en silencio: parecen bugs y son configuración.

- **R2 es de solo lectura en local.** Las credenciales apuntan al bucket de
  producción con permiso de lectura. Subir o recortar media desde el `/admin`
  local falla con `AccessDenied`. **Todo el trabajo de media se hace en
  producción.** Leer sí funciona: para previsualizar una secuencia ya subida no
  hace falta ningún dump, alcanza con que el registro apunte a la carpeta.
- **Después de restaurar un dump hay que correr
  `node scripts/move-monday-to-sandbox.mjs --apply`.** Obligatorio e
  idempotente. El dump trae board ids, group ids, el mapeo de columnas **y el
  token del cliente**: sin el rewrite, un formulario enviado en local crea un
  item real en un board que lee el equipo comercial.
- **Parar `pnpm dev` antes de restaurar.** El dev mantiene su pool abierto y
  reconecta a mitad del restore.

## Cómo se reporta

**Siempre al orquestador**, `amerikioks-orchestator` — nunca a otra sesión de
rol directamente. Él tiene el estado completo; dos sesiones coordinándose entre
sí producen decisiones que nadie registró.

**Cuándo**: al terminar lo que te pidieron, al quedarte bloqueado, y **apenas
encontrás algo fuera de tu alcance**. Ese tercero es el que más se saltea y el
más valioso: si vas a tocar algo y ves de paso que otra cosa está mal, decilo
aunque no sea tuyo.

**Qué**: qué hiciste, **qué verificaste y cómo** (no «funciona», sino el
comando y su salida), qué quedó pendiente, y qué encontraste que no era tuyo.
Si entregás trabajo, decí qué archivos tocaste.

**Entregá por tandas, no todo al final.** Si la sesión se corta, lo entregado ya
está en manos de alguien en vez de perderse en un mensaje que nunca saliste.

## Cuando algo está roto en local

La regla es **diagnosticar hasta el borde de tu rol y después reportar**, no
arreglar cruzando el límite.

- **El dev server no levanta o se cayó**: reiniciarlo es tuyo. Antes de
  reiniciar, mirá por qué murió y guardá el error — un reinicio que borra la
  causa obliga a reproducirla. Si vuelve a caer por lo mismo, **eso ya es código
  y no es tuyo**: reportá el error tal cual.
- **Postgres no responde**: `podman machine start` y `podman-compose ps` son
  tuyos. Los tests de integración fallan con un «hook timed out» que no explica
  nada cuando la VM está abajo — chequeá eso antes de culpar a otra cosa.
- **El working tree está sucio con trabajo de otros y algo no compila**: no lo
  limpies ni lo revirtas. Reportá qué archivo rompe y quién lo tocó.
- **Correr un script que ya existe en `scripts/` es trabajo de runner.**
  Escribirlo o arreglarlo, no.

**Los logs que te van a pedir**, en orden de uso: la salida de `pnpm dev`
(compilación y errores de servidor), Postgres vía `podman logs`, y los de
Payload que salen por la misma consola del dev. Los de producción viven en
Vercel y son otra conversación.

## Los scripts de `scripts/`

Los que no son obvios. Todos con guarda de localhost salvo los de dump.

| Script | Qué hace |
|---|---|
| `dump-prod.sh` · `restore-prod-dump.sh` | Bajan y restauran producción |
| `move-monday-to-sandbox.mjs --apply` | **Obligatorio tras cada restore** — ver las trampas de arriba |
| `publish-all-local.ts` | Publica los borradores **solo en local**, para poder revisar el sitio entero |
| `fill-machines-es-locale.ts` | Escribe el locale `es` de los bloques de `/machines` |
| `point-machine-at-sequence.ts` | Apunta una máquina a una secuencia de fotogramas ya subida a R2 |

Los tres últimos se corren con `pnpm payload run <script> -- --apply`. **El `--`
no es opcional**: sin él pnpm se queda el flag y el script cree que es un
simulacro. Sin `--apply` sólo muestran el plan, que es como conviene correrlos
la primera vez.

## Cómo retomar después de una caída

1. **`get_required_context`** del BPL Context Manager, y `list_specs` para el
   resto. Las capabilities `local-development`, `payload-conventions` y
   `deploys-and-migrations` son de la capa `project` y no están en el repo.
2. **Averiguá tu rol** con la tabla de arriba.
3. **`ListAgents`** para ver quién más está vivo.
4. **Preguntale al orquestador en qué quedó lo tuyo.** Es el único que tiene el
   estado completo. No reconstruyas el contexto leyendo el repo a ciegas.
5. Si **vos** sos el orquestador y arrancaste en frío: `git log`, `gh pr list`,
   `git status`, y después los docs de estado que están abajo.

Una sesión que se reabre con el mismo nombre **conserva la dirección pero no la
memoria**. Si un peer te escribe dando por sentado un contexto que no tenés,
decilo en vez de improvisar.

## Dónde vive el estado, no en la cabeza de nadie

| Archivo | Qué tiene |
|---|---|
| `docs/post-release-admin.md` | Lo que hay que hacer a mano en `/admin` para que lo shipeado se vea. Lista de tareas, no documentación: se borra cuando esté todo hecho |
| `docs/machines-data-audit.md` | La data de máquinas y familias contra las fichas del fabricante |
| `docs/patterns/` | Lo que este proyecto aprendió a los golpes, con el incidente que lo motivó |
| `docs/ROADMAP.md` | Ideas y huecos sin analizar todavía |
| `openspec/changes/<id>/` | Diseño y tareas de un cambio en curso |
| `Shared Folder/Fichas Extraidas/_LEEME.md` | Specs de cada máquina en markdown, y qué documento manda cuando dos se contradicen. **Leer esto en vez de abrir los PDF** |

## Errores que ya se cometieron

| Error | Qué pasa |
|---|---|
| Asumir que sos el orquestador | Dos sesiones delegando, trabajo pisado |
| Abrir los PDF de fichas | Cuesta órdenes de magnitud más que el markdown equivalente, que ya existe |
| Pedir un dump para ver una secuencia de R2 | Los fotogramas están en R2, que se lee desde local. Lo que falta es que el registro apunte a la carpeta |
| Correr `migrate:down` en una rama sin migración propia | Revierte la migración de **otro** y toca datos del restore de producción, sin probar nada tuyo |
| Poner un `fetch` en un componente | Salta `ApiClient` y el repositorio, y con ellos el fallback seguro: un 500 del backend pasa a ser una excepción que tumba la página |
| Restaurar con `pnpm dev` corriendo | El restore se corrompe a la mitad |
| Saltear el rewrite de Monday | Escrituras reales en el board del cliente |
| Sobrescribir una carpeta de secuencia en R2 | Las URLs no llevan cache tag: el CDN sirve media animación vieja y media nueva según la región. **Carpeta nueva por versión, siempre** |
| Escribir un locale sin mandar el `id` de cada ítem del array | Borra el otro idioma y responde `200 OK` |
