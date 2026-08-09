# Tasks

Orden por dependencia, no por tamaño. Nada de esto está empezado.

## 1. Estructura mínima, sin cambiar nada visible

- [ ] 1.1 Pestañas en `src/collections/Machines/index.ts` — Hero / Machine details / Content / SEO. **Los campos no cambian de nombre**, solo se agrupan; verificar que la migración generada no toque datos.
- [ ] 1.2 Campo `layout` (`type: 'blocks'`) en la pestaña Content, con el juego de bloques propio de `machines`.
- [ ] 1.3 `RenderMachineBlocks({ machine, blocks })` — pasa el documento hacia abajo; ningún bloque recibe contenido por props.
- [ ] 1.4 **El respaldo**: si `layout` está vacío, la ruta renderiza el orden fijo actual. Con test — es lo que evita diez páginas en blanco.
- [ ] 1.5 Test de que `GATED_PATHS=/machines` sigue ocultando la sección.

## 2. Bloques que leen su propio documento

Cada uno: `config.ts` sin campos de datos (solo presentación), `Component.tsx` que lee el campo homónimo, `README.md` con la DoD, y test de que **no renderiza nada cuando su campo está vacío**.

- [ ] 2.1 `machineHighlights` → `machine.highlights`
- [ ] 2.2 `machineCapabilities` → `machine.capabilities` + `machine.gallery`
- [ ] 2.3 `machineGallery` → `machine.gallery`
- [ ] 2.4 `machineDimensions` → `machine.dimensionDiagrams` + `machine.dimensions`
- [ ] 2.5 `machineSpecs` → `machine.specs`
- [ ] 2.6 `relatedMachines` — envolver el componente que ya existe
- [ ] 2.7 `cta` — reutilizar el de `Pages` tal cual, sin duplicar

Los cinco primeros son portes de secciones que ya existen en `[slug]/page.tsx`; el trabajo real es quitarles el contenido de las props y dejar que lean el documento.

## 3. El hero

- [ ] 3.1 `machineHero` con la variante actual (zoom + fade)
- [ ] 3.2 Retirar `useRotationHero` una vez el bloque cubra las dos variantes — **no antes**, y comprobando qué máquinas lo tienen activo hoy
- [ ] 3.3 Variante de rotación por fotogramas — **bloqueada** hasta cerrar el presupuesto de peso

## 4. Rotación por fotogramas (bloqueada)

Hereda `openspec/changes/machine-frame-sequences/design.md`. No empezar sin 4.1.

- [ ] 4.1 **Presupuesto: menos de 500 KB por fotograma.** Decidido, no a estimar. Hoy son 1,3 MB, así que hace falta un factor de ~2,6× — alcanzable con WebP o AVIF a ~1200px. Aun así, 70 × 500 KB son **35 MB por secuencia**, que sigue siendo mucho para una página: ver 4.1b.
- [ ] 4.1b **Cuántos fotogramas de verdad.** El presupuesto por imagen no basta si la secuencia es larga. Medir con 36 fotogramas (10° por paso) antes de asumir 70 — el spike usó 70 porque es lo que exportó Blender, no porque se necesiten. Menos fotogramas es la palanca más barata de todas.
- [ ] 4.2 Decidir carpetas en `Media` frente a colección propia — el argumento nuevo es que 70 imágenes por máquina inundan el explorador de Media del cliente.
- [ ] 4.3 Quién renombra `10001.png` → `frame-001.png`: convención más flexible, script, o a mano.
- [ ] 4.4 Puntero a carpeta + número de fotogramas, con carpetas inmutables versionadas.
- [ ] 4.5 Hook `beforeValidate` que compruebe que la carpeta contiene los fotogramas declarados **y que ninguno pase de 500 KB** — el error en el guardado, no en la página. Un presupuesto que no se comprueba es una intención.
- [ ] 4.6 Portar los tres arreglos del spike `958d000`: dibujar en el primer fotograma, `onerror` que resuelve, `devicePixelRatio`.
- [ ] 4.7 Fondo navy y `contain` — las máquinas son recortes blancos y desaparecen sobre claro.

## 5. Contenido y cierre

- [ ] 5.1 Componer las diez máquinas en `/admin`, con el gate todavía puesto
- [ ] 5.2 Retirar el respaldo y el orden fijo de `[slug]/page.tsx` — **antes de levantar `GATED_PATHS`**, no después
- [ ] 5.3 `docs/CLIENT-MANUAL.md`: qué bloques existen y qué hace cada uno
- [ ] 5.4 Sección **Production setup** en el README de cada bloque

## Riesgos anotados

- **`specs` y `dimensions` no se mueven.** `SpecsCompare` los cruza entre modelos y `machineModels` los emite como `PropertyValue`. Un dato dentro de un `layout` deja de ser consultable.
- **Sin `generateStaticParams`.** Tumbó `/machines/[family]` en producción una vez.
- **El gate oculta, no protege** — comprueba que exista una cookie, y una cookie se fabrica.
