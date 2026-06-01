# BPL Design System — Spec de implementación

> Referencia canónica: https://ds.bepartnerlabs.com/AGENTS.md  
> Componentes: https://ds.bepartnerlabs.com/components/<name>/  
> Registry: https://ds.bepartnerlabs.com/registry/components.json

---

## Arquitectura de variables CSS (3 niveles)

El DS usa una cadena de resolución de 3 niveles. Conocer los niveles evita sobreescrituras incorrectas.

### Level 1 — `--bp-*` (tokens base del DS)
Definidos por el DS en `:root`. Nunca se modifican directamente en el proyecto.  
Son los valores por defecto de todo el sistema: colores, espaciado, radios, tipografía, motion.

```css
/* Ejemplos — vienen del DS, no los redeclaramos */
--bp-space-4: 1rem;
--bp-radius-md: 0.5rem;
--bp-color-text: #181715;
```

### Level 1.5 — `--ak-*` (brand tokens del proyecto)
Tokens propios de Amerikiosks, declarados en `:root` de `frontend.css`.  
Representan decisiones de marca: colores de acento, fondos de header, colores de nav.  
**Nunca se usan directamente en componentes DS** — se canalizan a través de Level 2.

```css
/* frontend.css — :root */
--ak-accent: #e63946;
--ak-header-bg: #011936;
--ak-nav-link-color: rgba(255, 255, 255, 0.85);
```

### Level 2 — `--<component>-*` (API pública del componente)
Surface de customización que expone cada componente DS.  
**Solo se declaran cuando el default del DS no es el correcto para este proyecto.**  
Se declaran en el selector del componente o en un contenedor padre, nunca en `:root`.

```css
/* header.css — overrides donde el default del DS no sirve */
.bp-header {
  --header-bg: var(--ak-header-bg);   /* default del DS es bg-elevated (#fff) */
}

.bp-header .bp-nav {
  --nav-link-color: var(--ak-nav-link-color);   /* default del DS es --bp-color-text */
}

.bp-header .bp-btn--primary {
  --btn-bg: var(--ak-accent);   /* default del DS es --bp-primary */
}
```

### Level 3 — `--_*` (variables privadas del componente)
Internas al DS. Resuelven Level 2 → Level 1 con fallback seguro.  
**Nunca se overridean desde fuera.**

```css
/* Dentro del DS (no tocar) */
.bp-btn {
  --_bg: var(--btn-bg, var(--bp-primary));
  background: var(--_bg);
}
```

### Override de estados (hover, active, focus)

Los tokens Level 2 se pueden redeclarar en cualquier selector, incluyendo pseudo-clases. Las CSS custom properties se resuelven en el punto de uso, por lo que el Level 3 interno recoge el nuevo valor automáticamente:

```css
/* Override de hover sin tocar el componente */
.bp-header .bp-btn--primary:hover {
  --btn-bg: var(--ak-accent-hover);   /* Level 2 en pseudo-clase */
}
/* El componente DS internamente tiene: --_bg: var(--btn-bg, ...) */
/* En hover, --_bg resuelve al nuevo valor automáticamente */
```

### Resumen del flujo

```
--ak-accent (brand)
  └── --btn-bg: var(--ak-accent)            ← Level 2, solo si override
  └── :hover { --btn-bg: var(--ak-hover) }  ← Level 2 en estado
        └── --_bg: var(--btn-bg, ...)        ← Level 3, interno DS
              └── background: var(--_bg)
```

---

## Reglas de markup

El DS usa el principio **"HTML es la API"**. El markup canónico de cada componente es el contrato — no se adapta, se copia verbatim.

1. **Copiar el markup exacto** de `https://ds.bepartnerlabs.com/components/<name>/`
2. **Customizar solo via Level 2** — nunca inline styles, nunca modificar clases DS
3. **Usar HTML semántico correcto**: `<button>` para acciones, `<a>` para navegación, `<dialog>` para modales, `<details>` para accordions
4. **Estado vía ARIA** — JS escribe atributos (`aria-expanded`, `aria-selected`), CSS los lee
5. **Nunca toggle de clases de estilo** — las clases son estructurales, el estado es ARIA

---

## Componentes usados en este proyecto

