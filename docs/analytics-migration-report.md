# Informe de analítica y migración — pre relanzamiento

> Análisis de Google Analytics del sitio WordPress actual (10 jun – 7 jul 2026) más auditoría en vivo del formulario de reclamos, hecho para decidir alcance del sitio nuevo y dejar un punteo de qué falta resolver antes y después del pase a producción. Ver también el reporte visual: artifact `amerikiosks-analytics-report.html`.

## Contexto

- Hoy solo está instalado el tag base de GA4 en WordPress, sin dataLayer ni eventos custom. Este informe tiene los límites que eso implica (sin conversiones medidas, sin baseline histórico).
- Existe una campaña de redes en curso; el objetivo declarado es que el sitio nuevo incremente visitas.
- `/customer-service/` y `/customer-service/request-a-refund/` reciben tráfico principalmente vía **QR físico impreso junto a cada máquina**.
- El plan es reemplazar la integración actual (JotForm) por un formulario propio en Payload con hook server-side hacia un **REST API custom de Odoo**.

## Hallazgos clave (28 días, 10 jun–7 jul 2026)

- 640 usuarios activos, 629 nuevos (98.3%) — casi no hay retención, patrón plano durante las 4 semanas.
- 843 sesiones. Fuente: Direct 65.8%, Organic Search 22.9%, Referral 7%, Unassigned 4.15%, Organic Social 2.14%.
- **El "Direct" no es tráfico de marca**: el 100% cae en `(direct) / (none)` — consistente con escaneos de QR (sin referrer HTTP). Explica también el bajo engagement de `/customer-service/` (6–7s): es tráfico de tarea puntual.
- **La campaña de redes casi no aparece todavía**: solo 18 sesiones de Organic Social, ninguna con `utm_campaign` — GA las detecta solo por dominio de referencia (instagram.com/referral, facebook.com/referral, l.instagram.com/referral).
- Sin línea base histórica (comparación interanual en 0) — no se puede calcular % de crecimiento atribuible a la campaña, solo describir el estado actual.
- `/customer-service/request-a-refund/` es la 3ª página más vista del sitio (169 vistas, 102 usuarios) — el módulo de reclamos tiene demanda real.
- Dispositivo: ~53% desktop / ~47% mobile — Core Web Vitals mobile importa igual que desktop.

## Auditoría en vivo del formulario de reclamos actual

Formulario recorrido y enviado con datos de prueba (BePartnerLabs) en `amerikiosks.com/customer-service/request-a-refund/`.

**Es un iframe de JotForm.** Se puede dejar embebido tal cual en una v1 del sitio nuevo, sin bloquear el lanzamiento a que Odoo esté listo — la integración nativa puede llegar en una segunda fase.

- **Iframe src:** `https://form.jotform.com/form/230405763622148`
- **Form ID:** `230405763622148` (confirmado también en el header `X-Related-FormID` y `Feedback-ID: 230405763622148:autorespond:jotform` del email de confirmación)
- **Integración pre-Odoo:** embeber el mismo `<iframe src="https://form.jotform.com/form/230405763622148" ...>` en la página nueva de `/customer-service/request-a-refund/` — cero cambios de backend, JotForm sigue mandando la copia por email a `cs@amerikiosks.com` como hoy. Reemplazar por el form nativo + hook a Odoo en la fase 2, sin urgencia de coordinarlo con el cutover del sitio.

### Los 11 campos, en orden

| # | Campo | Tipo | Detalle |
|---|-------|------|---------|
| 1 | Kiosk Branding | Radio, obligatorio | Carlo's Bakery / Pharmabox by CVS / Fan Stand / iStore / Refreshments / Snacks / Wellness |
| 2 | Payment Method | Select, obligatorio | Credit/Debit Card / Cash |
| 3 | Name | First + Last, obligatorio | |
| 4 | Email | Email, obligatorio | Usado para copia de confirmación |
| 5 | Phone Number | Teléfono, obligatorio | Con validación de formato |
| 6 | Date and Time of the transaction | Fecha + hora, obligatorio | Prellenado con el momento actual |
| 7 | Ubicación del problema | Texto libre, obligatorio | "State, City, and Name of the property" en un solo campo sin estructura |
| 8 | What happened? | Select, obligatorio | Only part of my order was dispensed / The product was damaged / I received the wrong product / I didn't receive my product |
| 9 | Additional Information | Textarea, opcional | "¿Qué producto intentabas comprar? ¿Mensaje en pantalla?" |
| 10 | Last 4 digits of the card | Numérico, obligatorio | |
| 11 | Attach a picture | Archivo, opcional | Máx. 10.6MB |

**Confirmación:** "Thank You, [Nombre]! We will review the information provided and process the refund in the next 48 to 72 hours." — mantener o actualizar este SLA en el nuevo form.

### Defecto confirmado (verificado por email real)

El correo de confirmación (`noreply@jotform.com`, asunto "Your Refund Request Was Received", Reply-To `cs@amerikiosks.com`) llega con **5 de los 11 campos mostrando literalmente "Type a question"** en vez de la etiqueta real: Kiosk Branding, Payment Method, ubicación, "What happened" y la información adicional. Solo Name, Email, Phone, Date y los últimos 4 dígitos tienen etiqueta correcta. Quien procesa reclamos hoy recibe más de la mitad de los datos sin saber a qué pregunta corresponden. Corregir de raíz en el módulo nuevo.

### Implicaciones para el schema de `claims` en Payload

