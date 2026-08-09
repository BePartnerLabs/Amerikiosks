## Why

Activando el React Compiler perdimos una hora persiguiendo un antipatrón que no existía. El arnés de diagnóstico instaló `@babel/core@8`, cuyo AST no es el que espera `babel-plugin-react-compiler`, y reportó once archivos violando un patrón de destructuring. Con Babel 7 —la versión que Next usa por dentro— esos once bails desaparecen. La conclusión estaba lista para un refactor transversal que habría tocado código sano.

Nada en el repo registraba con qué versión se valida el compilador. Y ese no es un caso aislado: el conocimiento de este proyecto existe —repartido entre `CLAUDE.md`, comentarios de código y la memoria de quien estuvo presente— pero no está donde alguien lo encuentra cuando lo necesita.

Al mismo tiempo, el contexto que sí estaba escrito se había vuelto contraproducente. `AGENTS.md` tenía 1141 líneas sin una sola mención a este proyecto, con el 69% de sus líneas idénticas a `.cursor/rules/`, y dedicaba sus últimas 99 líneas a indexar a mano una carpeta que se puede listar. La tabla de completitud de `src/CLAUDE.md` contradecía a `docs/blocks/README.md` en todas sus filas. `src/components/Icon/CLAUDE.md` afirmaba que `lucide-react` estaba sin usar, y se usa en tres archivos.

Un índice que nadie regenera se lee como autoritativo y miente en silencio. Un archivo de contexto que se carga solo al tocar una carpeta cuesta tokens en cada sesión, se aproveche o no.

## What Changes

- **Nueva carpeta `docs/patterns/`**: lo que este proyecto aprendió a golpes, un archivo por tema, cada uno con el incidente que lo motivó. Arranca con el React Compiler, los arrays localizados de Payload, el seeding y el sandbox de Monday.
- **Nueva carpeta `docs/business/`**: la Definition of Done, más audiencias y voz de marca como esqueleto con las preguntas a responder con el cliente.
- **`.cursor/rules/` → `docs/payload/`**: referencia vendorizada de Payload, categoría separada de los patrones. Nadie usa Cursor; el nombre de la carpeta mentía.
- **`AGENTS.md` eliminado** junto a sus seis symlinks. Sin contenido propio del proyecto, duplicado de `docs/payload/`, y sus cinco patrones aplicables ya digeridos en `CLAUDE.md`.
- **Índices generados**: `scripts/generate-context-index.mjs` deriva las tablas del frontmatter de cada documento. `pnpm docs:index` regenera, `pnpm docs:index:check` falla si están desactualizados.
- **Nuevo validador**: `scripts/validate-react-compiler.mjs` corre el compilador real sobre los archivos tocados y falla si uno empieza a hacer bail. Con `EXPECTED` documentado para los que son limitación del compilador.
- **Los cuatro validadores pasan a CI**, calculando el diff. Antes solo vivían en el hook de pre-commit, que `--no-verify` se salta y que en un PR no corre nunca.
- **`linter.domains.react` activado** en Biome.
- **Poda de contexto**: fuera `src/Header/CLAUDE.md` y `src/Footer/CLAUDE.md` (superconjuntos suyos ya existen como README), fuera la tabla de estado de `src/CLAUDE.md`, y las secciones de Monday y arrays localizados salen de la raíz a `docs/patterns/` dejando un puntero.
- **Dos violaciones reales de las Rules of React**: `useClickableCard` devuelve los refs directamente en vez de anidados, lo que desbloquea `Card`. La de `Form/Component.tsx` queda en `EXPECTED`, marcada como deuda nuestra y no como limitación.

## Capabilities

### New Capabilities

- `agentic-context`: el repo lleva su propio contexto operativo — patrones, antipatrones, definición de terminado y contexto de negocio— en documentos de un solo tema, indexados automáticamente y enlazados desde el `CLAUDE.md` de la carpeta más cercana, de modo que solo se carga lo que aplica.

### Modified Capabilities

- La documentación de bloques deja de restatear la regla de puntuación y las reglas de CSS del DS: ambas apuntan a su fuente única (la DoD y `validate-ds-tokens.mjs`).

## Out of Scope

- **Redactar la voz de marca y las audiencias.** Se entregan como preguntas. Inventarlas y commitearlas le daría a una suposición la autoridad de una decisión, y el cliente acabaría discutiendo con un documento en vez de respondiendo una pregunta.
- **Aislar los dos bails de `Form/Component.tsx`.** Pide bisectar 400 líneas que son la captura de leads del cliente.
- **Migrar el resto de gotchas de la raíz a `docs/patterns/`.** El de `generateStaticParams` está duplicado entre `CLAUDE.md` y `src/app/(frontend)/CLAUDE.md` y debería ser el siguiente, pero se hace cuando alguien lo toque.
