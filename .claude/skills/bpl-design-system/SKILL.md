---
name: bpl-design-system
description: Reglas del BPL Design System para este proyecto — contrato de markup, la regla de variables CSS de 3 niveles, y el flujo correcto para agregar un componente DS. Usar antes de escribir o modificar cualquier componente visual, bloque, o CSS de componente.
---

# Design System (BPL DS)

Antes de escribir cualquier componente visual, consulta el DS:

- **Contrato del componente:** `https://ds.bepartnerlabs.com/components/<name>/` — markup canónico verbatim
- **Referencia completa para agentes:** `https://ds.bepartnerlabs.com/AGENTS.md`
- **Spec del proyecto:** `openspec/specs/design-system/spec.md`

**Regla de variables CSS (3 niveles):**

| Nivel | Prefijo | Dónde | Para qué |
|---|---|---|---|
| 1 | `--bp-*` | `:root` (viene del DS) | Tokens base — no redeclarar |
| 1.5 | `--ak-*` | `:root` en `frontend.css` | Brand tokens del proyecto |
| 2 | `--<component>-*` | En el selector del componente | Override del default DS — **solo si el default no sirve** |
| 3 | `--_*` | Interno del DS | Variables privadas — nunca overridear |

**Flujo correcto para agregar un componente DS:**
1. Copia el markup de `https://ds.bepartnerlabs.com/components/<name>/` verbatim
2. Compara el diseño con los defaults del DS
3. Declara Level 2 overrides solo donde los defaults difieren
4. Nunca uses `--ak-*` directamente en propiedades CSS de componentes DS