- Necesita un campo de **marca/línea de kiosco** (Kiosk Branding confirma que Amerikiosks opera múltiples marcas sobre la misma red de máquinas), no solo "tipo de máquina".
- Estructurar el campo de **ubicación** en 3 campos (state / city / property) o un selector de propiedad, en vez de texto libre sin parsear — para que Odoo reciba datos limpios.

## Migración de páginas

De 32 URLs activas en WordPress, 12 concentran el tráfico real.

### Riesgo más alto: URLs con QR impreso

`/customer-service/` y `/customer-service/request-a-refund/` están impresas en QR físicos en campo. **Si el sitio nuevo cambia esa ruta sin dejar un redirect 301 activo desde el minuto uno del cutover, cada máquina desplegada queda con un código roto** hasta reimprimir el sticker. Mantener la misma ruta o probar el redirect con un teléfono real antes de apagar WordPress.

### Migrar tal cual

`/`, `/customer-service/`, `/customer-service/request-a-refund/`, `/services-we-offer/`, `/automated-system-models/`, `/contact/`, `/our-story/`, `/automated-systems/`, `/start-creating-your-first-automated-kiosk/`, `/develop-your-kiosks/`, `/get-the-most-innovative-kiosk-in-your-properties/`, `/news/`.

### Redirigir (301) — no migrar contenido

| URL actual | Redirigir a | Motivo |
|---|---|---|
| `/our-history`, `/our-history/` | `/our-story/` | Duplicado sin slash de página ya migrada |
| `/contact-minimal/`, `/contact-page-builder/` | `/contact/` | Variantes viejas de page-builder |
| `/contact-old/london-office/`, `/contact-old/reykjavik-office/` | `/contact/` | Oficinas que ya no aplican |
| `/cart/`, `/my-account/` | `/` | Resto de e-commerce (WooCommerce) sin uso |
| `/shop/` | `/services-we-offer/` | Resto de e-commerce |
| `/collections` | `/automated-system-models/` | Resto de e-commerce — catálogo real |
| `/2022/05/post-9/`, `/2023/02/hello-world/` | `/news/` | Posts viejos, 1 vista/mes |
| `/2023/02/the-fan-stand/` | `/news/` | 2 vistas/mes — evaluar si migrar a `insights` antes de redirigir |

Ninguna de estas 13 URLs superó las 3 vistas en 28 días.

## Contenido actual de páginas clave (referencia para el sitio nuevo)

- **`/` (Home):** Hero "Start your automated retail business today" → "Who we are" (partner end-to-end, +12 estados de EE.UU., propiedad de Pharmabox) → "Our Automated Systems" (pantalla táctil 22", hasta 1,300 productos) → "Why Choose Automated Retail" (beneficios retailer / in-store) → CTA a Services.
- **`/services-we-offer/`:** 5 bloques (Development, Management, Logistics, Refill/Replenishment, Branding and Design) + resumen "What We Provide" en 10 bullets. Candidato a varios blocks del layout builder en vez de una sola página de texto corrido.
- **`/contact/`:** Teléfono, email (info@amerikiosks.com), HQ en Doral FL, horario L–V 9am–5pm. Mejor engagement del sitio (43s).
- **`/customer-service/`:** Hub con 4 opciones (Request a refund, Call Us, Text Us, WhatsApp). Nota: horario de agente en vivo L–V 9am–5pm EST, con aviso de que algunas ubicaciones ofrecen 24/7 — reflejar esta variabilidad por ubicación si aplica.

Pendiente de auditar con el mismo detalle: `/automated-system-models/`, `/our-story/`, `/automated-systems/`, y las 3 páginas de conversión (`start-creating-your-first-automated-kiosk`, `develop-your-kiosks`, `get-the-most-innovative-kiosk-in-your-properties`).

## Instrumentación pendiente (dataLayer/GTM en el refactor)

- **Evento `form_submit`** en el form de reclamos, marcado como key event en GA4 — mide intención/conversión.
- **Evento server-side de éxito/error del push a Odoo** — no es una métrica de GA4/audiencia, sino de salud de sistema: log/tabla en Payload (`odooSynced: boolean`, `odooError: string | null`, timestamp), visible en admin o dashboard simple.
- **Convención de UTM** acordada con marketing (`utm_source`, `utm_medium`, `utm_campaign`) para que el tráfico de campaña deje de caer en "Unassigned"/"Direct" sin atribución.
- Sin línea base histórica: cada semana sin instrumentar antes del cutover es baseline perdida para medir el impacto real del sitio nuevo.

## Próximos pasos sugeridos post pase a producción

1. Confirmar con marketing la convención de UTM antes de la próxima publicación de campaña.
2. Decidir si el form de reclamos lanza v1 con el iframe de JotForm o ya con el form nativo de Payload (recomendado: JotForm en v1 para no bloquear el lanzamiento por Odoo).
3. Configurar y **probar en campo** (con un QR real) el redirect 301 de las rutas de customer-service antes de apagar WordPress.
4. Implementar los redirects de la tabla de migración en `next.config.ts` o vía Payload.
5. Instrumentar `form_submit` como key event y el log de salud de Odoo en cuanto el form nativo esté listo.
6. Auditar contenido de las páginas pendientes (`/automated-system-models/`, `/our-story/`, `/automated-systems/`, páginas de conversión) antes de redactar el contenido final en Payload.
7. Revisar con Amerikiosks si el defecto de etiquetas rotas en el email de JotForm debe corregirse mientras siga en uso (v1), independientemente de la migración a Odoo.
