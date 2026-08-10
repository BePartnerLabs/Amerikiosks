#!/usr/bin/env bash
# Restores /tmp/prod_dump.sql (from dump-prod.sh) into the local dev database,
# overwriting it. Backs up the current local database first so it can be
# restored if something goes wrong.
#
# Usage: ./scripts/restore-prod-dump.sh
set -euo pipefail

CONTAINER="website_postgres_1"
PG_USER="payload"
LOCAL_DB="amerikiosks"
DUMP_PATH="/tmp/prod_dump.sql"
BACKUP_PATH="/tmp/local_backup_$(date +%Y%m%d_%H%M%S).sql"

if ! podman exec "$CONTAINER" test -f "$DUMP_PATH"; then
  echo "Error: $DUMP_PATH not found in pod $CONTAINER. Run ./scripts/dump-prod.sh first." >&2
  exit 1
fi

# `dropdb` falla si la base tiene aunque sea UNA conexión abierta, y con
# `set -e` el script muere justo después de haber hecho el backup — lo que deja
# un local_backup_*.sql recién creado y la base intacta. Parece que funcionó y
# no funcionó: exactamente así perdimos un rato el 2026-08-09, creyendo que
# teníamos un restore de producción cuando seguíamos con la base de antes.
#
# Casi siempre la conexión es `pnpm dev`, que mantiene su pool abierto.
CONNECTIONS=$(podman exec "$CONTAINER" psql -U "$PG_USER" -d postgres -tAc \
  "SELECT count(*) FROM pg_stat_activity WHERE datname = '$LOCAL_DB';" 2>/dev/null || echo 0)

if [ "${CONNECTIONS:-0}" -gt 0 ]; then
  echo
  echo "Hay $CONNECTIONS conexion(es) abierta(s) contra $LOCAL_DB."
  echo "Casi seguro es el dev server (pnpm dev), que mantiene su pool abierto."
  echo "Postgres se niega a borrar una base en uso, asi que el restore fallaria."
  echo
  read -r -p "Cerrar esas conexiones y continuar? [y/N] " REPLY
  case "$REPLY" in
    [yY]*)
      podman exec "$CONTAINER" psql -U "$PG_USER" -d postgres -c \
        "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$LOCAL_DB' AND pid <> pg_backend_pid();" \
        > /dev/null
      echo "Conexiones cerradas. Si tenias el dev corriendo, va a reconectar solo —"
      echo "paralo antes de seguir o volvera a tomar la base a mitad del restore."
      ;;
    *)
      echo "Cancelado. Para el dev server y vuelve a correr el script." >&2
      exit 1
      ;;
  esac
fi

echo "Respaldando la base local $LOCAL_DB en $BACKUP_PATH por si algo falla..."
echo "Para ver el estado en otra terminal: podman logs -f $CONTAINER"
podman exec "$CONTAINER" pg_dump -U "$PG_USER" --no-owner --no-privileges -f "$BACKUP_PATH" "$LOCAL_DB"
echo "Backup local guardado en el pod $CONTAINER, path $BACKUP_PATH"

podman exec "$CONTAINER" dropdb -U "$PG_USER" "$LOCAL_DB"
podman exec "$CONTAINER" createdb -U "$PG_USER" "$LOCAL_DB"

echo "Restaurando dump de prod. Para ver el estado en otra terminal:"
echo "  podman exec $CONTAINER psql -U $PG_USER -d $LOCAL_DB -c \"SELECT count(*) FROM pg_stat_activity WHERE datname = '$LOCAL_DB';\""
podman exec "$CONTAINER" psql -U "$PG_USER" -d "$LOCAL_DB" -f "$DUMP_PATH" -v ON_ERROR_STOP=1

echo "Dump de prod restaurado en la base local $LOCAL_DB dentro del pod $CONTAINER"
echo "Si algo salio mal, restaura el backup con:"
echo "  podman exec $CONTAINER dropdb -U $PG_USER $LOCAL_DB && podman exec $CONTAINER createdb -U $PG_USER $LOCAL_DB && podman exec $CONTAINER psql -U $PG_USER -d $LOCAL_DB -f $BACKUP_PATH"
