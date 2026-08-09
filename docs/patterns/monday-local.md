---
title: Monday.com en local
read_when: Tocando Monday o cualquier formulario, y siempre después de restaurar un dump de producción.
enforced_by: parcialmente — el mock exige NODE_ENV=development, pero nada impide olvidar el paso 3
---

# Monday.com en local

**Si tocas Monday o los formularios, pruébalo contra el sandbox.** Existe una cuenta de sandbox propia (Bepartnerlabs) con boards `[LAB] …` que replican los de producción. Su token va en `MONDAY_API_TOKEN` de `.env.local`, y `resolveMondayToken` le da prioridad fuera de producción — importante, porque una base local restaurada de producción trae el token **del cliente** en Settings.

Flujo completo, tres scripts independientes:

```bash
./scripts/dump-prod.sh                        # trae el dump al pod
./scripts/restore-prod-dump.sh                # lo restaura en la base local
node scripts/move-monday-to-sandbox.mjs       # muestra el plan
node scripts/move-monday-to-sandbox.mjs --apply
MONDAY_LIVE=true                              # en .env.local, para enviar de verdad
```

El tercero es obligatorio después de cada restore: el dump trae los board ids, group ids y el mapeo de columnas **del cliente**, así que un envío local con el mock apagado crearía un item real en un board que el equipo comercial lee. El script los reescribe a los `[LAB]`, resolviendo boards y columnas por *nombre* (no por id, para que sobrevivan a que se recreen), y se niega a correr si el token puede ver un board de producción. Es idempotente.

**El mock sigue siendo el valor por defecto.** Sin `MONDAY_LIVE=true`, con `NODE_ENV=development` ninguna llamada sale de la máquina: `src/repositories/mondayMock.ts` intercepta y escribe el payload en consola con el prefijo `[monday:mock]`, devolviendo un id falso. Cubre los dos caminos, que comparten API y token:

- `GenericMondayRepository` — el sync de formularios (`create_item`, `add_file_to_column`).
- `MondayRepository` — los claims de reembolso del `ClaimForm`.

Sirve para ver el cuerpo exacto que se enviaría sin depender de la red. Lo que no comprueba es que Monday lo **acepte** — tipos de columna, adjuntos, autenticación —; para eso está el sandbox. En producción nada de esto aplica: el guard exige `NODE_ENV === 'development'`.

Los items que crees en el sandbox son reales dentro de esa cuenta: bórralos al terminar (`mutation { delete_item(item_id: N) { id } }`).