### Header — `.bp-header`

Referencia: https://ds.bepartnerlabs.com/components/header/

**Markup canónico:**
```html
<div id="header-sentinel" aria-hidden="true" style="height:1px"></div>
<header class="bp-header" id="site-header">
  <div class="bp-header__inner">
    <a href="/" class="bp-header__logo"><!-- logo --></a>
    <nav class="bp-header__nav" aria-label="Main">
      <!-- bp-nav aquí -->
    </nav>
    <div class="bp-header__actions">
      <!-- language switcher, CTA, mobile hamburger -->
    </div>
  </div>
</header>
```

**Tokens Level 2 overrideados:**
| Token | Nuestro valor | Por qué |
|---|---|---|
| `--header-bg` | `var(--ak-header-bg)` | Header oscuro vs default blanco del DS |

**Comportamiento scroll:**  
El sentinel `#header-sentinel` es observado por un `IntersectionObserver`. Cuando sale del viewport, el header recibe la clase `.is-scrolled` que activa `box-shadow`.

---

### Nav — `.bp-nav`

Referencia: https://ds.bepartnerlabs.com/components/nav/

**Markup canónico con megamenu (Popover API):**
```html
<ul class="bp-nav" role="list">
  <!-- Item con megamenu -->
  <li class="bp-nav__item">
    <button class="bp-nav__megamenu-btn" type="button"
            popovertarget="mega-{id}" aria-expanded="false">
      Label <span aria-hidden="true">▾</span>
    </button>
    <div class="bp-nav__megamenu" id="mega-{id}" popover="auto">
      <!-- contenido del megamenu -->
    </div>
  </li>

  <!-- Item simple -->
  <li>
    <a class="bp-nav__link" href="/">Home</a>
  </li>
</ul>
```

**Popover API (`popover="auto"`):**
- Click en `popovertarget` → abre/cierra el panel (toggle nativo)
- Click fuera del popover → cierra automáticamente (browser)
- Escape → cierra automáticamente (browser)
- No requiere JS para open/close — JS solo sincroniza `aria-expanded` escuchando el evento `toggle`

**Tokens Level 2 overrideados:**
| Token | Nuestro valor | Por qué |
|---|---|---|
| `--nav-link-color` | `var(--ak-nav-link-color)` | Links blancos sobre fondo oscuro |
| `--nav-link-hover` | `var(--ak-accent)` | Hover en color accent de marca |

---

### Button — `.bp-btn`

Referencia: https://ds.bepartnerlabs.com/components/button/

**Markup canónico:**
```html
<!-- Acción -->
<button class="bp-btn bp-btn--primary" type="button">Label</button>

<!-- Navegación -->
<a class="bp-btn bp-btn--primary" href="/ruta">Label</a>
```

**Variantes disponibles:** `--primary`, `--secondary`, `--ghost`, `--danger`, `--sm`, `--lg`, `--icon`

**Tokens Level 2 overrideados** (en `.bp-header .bp-btn--primary`):
| Token | Nuestro valor | Por qué |
|---|---|---|
| `--btn-bg` | `var(--ak-accent)` | CTA en accent vs --bp-primary del DS |
| `--btn-bg-hover` | `var(--ak-accent-hover)` | Hover oscurecido del accent |

---

## Cómo agregar un nuevo componente DS

1. Busca el componente en `https://ds.bepartnerlabs.com/components/<name>/`
2. Copia el markup canónico verbatim
3. Identifica qué tokens Level 2 necesitan override comparando los defaults del DS con el diseño
4. Declara solo esos overrides en el CSS del componente padre (ej. `.bp-header .bp-card { --card-bg: ... }`)
5. No uses `--ak-*` directamente en propiedades CSS de componentes DS — siempre canaliza por Level 2

---

## Archivos clave del proyecto

| Archivo | Responsabilidad |
|---|---|
| `src/app/(frontend)/frontend.css` | Level 1 `--bp-*` reimplementados + `--ak-*` brand tokens |
| `src/Header/header.css` | Level 2 overrides para el header y su nav |
| `src/Header/Nav/megamenu.css` | Estilos del panel megamenu |
| `src/Header/MobileMenu/mobile-menu.css` | Mobile sheet + hamburger |
