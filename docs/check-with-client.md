# Check with client

Preguntas abiertas que **solo el cliente puede responder**, y decisiones ya
tomadas con su fecha. No es una lista de tareas nuestras: para eso está
[`post-release-admin.md`](post-release-admin.md), que es lo que hay que hacer a
mano en `/admin` para que el código desplegado aparezca.

La diferencia importa. Ahí va *lo que tenemos que hacer*; acá va *lo que no
podemos decidir sin ellos*.

Cada entrada dice qué está bloqueado por no tener la respuesta, para que en la
llamada se pueda priorizar en vez de leer una lista plana.

## Abiertas

### Registro: usted / tú / vos

`docs/business/voice-and-tone.md` está en esqueleto. Sin esta definición, todo
copy en español se escribe evitando el imperativo — "Cada una tiene su página" en
vez de "Entrá a cada una" — que es correcto pero limita la redacción.

**Bloquea:** nada hoy. Los textos actuales están escritos para sobrevivir a
cualquiera de las tres respuestas, deliberadamente. **Si se responde, ningún
texto existente hay que rehacerlo.**

### Audiencia de `/machines`

`docs/business/audiences.md` lista brands / venues / agencies, pero están leídas
del código, no confirmadas. Sin brief, el copy del listado de máquinas se escribe
defensivo: habla de qué hace mejor cada línea en vez de hablarle a una audiencia.

**Bloquea:** que el copy de `/machines` pueda ser específico. Hoy funciona para
las tres y no destaca para ninguna. La respuesta honesta al ítem de audiencia del
Definition of Done es hoy *"no se puede determinar — no existe brief"*.

### La característica destacada de Kappa

Las cinco familias tienen cuatro características cada una, y en cada familia una
puede marcarse como destacada. **Kappa es la única sin marcar**, así que cae al
respaldo y muestra la primera de la lista, "Integrated refrigeration".

Es el texto que responde "en qué se distingue Kappa", y puede que la primera de
la lista no sea la respuesta que quieren dar.

**Bloquea:** nada — el respaldo funciona. Pero la fila cuya única función es
diferenciar la línea puede estar mostrando algo que no la diferencia.

### El recorte de los cinco renders de familia

Los thumbnails son PNG cuadrados de 1920×1920 donde la máquina ocupa entre 29% y
53% del ancho; el resto es transparencia. Cualquier tratamiento visual donde la
máquina toque un borde depende de recortarlos.

Tres cosas que el cliente tiene que saber antes de aprobarlo:

- Se hace desde `/admin` sin re-exportar, pero **es destructivo**: reemplaza el
  archivo y el original no queda en Payload. Se recupera desde el Shared Folder
  de Drive, no revirtiendo un despliegue.
- **El mismo archivo alimenta la escena animada** del comienzo de `/machines`,
  calibrada contra el margen que hoy tienen esos archivos.
- Solo se puede hacer en producción.

**Bloquea:** el tratamiento visual donde la máquina se sale de su tarjeta.

### Las etiquetas de botón por familia

Cada familia tiene hoy su propia etiqueta — "Explore our Alpha Models",
"Explore our Gamma Models"— y son específicas y buenas. Existe además una
etiqueta general del bloque que hoy nunca se usa, porque la de la familia siempre
gana.

**La pregunta:** ¿se mantienen las cinco propias, o se unifican en una sola? Se
recomienda mantenerlas: son más específicas y dicen a dónde llevan.

**Bloquea:** nada. Se documenta para que nadie las vacíe creyendo que sobran.

## Decididas

| Fecha | Pregunta | Respuesta |
|---|---|---|
| 2026-08-21 | Una familia sin modelos publicados (hoy Delta): ¿se oculta, se muestra con cero, o "Próximamente"? | **"Próximamente"**, derivado del conteo real. Se apaga solo cuando se publique el primer modelo. El botón sigue entrando a la familia, porque esa página tiene su hero y sus características |

## Cómo se agrega una entrada

Cualquiera de las sesiones que trabaja en el proyecto puede sumar una. La regla es
que sea **genuinamente del cliente**: si la puede responder alguien del equipo
leyendo el código, no va acá.

Cada entrada: qué se pregunta, por qué no la podemos responder nosotros, y qué
queda bloqueado sin la respuesta. Cuando se responde, se mueve a la tabla de
decididas con su fecha — que la pregunta desaparezca sin registro es cómo la
misma discusión vuelve a los seis meses.
