# Tasks

## 1. Estructura de contexto

- [x] 1.1 `docs/patterns/` con `README.md` indexado y frontmatter por documento
- [x] 1.2 `docs/patterns/react-compiler.md` — Babel 7 vs 8, refs en hooks, bails
- [x] 1.3 `docs/patterns/payload-localized-arrays.md`
- [x] 1.4 `docs/patterns/payload-seeding.md` — rescatado de `src/endpoints/seed/CLAUDE.md`
- [x] 1.5 `docs/patterns/monday-local.md` — extraído de la raíz
- [x] 1.6 `.cursor/rules/` → `docs/payload/` con su índice
- [x] 1.7 `docs/business/` con DoD, voz y audiencias

## 2. Generación de índices

- [x] 2.1 `scripts/generate-context-index.mjs` leyendo frontmatter entre marcadores
- [x] 2.2 `pnpm docs:index` y `pnpm docs:index:check`
- [x] 2.3 `lint-staged` regenera y re-stagea al commitear
- [x] 2.4 CI corre `--check`
- [ ] 2.5 Derivar `docs/blocks/README.md` del `Completeness:` de cada README de bloque — hoy se escribe a mano y está desactualizado

## 3. Enforcement

- [x] 3.1 `scripts/validate-react-compiler.mjs` con `EXPECTED` documentado
- [x] 3.2 Enganchado en `lint-staged`
- [x] 3.3 Job `validators` en CI, calculando el diff
- [x] 3.4 `linter.domains.react` en Biome — cero hallazgos nuevos, se deja por el código futuro
- [ ] 3.5 Revisar si alguna regla de `docs/patterns/` se puede expresar como plugin GritQL en `biome-plugins/`

## 4. Poda de contexto

- [x] 4.1 `AGENTS.md` y sus seis symlinks eliminados
- [x] 4.2 `src/Header/CLAUDE.md` y `src/Footer/CLAUDE.md` eliminados
- [x] 4.3 Tabla de estado fuera de `src/CLAUDE.md`
- [x] 4.4 Error factual de `lucide-react` corregido en `src/components/Icon/CLAUDE.md`
- [x] 4.5 Puntero de arrays localizados en la raíz, contenido en `docs/patterns/`
- [x] 4.6 Regla de puntuación y reglas de CSS del DS pasan a punteros en `src/blocks/CLAUDE.md`
- [ ] 4.7 `generateStaticParams` sigue duplicado entre `CLAUDE.md` y `src/app/(frontend)/CLAUDE.md`

## 5. Rules of React

- [x] 5.1 `useClickableCard` devuelve los refs directamente; `Card` compila
- [x] 5.2 Test del hook actualizado a la API nueva
- [ ] 5.3 Aislar los dos bails de `Form/Component.tsx` — en `EXPECTED`, marcado como deuda nuestra

## 6. Validación

- [ ] 6.1 Estrenar la DoD con `MachineLineup`, `MachineFamily` y `MachineModels`, **usando un subagente con contexto limpio** — quien escribió la DoD no puede evaluarla sin aprobarla de oficio
- [ ] 6.2 Recoger qué le faltó a la DoD durante ese ejercicio y corregirla
- [ ] 6.3 Cerrar voz y audiencias con el cliente
